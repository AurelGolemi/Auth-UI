'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-2 font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Signing out...
        </>
      ) : (
        <>
          <LogOut size={20} />
          Sign Out
        </>
      )}
    </button>
  );
}