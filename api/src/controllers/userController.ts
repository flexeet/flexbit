import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Watchlist from '../models/Watchlist';

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
            user.fullName = req.body.fullName || user.fullName;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;

            if (req.body.subscription) {
                user.subscription = {
                    ...user.subscription,
                    ...req.body.subscription,
                };

                // Explicitly handle clearing of expiryDate if null or empty string is passed
                if (req.body.subscription.expiryDate === null || req.body.subscription.expiryDate === '') {
                    user.subscription.expiryDate = null;
                } else if (req.body.subscription.expiryDate) {
                    user.subscription.expiryDate = req.body.subscription.expiryDate;
                }
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
