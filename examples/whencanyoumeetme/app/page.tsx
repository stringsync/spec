import React from 'react';
import { ArtFrameSection } from './components/ArtFrameSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Art Frame Section */}
          <ArtFrameSection />

          {/* Content Section */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                Schedule meetings in seconds
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed">
                No sign-up required. Just create and share your availability.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg">
                Get Started
              </button>

              <button className="w-full bg-transparent hover:bg-neutral-50 text-neutral-700 font-medium py-4 px-6 rounded-lg border border-neutral-200 transition-colors duration-200">
                Create Account
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-sm text-neutral-500 leading-relaxed pt-4">
              By continuing, you agree to our{' '}
              <a href="#" className="text-neutral-700 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-neutral-700 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
