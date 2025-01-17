import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userService from '../services/UserService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userService.sendPasswordReset(email);
      setEmailSent(true);
      toast.success('Password reset email sent successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 transition-all duration-500 ease-in-out">
        <div className="w-full max-w-md px-6 py-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/[0.12] transition-all duration-300">
          <div className="mb-8">
            <h1 className="text-center text-3xl font-bold text-white mb-2">
              Check Your Email
            </h1>
            
            <div className="mt-4 space-y-4">
              <p className="text-gray-300">
                We've sent password reset instructions to:
                <br />
                <span className="font-medium text-white">{email}</span>
              </p>
              
              <p className="text-gray-400">
                If you don't see the email, please check your spam folder.
              </p>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-white hover:text-red-400 font-medium transition-colors duration-200"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 transition-all duration-500 ease-in-out">
      <div className="w-full max-w-md px-6 py-8 bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/[0.12] transition-all duration-300">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Reset Password
          </h2>
          <p className="text-center text-gray-300 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </div>
            ) : (
              'Send Reset Instructions'
            )}
          </button>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Return to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 