import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Watchlist from '../models/Watchlist';
import { updateUserSchema } from '../schemas/user';

// @desc    Get users with pagination and search
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const query: any = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const count = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(limit * (page - 1));

        res.json({
            users,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            const validation = updateUserSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ message: validation.error.errors[0].message });
            }
            const data = validation.data;

            user.fullName = data.fullName ?? user.fullName;
            user.email = data.email ?? user.email;
            user.role = data.role ?? user.role;

            if (data.subscription) {
                // Ensure dates are properly converted
                const newStartDate = data.subscription.startDate
                    ? new Date(data.subscription.startDate)
                    : user.subscription.startDate;

                let newExpiryDate = user.subscription.expiryDate;
                if (data.subscription.expiryDate !== undefined) {
                    newExpiryDate = data.subscription.expiryDate
                        ? new Date(data.subscription.expiryDate)
                        : null;
                }

                user.subscription = {
                    tier: data.subscription.tier ?? user.subscription.tier,
                    status: data.subscription.status ?? user.subscription.status,
                    startDate: newStartDate,
                    expiryDate: newExpiryDate,
                    paymentId: data.subscription.paymentId ?? user.subscription.paymentId
                };
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                subscription: updatedUser.subscription
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            await Transaction.deleteMany({ user: user._id });
            await Watchlist.deleteMany({ user: user._id });
            res.json({ message: 'User and related data removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};
