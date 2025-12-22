
import { useQuery } from '@tanstack/react-query';

export interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: 'user' | 'admin';
    subscription: {
        tier: 'free' | 'pioneer' | 'early_adopter' | 'growth' | 'pro';
        status: string;
        expiryDate: string;
    };
}

const fetchUser = async (): Promise<UserProfile | null> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for cookies
        });

        if (!res.ok) {
            return null; // Not logged in
        }

        return res.json();
    } catch (err) {
        return null; // Error usually means not logged in or network
    }
};

export const useAuth = () => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchUser,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
