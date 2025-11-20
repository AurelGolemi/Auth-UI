import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/app/components/auth/logout-button';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-xl">{session.user?.name}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-xl">{session.user?.email}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">User ID</label>
              <p className="text-sm font-mono text-gray-300 bg-gray-700 px-3 py-2 rounded">
                {(session.user as { id?: string | null })?.id ?? '—'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 flex gap-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}