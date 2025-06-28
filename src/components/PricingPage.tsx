import React, { useState, useEffect, useCallback } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, Sparkles, AlertCircle, Calendar, CreditCard, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscriptionManagement } from '../hooks/useSubscriptionManagement';
import { supabase } from '../lib/supabase';
import { StripeProduct, getSubscriptionProducts, validateStripeConfig } from '../stripe-config';

interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_name: string;
  plan_interval: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method_brand: string;
  payment_method_last4: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  days_until_renewal: number;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  popular?: boolean;
  enterprise?: boolean;
  stripeProduct?: StripeProduct;
  buttonText: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

interface SubscriptionNotification {
  type: 'upgrade' | 'downgrade' | 'reactivate' | 'cancel';
  fromPlan?: string;
  toPlan?: string;
  message: string;
}

const PricingPage: React.FC = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscriptionNotification, setSubscriptionNotification] = useState<SubscriptionNotification | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { authState, refreshUserData } = useAuth();
  const { updateSubscription, cancelSubscription, reactivateSubscription, loading: subscriptionManagementLoading } = useSubscriptionManagement();

  // Memoize fetchUserSubscription to prevent unnecessary re-renders
  const fetchUserSubscription = useCallback(async (isRetry = false) => {
    if (!authState.user) {
      setSubscriptionLoading(false);
      setUserSubscription(null);
      return;
    }

    try {
      if (!isRetry) {
        setSubscriptionLoading(true);
      }
      
      // Get the most recent active subscription for this user
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 results

      if (error) {
        console.error('Error fetching subscription:', error);
        setUserSubscription(null);
        return;
      }

      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setUserSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [authState.user?.id]);

  // Polling fallback for when WebSocket fails
  const startPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      if (authState.user && (loadingPlan || subscriptionManagementLoading)) {
        console.log('Polling for subscription updates...');
        await fetchUserSubscription(true);
      }
    }, 2000); // Poll every 2 seconds when operations are in progress

    return () => clearInterval(pollInterval);
  }, [authState.user, loadingPlan, subscriptionManagementLoading, fetchUserSubscription]);

  useEffect(() => {
    // Validate Stripe configuration
    const validation = validateStripeConfig();
    if (!validation.isValid) {
      setConfigError(validation.errors.join(', '));
    }

    // Initial fetch
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  // Set up real-time subscription updates with fallback
  useEffect(() => {
    if (!authState.user) return;

    let subscriptionChannel: any = null;
    let pollCleanup: (() => void) | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const setupRealtimeSubscription = () => {
      try {
        console.log('Setting up real-time subscription for user:', authState.user?.id);
        
        // Subscribe to subscription changes for this user
        subscriptionChannel = supabase
          .channel(`subscription-changes-${authState.user?.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${authState.user?.id}`,
            },
            async (payload) => {
              console.log('Real-time subscription change:', payload);
              
              // Store previous subscription data for comparison
              const previousSubscription = userSubscription;
              
              // Refresh subscription data when changes occur
              await fetchUserSubscription(true);
              
              // Show notification for subscription changes
              if (payload.eventType === 'UPDATE' && previousSubscription && payload.new && payload.old) {
                const newData = payload.new as any;
                const oldData = payload.old as any;
                
                // Check if this is a plan change (price_id changed)
                if (oldData.stripe_price_id !== newData.stripe_price_id) {
                  const oldPlan = oldData.plan_name;
                  const newPlan = newData.plan_name;
                  const oldAmount = oldData.amount_cents;
                  const newAmount = newData.amount_cents;
                  
                  if (newAmount > oldAmount) {
                    // Upgrade
                    setSubscriptionNotification({
                      type: 'upgrade',
                      fromPlan: oldPlan,
                      toPlan: newPlan,
                      message: `Successfully upgraded from ${oldPlan} to ${newPlan} plan!`
                    });
                  } else if (newAmount < oldAmount) {
                    // Downgrade
                    setSubscriptionNotification({
                      type: 'downgrade',
                      fromPlan: oldPlan,
                      toPlan: newPlan,
                      message: `Successfully switched from ${oldPlan} to ${newPlan} plan!`
                    });
                  }
                  
                  // Auto-hide notification after 5 seconds
                  setTimeout(() => {
                    setSubscriptionNotification(null);
                  }, 5000);
                }
                
                // Check if cancel_at_period_end changed
                if (oldData.cancel_at_period_end !== newData.cancel_at_period_end) {
                  if (newData.cancel_at_period_end) {
                    setSubscriptionNotification({
                      type: 'cancel',
                      message: `Your ${newData.plan_name} subscription will be canceled at the end of the current billing period.`
                    });
                  } else {
                    setSubscriptionNotification({
                      type: 'reactivate',
                      message: `Your ${newData.plan_name} subscription has been reactivated!`
                    });
                  }
                  
                  // Auto-hide notification after 5 seconds
                  setTimeout(() => {
                    setSubscriptionNotification(null);
                  }, 5000);
                }
              }
              
              // Also refresh user data to ensure everything is in sync
              await refreshUserData();
            }
          )
          .subscribe((status) => {
            console.log('Subscription channel status:', status);
            
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to real-time updates');
              setRetryCount(0);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('Real-time subscription failed, falling back to polling');
              
              // Start polling as fallback
              if (!pollCleanup) {
                pollCleanup = startPolling();
              }
              
              // Retry connection after a delay
              if (retryCount < 3) {
                reconnectTimeout = setTimeout(() => {
                  console.log(`Retrying real-time connection (attempt ${retryCount + 1})`);
                  setRetryCount(prev => prev + 1);
                  setupRealtimeSubscription();
                }, 5000 * (retryCount + 1)); // Exponential backoff
              }
            } else if (status === 'CLOSED') {
              console.log('Real-time subscription closed');
              
              // Start polling as fallback
              if (!pollCleanup) {
                pollCleanup = startPolling();
              }
            }
          });

      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        
        // Start polling as fallback
        if (!pollCleanup) {
          pollCleanup = startPolling();
        }
      }
    };

    // Initial setup
    setupRealtimeSubscription();

    // Always start polling as a backup
    pollCleanup = startPolling();

    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
      if (pollCleanup) {
        pollCleanup();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [authState.user?.id, fetchUserSubscription, refreshUserData, startPolling, retryCount]);

  // Get subscription products
  const subscriptionProducts = getSubscriptionProducts();

  // Create plans from Stripe products
  const plans: PricingPlan[] = [
    // Basic Plan
    ...subscriptionProducts
      .filter(product => product.name === 'Basic')
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price / 100, // Convert from cents
        period: product.interval || 'month',
        description: product.description,
        features: product.features,
        icon: Zap,
        stripeProduct: product,
        buttonText: getButtonText(product, userSubscription),
        gradient: 'from-blue-500 to-blue-600',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      })),
    
    // Pro Plan
    ...subscriptionProducts
      .filter(product => product.name === 'Pro')
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price / 100, // Convert from cents
        period: product.interval || 'month',
        description: product.description,
        features: product.features,
        icon: Crown,
        popular: product.popular,
        stripeProduct: product,
        buttonText: getButtonText(product, userSubscription),
        gradient: 'from-orange-500 to-orange-600',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
      })),
    
    // Enterprise Plan (custom)
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      period: 'custom',
      description: 'Tailored solutions for large organizations and teams',
      features: [
        'Unlimited access to all startup ideas',
        'Custom idea generation based on your industry',
        'Dedicated account manager',
        'White-label solutions',
        'API access for integrations',
        'Custom reporting and analytics',
        'Team collaboration tools',
        'Priority phone support',
        'Custom training and onboarding'
      ],
      icon: Building2,
      enterprise: true,
      buttonText: "Contact Sales",
      gradient: 'from-gray-500 to-gray-600',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  ];

  function getButtonText(product: StripeProduct, subscription: UserSubscription | null): string {
    if (!subscription) {
      return `Start ${product.name} Plan`;
    }

    // Check if this is the current plan (match by price ID for accuracy)
    if (subscription.stripe_price_id === product.priceId) {
      if (subscription.cancel_at_period_end) {
        return 'Reactivate Plan';
      }
      return 'Current Plan';
    }

    // Check if it's an upgrade or downgrade based on price
    const currentPlanPrice = subscription.amount_cents;
    const targetPlanPrice = product.price;

    if (targetPlanPrice > currentPlanPrice) {
      return `Upgrade to ${product.name}`;
    } else if (targetPlanPrice < currentPlanPrice) {
      return `Downgrade to ${product.name}`;
    } else {
      // Same price, different interval
      return `Switch to ${product.interval}ly`;
    }
  }

  function isCurrentPlan(plan: PricingPlan): boolean {
    if (!userSubscription || !plan.stripeProduct) return false;
    return userSubscription.stripe_price_id === plan.stripeProduct.priceId;
  }

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.enterprise) {
      // Handle enterprise contact
      window.open('mailto:enterprise@ossideas.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    if (!authState.user) {
      // Show login modal or redirect to login
      alert('Please sign in to purchase a plan');
      return;
    }

    if (!plan.stripeProduct) {
      alert('This plan is not available for purchase yet');
      return;
    }

    // Clear any previous messages
    setCheckoutError(null);
    setSuccessMessage(null);
    setSubscriptionNotification(null);

    // If user has an active subscription, handle plan changes
    if (userSubscription && userSubscription.is_active) {
      // If this is the current plan and canceled, handle reactivation
      if (isCurrentPlan(plan) && userSubscription.cancel_at_period_end) {
        setLoadingPlan(plan.id);
        try {
          const result = await reactivateSubscription(userSubscription.stripe_subscription_id);
          if (result.success) {
            setSuccessMessage(result.message || 'Subscription reactivated successfully!');
            // Refresh subscription data after a short delay
            setTimeout(() => fetchUserSubscription(true), 1000);
          } else {
            setCheckoutError(result.error || 'Failed to reactivate subscription');
          }
        } catch (error) {
          setCheckoutError('Failed to reactivate subscription');
        } finally {
          setLoadingPlan(null);
        }
        return;
      }

      // If this is the current plan and not canceled, don't allow action
      if (isCurrentPlan(plan) && !userSubscription.cancel_at_period_end) {
        return;
      }

      // Handle plan change (upgrade/downgrade)
      if (!isCurrentPlan(plan)) {
        setLoadingPlan(plan.id);
        try {
          console.log(`Updating subscription from ${userSubscription.stripe_price_id} to ${plan.stripeProduct.priceId}`);
          const result = await updateSubscription(userSubscription.stripe_subscription_id, plan.stripeProduct.priceId);
          if (result.success) {
            setSuccessMessage(result.message || 'Subscription updated successfully!');
            // Refresh subscription data after a short delay to allow webhook processing
            setTimeout(() => fetchUserSubscription(true), 2000);
          } else {
            setCheckoutError(result.error || 'Failed to update subscription');
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
          setCheckoutError('Failed to update subscription');
        } finally {
          setLoadingPlan(null);
        }
        return;
      }
    }

    // Handle new subscription creation
    setLoadingPlan(plan.id);

    try {
      console.log('Starting checkout for plan:', plan.name, 'Price ID:', plan.stripeProduct.priceId);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found. Please sign in again.');
      }

      const requestBody = {
        price_id: plan.stripeProduct.priceId,
        mode: 'subscription',
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/pricing`,
      };

      console.log('Sending checkout request:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Checkout response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout response error:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Checkout result:', result);

      if (result.url) {
        console.log('Redirecting to checkout:', result.url);
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCheckoutError(`Failed to start checkout: ${errorMessage}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription || !userSubscription.stripe_subscription_id) {
      return;
    }

    if (window.confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      try {
        const result = await cancelSubscription(userSubscription.stripe_subscription_id);
        if (result.success) {
          setSuccessMessage(result.message || 'Subscription canceled successfully!');
          // Refresh subscription data after a short delay
          setTimeout(() => fetchUserSubscription(true), 1000);
        } else {
          setCheckoutError(result.error || 'Failed to cancel subscription');
        }
      } catch (error) {
        setCheckoutError('Failed to cancel subscription');
      }
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'canceled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (subscription: UserSubscription) => {
    if (subscription.cancel_at_period_end) {
      return `Cancels on ${formatDate(subscription.current_period_end)}`;
    }
    
    switch (subscription.status) {
      case 'active':
        return `Renews on ${formatDate(subscription.current_period_end)}`;
      case 'trialing':
        return `Trial ends on ${formatDate(subscription.current_period_end)}`;
      case 'past_due':
        return 'Payment past due';
      case 'canceled':
        return 'Subscription canceled';
      default:
        return subscription.status;
    }
  };

  const getNotificationIcon = (type: SubscriptionNotification['type']) => {
    switch (type) {
      case 'upgrade':
        return TrendingUp;
      case 'downgrade':
        return TrendingDown;
      case 'reactivate':
        return Check;
      case 'cancel':
        return AlertCircle;
      default:
        return Check;
    }
  };

  const getNotificationColor = (type: SubscriptionNotification['type']) => {
    switch (type) {
      case 'upgrade':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'downgrade':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reactivate':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'cancel':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Subscription Change Notification */}
        {subscriptionNotification && (
          <div className={`border rounded-lg p-4 mb-8 max-w-4xl mx-auto ${getNotificationColor(subscriptionNotification.type)}`}>
            <div className="flex items-start space-x-3">
              {(() => {
                const Icon = getNotificationIcon(subscriptionNotification.type);
                return <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />;
              })()}
              <div className="flex-1">
                <h3 className="text-sm font-medium">
                  {subscriptionNotification.type === 'upgrade' && 'Plan Upgraded!'}
                  {subscriptionNotification.type === 'downgrade' && 'Plan Changed!'}
                  {subscriptionNotification.type === 'reactivate' && 'Subscription Reactivated!'}
                  {subscriptionNotification.type === 'cancel' && 'Subscription Canceled'}
                </h3>
                <p className="text-sm mt-1">{subscriptionNotification.message}</p>
              </div>
              <button
                onClick={() => setSubscriptionNotification(null)}
                className="text-current hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Configuration Error Alert */}
        {configError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Stripe Configuration Required</h3>
                <p className="text-sm text-red-700 mt-1">
                  Please update your Stripe price IDs in the configuration file: {configError}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Go to your Stripe Dashboard → Products → Create prices, then update src/stripe-config.ts with the real price IDs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-400 hover:text-green-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Checkout Error Alert */}
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{checkoutError}</p>
              </div>
              <button
                onClick={() => setCheckoutError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Choose Your Perfect Plan
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start your entrepreneurial journey with the right plan for your needs. 
            All plans include our core features with no hidden fees.
          </p>

          {/* Current Subscription Status - Only show if user is logged in and has a subscription */}
          {authState.user && !subscriptionLoading && userSubscription && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 max-w-6xl mx-auto shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userSubscription.plan_name} Plan
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(userSubscription.status)}`}>
                        {userSubscription.status === 'active' ? 'Active' : userSubscription.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {formatPrice(userSubscription.amount_cents / 100, userSubscription.currency)} per {userSubscription.plan_interval}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {getStatusText(userSubscription)}
                    </div>
                    {userSubscription.payment_method_brand && userSubscription.payment_method_last4 && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {userSubscription.payment_method_brand.toUpperCase()} ending in {userSubscription.payment_method_last4}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 space-x-2">
                  {userSubscription.cancel_at_period_end && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Ending Soon
                    </div>
                  )}
                  {userSubscription.is_active && !userSubscription.cancel_at_period_end && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={subscriptionManagementLoading}
                      className="px-3 py-1 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State for Subscription */}
          {authState.user && subscriptionLoading && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span className="text-gray-600">Loading subscription...</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const currency = plan.stripeProduct?.currency || 'USD';
            const isCurrentUserPlan = isCurrentPlan(plan);
            
            return (
              <div
                key={plan.id}
                className={`flex flex-col relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isCurrentUserPlan
                    ? 'border-orange-200 ring-4 ring-orange-100'
                    : plan.popular 
                    ? 'border-orange-200 ring-4 ring-orange-100' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                {/* Current Plan Badge */}
                {isCurrentUserPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Popular Badge */}
                {plan.popular && !isCurrentUserPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${plan.iconBg} rounded-2xl mb-4`}>
                      <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    {plan.enterprise ? (
                      <div>
                        <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                        <div className="text-gray-500">Tailored to your needs</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(plan.price, currency)}
                          </span>
                          {plan.period !== 'one-time' && (
                            <span className="text-gray-500 ml-2">/{plan.period}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.id || subscriptionManagementLoading || (isCurrentUserPlan && !userSubscription?.cancel_at_period_end)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isCurrentUserPlan && !userSubscription?.cancel_at_period_end
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular || isCurrentUserPlan
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`
                        : plan.enterprise
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {loadingPlan === plan.id || subscriptionManagementLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </>
                    ) : (
                      <>
                        <span>{plan.buttonText}</span>
                        {!(isCurrentUserPlan && !userSubscription?.cancel_at_period_end) && (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated and reflected immediately."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards through Stripe's secure payment processing."
              },
              {
                question: "Is there a free trial?",
                answer: "We offer a 7-day free trial for all paid plans. No credit card required to start your trial."
              },
              {
                question: "What happens if I cancel?",
                answer: "You can cancel anytime. You'll continue to have access to your plan features until the end of your billing period."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee for all subscription plans. One-time purchases are final but we're happy to help with any issues."
              },
              {
                question: "Can I get an invoice for my purchase?",
                answer: "Yes! You'll automatically receive an invoice via email after each payment. You can also download invoices from your account dashboard."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;