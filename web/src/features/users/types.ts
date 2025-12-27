export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    subscription: {
        tier: string;
        status: string;
        expiryDate?: string | null;
    };
    createdAt: string;
}
