'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Lock, Github, Chrome } from 'lucide-react';
import { LoginForm } from '@/app/components/auth/login-form';
import { RegisterForm } from '@/app/components/auth/register-form';

type AuthTab = 'login' | 'register';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    await signIn(provider, { callbackUrl: '/profile' });
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="text-gray-400 hover:text-gray-200 mb-4"
            >
              ← Back to login
            </button>
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <p className="text-gray-400 mb-6">
              {"Enter your email and we'll send you a reset link"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="inline-block p-3 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Lock size={32} />
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to continue to your account</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
            <div className="flex gap-2 mb-6 bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'login' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'register' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {activeTab === 'login' ? (
              <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
            ) : (
              <RegisterForm />
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-gray-200 font-medium"
              >
                <Chrome size={20} />
                Continue with Google
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors text-gray-200 font-medium"
              >
                <Github size={20} />
                Continue with GitHub
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-2">
            <Lock size={14} />
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </Suspense>
  );
}
