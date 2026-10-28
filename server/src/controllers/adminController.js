const User = require('../models/Users');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const bcrypt = require('bcryptjs');
const { generateUniqueAccountNumber } = helpers = require('../utils/helpers');

const getstats = async(req, res) => {
    try {
        const users = await User.find({}).select('-password');
        const transactions = await Transaction.find({});
        const loans = await Loan.find({});

        const totalBalances = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
        const pendingLoans = loans.filter(l => l.status === 'pending');
        const approvedLoans = loans.filter(l => l.status === 'approved');
        const bannedUsers = users.filter(u => u.status === 'banned');
        const pendingTiers = users.filter(u => u.tierRequest && u.tierRequest.status === 'pending');

        res.json({
           stats:{
            totalUsers: users.length,
            activeUsers: users.length - bannedUsers.length,
            bannedUsers: bannedUsers.length,
            totalPlatformBalances: totalBalances,
            totalTransactionsCount: transactions.length,
            pendingLoansCount: pendingLoans.length,
            approvedLoansCount: approvedLoans.length,
            pendingTierRequestsCount: pendingTiers.length
           } 
        });
    } catch (error) {
        console.log('Admin stats error', error);
        res.status(500).json({ message: 'Error loading admin stats' });
    }
}

const getusers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

const createuser = async(req, res) => {
    try {
        const { name, email, password, role = 'user', balance = 0 } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const accountNumber = await generateUniqueAccountNumber();
        const hashedPassword = await bcrypt.hash(password, 10);
        const numBalance = Number(balance);

        const newUser = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            accountNumber,
            balance: numBalance,
            role: role === 'admin' ? 'admin' : 'user'
        });

        await Transaction.create({
            userId: newUser._id,
            type: 'BONUS',
            amount: numBalance,
            balanceAfter: numBalance,
            description: 'Account created by Admin',
            reference: 'Admin_init_' + Date.now(),
            counterparty: {
                name: `system admin (${req.user.name})`,
                accountNumber: 'Admin',
                bank: 'MiniBank Apex'
            }
        });

        const safeUser = newUser.toObject();
        delete safeUser.password;

        res.status(201).json({
            message: 'User created successfully',
            user: safeUser
        });
    } catch (error) {
        console.log('Admin create user error', error);
        res.status(500).json({ message: 'Error creating user.' });
    }
}

const updateusers = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, balance, status } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (String(user._id) === String(req.user._id) && status === 'banned') {
            return res.status(400).json({ message: 'You cannot ban your active admin account' });
        }

        if (name) user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (role && ['user', 'admin'].includes(role)) user.role = role;
        if (status && ['active', 'banned'].includes(status)) user.status = status;
        if (balance !== undefined && !isNaN(balance)) user.balance = Number(balance);

        await user.save();
        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({
            message: 'User account updated successfully!',
            user: safeUser
        });
    } catch (error) {
        console.log('user update error', error);
        res.status(500).json({ message: 'error updating user' });
    }
}

const banuser = async(req, res) => {
    try {
        const { id } = req.params;
        const { banned } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (String(user._id) === String(req.user._id)) {
            return res.status(400).json({ message: 'You cannot ban yourself' });
        }

        user.status = banned ? 'banned' : 'active';
        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({
            message: `User ${safeUser.name} has been ${user.status === 'banned' ? 'banned' : 'unbanned'}`,
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling user ban status' });
    }
}

const getAllLoans = async(req, res) => {
    try {
        const loans = await Loan.find({}).sort({ createdAt: -1 });
        res.json({ loans });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans' });
    }
}

const updateloans = async(req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be approved or rejected.' });
        }

        const loan = await Loan.findById(id);
        if (!loan) return res.status(404).json({ message: 'Loan application not found.' });

        if (loan.status !== 'pending') {
        return res.status(400).json({ message: `Loan is already ${loan.status}.` });
        }

        const applicant = await User.findById(loan.userId);
        if (!applicant) return res.status(404).json({ message: 'Applicant user account not found.' });

        if (status === 'approved') {
        const loanAmount = Number(loan.amount);
        const newBalance = applicant.balance + loanAmount;
        applicant.balance = newBalance;
        await applicant.save();

        // Create transaction for disbursement
        const reference = 'LN_DISB_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
        await Transaction.create({
            userId: applicant._id,
            type: 'LOAN_DISBURSEMENT',
            amount: loanAmount,
            balanceAfter: newBalance,
            description: `Approved Loan Disbursement (${loan.purpose || 'Personal Loan'})`,
            reference,
            counterparty: {
            name: 'MiniBank Credit Desk',
            accountNumber: 'LOAN_DEPT',
            bank: 'MiniBank'
            },
            metadata: {
            loanId: loan._id,
            approvedBy: req.user.email
            }
        });
        }

        loan.status = status;
        loan.rejectionReason = status === 'rejected' ? (rejectionReason || 'Declined by credit administrator.') : '';
        loan.updatedAt = new Date();
        await loan.save();

        res.json({
            message: status === 'approved' ? 'Loan approved and funds disbursed!' : 'Loan rejected.',
            loan
        });
    } catch (error) {
        console.error('Admin loan decision error:', error);
        res.status(500).json({ message: 'Error processing loan review.' });
    }
}

const admintrans = async(req, res) => {
    try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions.' });
  }
}

// Get all pending tier upgrade requests (Updated to return both keys for compatibility)
const getTierRequests = async (req, res) => {
    try {
        const users = await User.find({ 'tierRequest.status': 'pending' }).select('-password');
        res.json({ 
            requests: users, 
            tierRequests: users 
        });
    } catch (err) {
        console.error('Error fetching tier requests:', err);
        res.status(500).json({ message: 'Error fetching tier upgrade requests.' });
    }
};

// Approve or reject a tier upgrade request
const updateTierRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (status === 'approved') {
            user.tier = user.tierRequest.targetTier || 2;
            user.tierRequest.status = 'approved';
        } else {
            user.tierRequest.status = 'rejected';
        }

        await user.save();
        res.json({ message: `Tier upgrade request ${status} successfully!`, user });
    } catch (err) {
        console.error('Error updating tier request:', err);
        res.status(500).json({ message: 'Error processing tier upgrade review.' });
    }
};

module.exports = {
    getstats, 
    getusers, 
    createuser, 
    updateusers, 
    banuser, 
    getAllLoans, 
    updateloans, 
    admintrans,
    getTierRequests,
    updateTierRequest
};