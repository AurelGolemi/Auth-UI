'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { FormField } from '@/app/components/ui/form-field';
import { loginSchema, type LoginInput } from '@/app/lib/validations/auth';

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth errors to user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignIn: 'Invalid email or password',
          default: 'An error occurred during sign in',
        };
        setAuthError(errorMessages[result.error] || errorMessages.default);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Global error message */}
      {authError && (
        <div
          className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400"
          role="alert"
        >
          {authError}
        </div>
      )}

      <FormField
        label="Email"
        type="email"
        icon={Mail}
        placeholder="Enter your email"
        error={errors.email?.message}
        disabled={isLoading}
        autoComplete="email"
        {...register('email')}
      />

      <FormField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        icon={Lock}
        placeholder="Enter your password"
        showPasswordToggle
        onTogglePassword={() => setShowPassword(!showPassword)}
        error={errors.password?.message}
        disabled={isLoading}
        autoComplete="current-password"
        {...register('password')}
      />

      <div className="flex items-center justify-between text-sm">
        <label htmlFor="" className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            {...register('rememberMe')}
          />
          <span>Remember Me</span>
        </label>

        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Forgot Password?
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Signing in...
          </>
        ) : (
          <>
            <Lock size={20} />
            SignIn
          </>
        )}
      </button>
    </form>
  );
}