"use client";
import React, { use } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, Settings } from 'lucide-react';
import Link from 'next/link';

type DashboardContentProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
export default function DashboardContent({ searchParams }: DashboardContentProps) {
    use(searchParams ?? Promise.resolve({}));
    const { loading, user } = useGlobal();

    const getDaysSinceRegistration = () => {
        if (!user?.registered_at) return 0;
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - user.registered_at.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b91c1c]"></div>
            </div>
        );
    }

    const daysSinceRegistration = getDaysSinceRegistration();

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user?.email?.split('@')[0]}! 👋</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Member for {daysSinceRegistration} days
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <Link
                            href="/app/user-settings"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-red-50 rounded-full">
                                <Settings className="h-4 w-4 text-[#b91c1c]" />
                            </div>
                            <div>
                                <h3 className="font-medium">User Settings</h3>
                                <p className="text-sm text-gray-500">Manage your account preferences</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}