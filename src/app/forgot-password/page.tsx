"use client";

import React, { useState, FormEvent, FC } from 'react';
import { useTranslation } from "react-i18next";

const ForgotPasswordPage: FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Basic email validation
    if (!email) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/forgot/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // If the response is not OK (e.g., 4xx or 5xx status), handle it as an error.
      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        try {
          // Try to parse the error response as JSON.
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If the error response isn't valid JSON, use the status text as a fallback.
          // This prevents the "Unexpected end of JSON input" error.
          console.error("Could not parse error response as JSON:", jsonError);
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // On success, display a confirmation message. We don't need to parse the body
      // if the request was successful.
      setSuccessMessage('If an account with that email exists, a password reset link has been sent.');
      setEmail(''); // Clear the input field

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Forgot password request failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">
          {t('forgot_password_page.title')}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {t('forgot_password_page.description')}
        </p>

        {/* Success Message */}
        {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline">{successMessage}</span>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Form is hidden after successful submission */}
        {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('forgot_password_page.email')}
                </label>
                <div className="mt-1">
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgot_password_page.email_placeholder')}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none transition-all duration-300 ease-in-out
                    focus:border-blue-500 
                    focus:ring-4 
                    focus:ring-blue-500/20 
                    focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                />
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 font-semibold transition disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
                >
                {loading ? 'Sending...' : t('forgot_password_page.submit_button')}
                </button>
            </div>
            </form>
        )}

        <div className="text-center mt-6">
            <a href="/sign-in" className="font-medium text-sm text-indigo-600 hover:text-indigo-500">
                {t('forgot_password_page.back_to_sign_in')}
            </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;