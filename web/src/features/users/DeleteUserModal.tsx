import { X, Trash2 } from 'lucide-react';
import { User } from '@/features/users/types';

interface DeleteUserModalProps {
    user: User;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteUserModal = ({ user, onClose, onConfirm }: DeleteUserModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <Trash2 className="w-5 h-5" />
                        Delete User
                    </h3>
                    <button onClick={onClose} className="p-1 cursor-pointer hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to delete <span className="font-bold text-foreground">{user.fullName}</span>?
                        This action will permanently remove the user and all associated data.
                    </p>
                    <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20">
                        Warning: This action cannot be undone.
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 cursor-pointer rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                        <button onClick={onConfirm} className="px-4 py-2 cursor-pointer rounded-lg bg-red-500 text-white font-bold hover:opacity-90 transition-opacity">Delete Permanently</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
