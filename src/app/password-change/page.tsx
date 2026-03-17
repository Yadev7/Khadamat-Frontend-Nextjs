"use client";

import React, { useState, useEffect, FormEvent } from 'react';

// NOTE: The dependency on 'next/navigation' has been removed to make this 
// component runnable in a generic browser environment. The hash is now
// extracted from the URL using standard browser APIs.

export default function PasswordChangePage() {
  const [hash, setHash] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Extracts the 'hash' token from the URL query parameters using browser APIs
    const params = new URLSearchParams(window.location.search);
    const hashFromUrl = params.get('hash');
    
    if (hashFromUrl) {
      setHash(hashFromUrl);
    } else {
      setError("Invalid or missing password reset link. Please try again.");
    }
  }, []); // The empty dependency array ensures this runs only once on mount

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // --- Validation ---
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!hash) {
        setError("Invalid or missing reset token. Please request a new link.");
        return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/reset/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, password }),
      });

      if (!response.ok) {
        // Try to get a meaningful error message from the server response
        let errorMessage = 'Failed to reset password. The link may have expired.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
            console.error("Could not parse error response:", jsonError);
        }
        throw new Error(errorMessage);
      }

      // On success
      setSuccessMessage('Your password has been changed successfully! You can now sign in.');
      setPassword('');
      setConfirmPassword('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Change Your Password
        </h2>

        {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">
                <p className="font-bold">Success!</p>
                <p>{successMessage}</p>
            </div>
        )}

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Hide the form on success */}
        {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
            </div>

            <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
                </label>
                <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading || !hash}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 font-semibold transition disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </div>
            </form>
        )}

        <div className="text-center mt-6">
            <a href="/sign-in" className="font-medium text-sm text-indigo-600 hover:text-indigo-500">
                Back to Sign In
            </a>
        </div>
      </div>
    </div>
  );
};