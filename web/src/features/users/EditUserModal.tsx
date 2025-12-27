import { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '@/features/users/types';

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (data: Partial<User>) => void;
}

export const EditUserModal = ({ user, onClose, onSave }: EditUserModalProps) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        tier: user.subscription.tier,
        status: user.subscription.status,
        expiryDate: user.subscription.expiryDate ? new Date(user.subscription.expiryDate).toISOString().split('T')[0] : ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            subscription: {
                ...user.subscription,
                tier: formData.tier,
                status: formData.status,
                expiryDate: formData.expiryDate || null // Send null if empty
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Edit User</h3>
                    <button onClick={onClose} className="p-1 cursor-pointer hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tier</label>
                            <select
                                value={formData.tier}
                                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="free">Free</option>
                                <option value="pioneer">Pioneer</option>
                                <option value="early_adopter">Early Adopter</option>
                                <option value="growth">Growth</option>
                                <option value="pro">Pro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 cursor-pointer rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 cursor-pointer rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
