"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { FormField } from "@/app/components/ui/form-field";
import { PasswordStrength } from "@/app/components/ui/password-strength";
import { registerSchema, type RegisterInput } from "@/app/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAuthError(result.error || "Registration failed");
        return;
      }

      // Auto-login after successful registration using NextAuth
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setAuthError(
          "Registration successful, but login failed. Please login manually."
        );
        return;
      }

      if (signInResult?.ok) {
        router.push("/profile");
        router.refresh();
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {authError && (
        <div
          className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400"
          role="alert"
        >
          {authError}
        </div>
      )}

      <FormField
        label="Full Name"
        type="text"
        icon={User}
        placeholder="Enter your name"
        error={errors.name?.message}
        disabled={isLoading}
        autoComplete="name"
        {...register("name")}
      />

      <FormField
        label="Email"
        type="email"
        icon={Mail}
        placeholder="Enter your email"
        error={errors.email?.message}
        disabled={isLoading}
        autoComplete="email"
        {...register("email")}
      />

      <div>
        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Create a password"
          showPasswordToggle
          onTogglePassword={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          disabled={isLoading}
          autoComplete="new-password"
          {...register("password")}
        />
        <PasswordStrength password={password} />
      </div>

      <FormField
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        icon={Lock}
        placeholder="Confirm your password"
        showPasswordToggle
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        error={errors.confirmPassword?.message}
        disabled={isLoading}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />

      <label className="flex items-start gap-2 text-sm text-gray-300 cursor-pointer select-none">
        <input
          type="checkbox"
          required
          disabled={isLoading}
          className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        />
        <span>
          I agree to the{" "}
          <a
            href="/terms"
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
          >
            Privacy Policy
          </a>
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Creating Account...
          </>
        ) : (
          <>
            <CheckCircle2 size={20} />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}
