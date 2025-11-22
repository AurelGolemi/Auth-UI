import { RegisterForm } from '@/app/components/auth/register-form';

export default function RegisterPage() {
  return (
    <main className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-6">Register</h1>
      <RegisterForm />
    </main>
  );
}
