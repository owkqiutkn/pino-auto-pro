'use client';

import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-4 p-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                Public registration is disabled. This dashboard uses a single admin account.
            </div>
            <div className="space-y-3">
                <Link
                    href="/auth/login"
                    className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                >
                    Go to Sign in
                </Link>
                <p className="text-center text-sm text-gray-600">
                    If you need access, contact the administrator.
                </p>
                <div className="text-center text-sm">
                    <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
                        Back to homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}