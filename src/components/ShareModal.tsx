import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title || 'Check out this idea!',
        )}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url,
        )}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share Idea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Link Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share this link
            </label>
            <div className="flex">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-900 text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share on social media
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-950 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="text-sm font-medium">Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="text-sm font-medium">Facebook</span>
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
