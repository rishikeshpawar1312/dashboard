'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Github } from 'lucide-react';
import Link from 'next/link';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

const AuthForm = ({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Registration failed');
        }

        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Failed to sign in after registration');
        }
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Invalid credentials');
        }
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-lg">
      <div className="w-full max-w-md p-6 bg-white bg-opacity-80 rounded-xl shadow-lg space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' ? 'Welcome Back!' : 'Join Our Community'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-indigo-600 hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-indigo-600 hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'signup' && (
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            )}
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email Address"
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-500 focus:ring focus:ring-indigo-400 focus:ring-opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Mail className="w-5 h-5 mr-2" />
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
