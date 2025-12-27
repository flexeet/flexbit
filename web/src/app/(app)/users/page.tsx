"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Users, Search, ChevronLeft, ChevronRight, Edit2, Trash2, X, Check, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { User } from '@/features/users/types';
import { EditUserModal } from '@/features/users/EditUserModal';
import { DeleteUserModal } from '@/features/users/DeleteUserModal';

interface UsersResponse {
    users: User[];
    page: number;
    pages: number;
    total: number;
}

export default function UsersPage() {
    const { data: currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading } = useQuery<UsersResponse>({
        queryKey: ['users', page, debouncedSearch],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: debouncedSearch
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?${params}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        enabled: !!currentUser && currentUser.role === 'admin'
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<User>) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser?._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to update user');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingUser(null);
            toast.success('User updated successfully', {
                position: "top-right",
                theme: theme.theme === 'light' ? 'light' : 'dark'
            });
        },
        onError: () => {
            toast.error('Failed to update user', {
                position: "top-right",
                theme: theme.theme === 'light' ? 'light' : 'dark'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to delete user');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully', {
                position: "top-right",
                theme: theme.theme === 'light' ? 'light' : 'dark'
            });
        },
        onError: () => {
            toast.error('Failed to delete user', {
                position: "top-right",
                theme: theme.theme === 'light' ? 'light' : 'dark'
            });
        }
    });

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [currentUser, authLoading, router]);



    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
    };

    const handleConfirmDelete = () => {
        if (deletingUser) {
            deleteMutation.mutate(deletingUser._id);
            setDeletingUser(null);
        }
    };

    if (authLoading || isLoading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    if (!currentUser || currentUser.role !== 'admin') return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground text-sm">Managing {data?.total || 0} users</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4 whitespace-nowrap">Expiry Date</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data?.users.map((user) => (
                            <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4 font-medium">{user.fullName}</td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-secondary text-muted-foreground'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`uppercase font-bold text-xs ${user.subscription.tier === 'pro' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                            {user.subscription.tier}
                                        </span>
                                        <span className="text-[10px] uppercase text-muted-foreground">-</span>
                                        <span className={`text-[10px] uppercase ${user.subscription.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {user.subscription.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                    {user.subscription.expiryDate ? (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                                            {format(new Date(user.subscription.expiryDate), 'dd MMM yyyy')}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 cursor-pointer rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user)}
                                            className="p-2 cursor-pointer rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data?.users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 cursor-pointer rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium px-4">
                        Page {data.page} of {data.pages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                        disabled={page === data.pages}
                        className="p-2 cursor-pointer rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={(data) => updateMutation.mutate(data)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <DeleteUserModal
                    user={deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
}
