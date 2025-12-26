"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';

export default function ProfilePage() {
    const { data: user, isLoading } = useAuth();
    const queryClient = useQueryClient();

    // Edit Profile State
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [nameSuccess, setNameSuccess] = useState('');
    const [nameError, setNameError] = useState('');
    const [nameSaving, setNameSaving] = useState(false);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passSuccess, setPassSuccess] = useState('');
    const [passError, setPassError] = useState('');
    const [passSaving, setPassSaving] = useState(false);

    // Initialize name when user loads
    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
            setPhoneNumber(user.phoneNumber || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: FormEvent) => {
        e.preventDefault();
        setNameSaving(true);
        setNameError('');
        setNameSuccess('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, phoneNumber }),
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update');
            }

            queryClient.invalidateQueries({ queryKey: ['auth'] });
            setNameSuccess('Profile updated successfully!');
        } catch (err: any) {
            setNameError(err.message);
        } finally {
            setNameSaving(false);
        }
    };

    const handleUpdatePassword = async (e: FormEvent) => {
        e.preventDefault();
        setPassSaving(true);
        setPassError('');
        setPassSuccess('');

        if (newPassword !== confirmPassword) {
            setPassError('New passwords do not match');
            setPassSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            setPassError('Password must be at least 6 characters');
            setPassSaving(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update');
            }

            setPassSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPassError(err.message);
        } finally {
            setPassSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <User className="w-7 h-7 text-primary" /> My Profile
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your account details</p>
            </div>

            {/* User Info Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-lg border-b border-border pb-2">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Phone</span>
                        <p className="font-medium">{user?.phoneNumber || '-'}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Email</span>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Tier</span>
                        <p className="font-bold uppercase text-primary">{user?.subscription?.tier}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Status</span>
                        <p className={`font-medium capitalize ${user?.subscription?.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                            {user?.subscription?.status}
                        </p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Expires At</span>
                        <p className={`font-medium capitalize ${user?.subscription?.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                            {user?.subscription?.expiryDate ? new Date(user?.subscription?.expiryDate).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="font-bold text-lg border-b border-border pb-2 mb-4">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="62..."
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Format: 628...</p>
                    </div>
                    {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                    {nameSuccess && <p className="text-green-500 text-sm">{nameSuccess}</p>}
                    <button
                        type="submit"
                        disabled={nameSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {nameSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="font-bold text-lg border-b border-border pb-2 mb-4">Change Password</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    {passError && <p className="text-red-500 text-sm">{passError}</p>}
                    {passSuccess && <p className="text-green-500 text-sm">{passSuccess}</p>}
                    <button
                        type="submit"
                        disabled={passSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {passSaving ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
