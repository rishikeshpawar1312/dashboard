// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {error === 'OAuthAccountNotLinked' && (
            <>
              <p className="text-center text-red-600 mb-4">
                The email associated with this OAuth account is already registered using a different sign-in method.
              </p>
              <p className="text-center text-gray-600 mb-4">
                Please sign in using your original authentication method.
              </p>
            </>
          )}
          {error === 'AccessDenied' && (
            <p className="text-center text-red-600 mb-4">
              Access denied. You don't have permission to sign in.
            </p>
          )}
          {error === 'Verification' && (
            <p className="text-center text-red-600 mb-4">
              The verification token has expired or is invalid.
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}