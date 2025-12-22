"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    subscription: {
        tier: string;
        status: string;
    };
    createdAt: string;
}

export default function UsersPage() {
    const { data: currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
            router.push('/dashboard');
            return;
        }

        if (currentUser?.role === 'admin') {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch users", err);
                    setLoading(false);
                });
        }
    }, [currentUser, authLoading, router]);

    if (loading || authLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Total Users: {users.length}</p>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4 font-medium">{user.fullName}</td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-secondary text-muted-foreground'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`uppercase font-bold text-xs ${user.subscription.tier === 'pro' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                        {user.subscription.tier}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.subscription.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {user.subscription.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
