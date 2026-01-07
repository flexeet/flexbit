import { Request, Response } from 'express';
// @ts-ignore
import midtransClient from 'midtrans-client';
import User, { UserTier } from '../models/User';
import Transaction from '../models/Transaction';
import crypto from 'crypto';
import { createTransactionSchema, manualVerificationSchema } from '../schemas/payment';

// Initialize Snap client
const snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production', // Sandbox for development
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

// Price mapping
const PRICING = {
    [UserTier.PIONEER]: 5000,
    [UserTier.EARLY_ADOPTER]: 599000,
    [UserTier.GROWTH]: 999000,
    [UserTier.PRO]: 1999000,
    [UserTier.FREE]: 0
};
export const createTransaction = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const validation = createTransactionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0].message });
        }
        const { tier } = validation.data;

        const price = PRICING[tier as UserTier];
        const orderId = `flxbt-${user._id}-${Date.now()}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: price
            },
            customer_details: {
                first_name: user.fullName,
                email: user.email,
            },
            item_details: [{
                id: tier,
                price: price,
                quantity: 1,
                name: `FlexBit ${tier.replace('_', ' ').toUpperCase()} Subscription`
            }]
        };

        const transaction = await snap.createTransaction(parameter);

        // INVALIDATE OLD PENDING TRANSACTIONS (Fix for stuck pending issue)
        await Transaction.updateMany(
            { user: user._id, status: 'pending' },
            { status: 'failed' }
        );

        // Save Transaction
        await Transaction.create({
            user: user._id,
            orderId: orderId,
            tier: tier,
            amount: price,
            status: 'pending',
            snapToken: transaction.token
        });

        res.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error) {
        console.error('Midtrans Transaction Error:', error);
        res.status(500).json({ message: 'Payment gateway error', error: (error as Error).message });
    }
};

// @desc    Handle Midtrans Notification Webhook
// @route   POST /api/payment/notification
// @access  Public
export const handleNotification = async (req: Request, res: Response) => {
    try {
        const notification = req.body;
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
        } = notification;

        // ✅ SECURITY: Validate Signature from Midtrans
        const serverKey = process.env.MIDTRANS_SERVER_KEY!;
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex');

        if (signature_key !== expectedSignature) {
            console.error(`Invalid Midtrans signature for order: ${order_id}`);
            return res.status(403).json({ message: 'Invalid signature' });
        }

        // ✅ SECURITY: Double-verify with Midtrans API (don't trust webhook body)
        const statusResponse = await snap.transaction.status(order_id);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${order_id}. Transaction Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`);

        const userId = order_id.split('-')[1];
        if (!userId) {
            return res.status(400).json({ message: 'Invalid Order ID format' });
        }

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // TODO: Handle challenge
            } else if (fraudStatus == 'accept') {
                await updateUserSubscription(userId, order_id, statusResponse.gross_amount);
            }
        } else if (transactionStatus == 'settlement') {
            await updateUserSubscription(userId, order_id, statusResponse.gross_amount);
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            await Transaction.findOneAndUpdate({ orderId: order_id }, { status: 'failed' });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Midtrans Notification Error:', error);
        res.status(500).json({ message: 'Notification handler error' });
    }
};

// @desc    Manual Transaction Verification
// @route   POST /api/payment/verify
// @access  Private
export const verifyTransaction = async (req: Request, res: Response) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'Manual verification not available in production' });
        }

        const validation = manualVerificationSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0].message });
        }
        const { orderId } = validation.data;

        const statusResponse = await snap.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const grossAmount = statusResponse.gross_amount;

        console.log(`Manual verification. Order: ${orderId}, Status: ${transactionStatus}`);

        const userId = orderId.split('-')[1];

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                return res.json({ status: 'pending', message: 'Payment challenged' });
            } else if (fraudStatus == 'accept') {
                await updateUserSubscription(userId, orderId, grossAmount);
                return res.json({ status: 'success', message: 'Payment verified' });
            }
        } else if (transactionStatus == 'settlement') {
            await updateUserSubscription(userId, orderId, grossAmount);
            return res.json({ status: 'success', message: 'Payment verified' });
        } else if (transactionStatus == 'pending') {
            return res.json({ status: 'pending', message: 'Payment pending' });
        } else {
            await Transaction.findOneAndUpdate({ orderId }, { status: 'failed' });
            return res.json({ status: 'failed', message: 'Payment failed or expired' });
        }

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

// Helper: Update User Subscription
const updateUserSubscription = async (userId: string, orderId: string, amount: string) => {
    // Update Transaction Status
    await Transaction.findOneAndUpdate({ orderId }, { status: 'success' });

    // Determine tier based on amount 
    // Ideally we pass tier in custom_field, but for simplicity we can infer from price
    const amountNum = parseFloat(amount);
    let newTier: UserTier | null = null;

    if (amountNum == PRICING[UserTier.PIONEER]) newTier = UserTier.PIONEER;
    else if (amountNum == PRICING[UserTier.EARLY_ADOPTER]) newTier = UserTier.EARLY_ADOPTER;
    else if (amountNum == PRICING[UserTier.GROWTH]) newTier = UserTier.GROWTH;
    else if (amountNum == PRICING[UserTier.PRO]) newTier = UserTier.PRO;

    if (!newTier) return; // Unknown amount

    let expiry: Date | null = null;
    if (newTier === UserTier.GROWTH || newTier === UserTier.PRO) {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1); // 1 Year from now
        expiry = d;
    }

    await User.findByIdAndUpdate(userId, {
        subscription: {
            tier: newTier,
            status: 'active',
            startDate: new Date(),
            expiryDate: expiry,
            paymentId: orderId
        }
    });

    console.log(`User ${userId} upgraded to ${newTier}`);
};
