import React from 'react';
import { LogIn } from 'lucide-react';

interface SignInRequiredProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onSignInClick: () => void;
  onGoBack?: () => void;
}

const SignInRequired: React.FC<SignInRequiredProps> = ({
  title,
  description,
  icon: Icon,
  onSignInClick,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Icon className="h-8 w-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="space-y-4">
            <button
              onClick={onSignInClick}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              <LogIn className="h-5 w-5" />
              <span>Sign In to Continue</span>
            </button>
            
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInRequired;