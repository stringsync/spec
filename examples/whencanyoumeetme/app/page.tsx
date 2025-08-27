import React from 'react';

// Geometric Art Component
const GeometricArt = () => (
  <div className="relative w-full h-full">
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large orange shape */}
      <path
        d="M50 150 Q200 50 350 150 Q300 250 150 200 Q100 180 50 150 Z"
        fill="#d4956b"
        opacity="0.9"
      />
      {/* Smaller beige shape */}
      <ellipse cx="180" cy="120" rx="80" ry="60" fill="#e8d5c4" opacity="0.8" />
    </svg>
  </div>
);

// Pendant Lamp Component
const PendantLamp = () => (
  <div className="absolute left-8 top-12">
    <svg width="24" height="80" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cord */}
      <line x1="12" y1="0" x2="12" y2="50" stroke="#d4d4d4" strokeWidth="1" />
      {/* Lamp shade */}
      <path
        d="M4 50 Q4 45 8 45 L16 45 Q20 45 20 50 L18 65 Q18 70 14 70 L10 70 Q6 70 6 65 Z"
        fill="#e8d5c4"
        stroke="#d4d4d4"
        strokeWidth="0.5"
      />
    </svg>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Art Frame Section */}
          <div className="relative mb-12">
            <PendantLamp />

            {/* Frame */}
            <div className="bg-white rounded-lg shadow-lg p-6 mx-8">
              <div className="aspect-[4/3] bg-white border-4 border-neutral-100 rounded">
                <GeometricArt />
              </div>
            </div>

            {/* Shelf */}
            <div className="h-3 bg-warm-beige rounded-sm mx-4 -mt-1 shadow-sm"></div>
          </div>

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
