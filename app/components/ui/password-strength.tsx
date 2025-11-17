'use client';

interface PasswordStrengthProps {
  password: string;
  show?: boolean;
}

export function PasswordStrength({ password, show = true }: PasswordStrengthProps) {
  
  if (!password || !show) return null;

  // Calculate strength score (0-5)
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 5);
  };

  const strength = calculateStrength(password);

  const getStrengthConfig = (score: number) => {
    if (score <= 1) return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-400' };
    if (score <= 2) return { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    if (score <= 4) return { label: 'Good', color: 'bg-green-500', textColor: 'text-green-400' };
    return { label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-400' };
  };

  const config = getStrengthConfig(strength);

  return (
    <div className="mt-2 space-y-2" role="status" aria-live="polite">
      {/* Visual Strength Bars */}
      <div className="flex gap-1" aria-hidden="true">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded transition-all duration-300 ${index < strength ? config.color : 'bg-gray-600'
              }`}
          />
        ))}
      </div>

      {/* Textual description */}
      <p className="text-xs text-gray-400">
        Password strength: {' '}
        <span className={`font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </p>

      {/* Helpful requirements */}
      <ul className="text-xs text-gray-600 space-y-1 mt-2">
        <li className={password.length >= 8 ? 'text-green-400' : ''}>
          {password.length >= 8 ? '✓' : '○'} At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
          {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
          {/[0-9]/.test(password) ? '✓' : '○'} One number
        </li>
      </ul>
    </div>
  );
}