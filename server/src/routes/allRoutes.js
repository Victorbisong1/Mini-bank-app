const express = require('express')
const router = express.Router()
const {protect, adminOnly} = require('../middlewares/auth')
const {getstats, getusers, createuser, updateusers, banuser, getAllLoans, updateloans, admintrans} = require('../controllers/adminController')
const { registeruser, login, getme, lookup, getdashboard, transfer, transactions, withdraw, deposit} = require('../controllers/authController')
const {airtime, getdata, electricity, getloan, myloans} = require('../controllers/billController')

// auth routes
router.post('/auth/register', registeruser)
router.post('/auth/login', login)
router.get('/auth/me', protect, getme)
router.get('/auth/lookup/:accountNumber', protect, lookup)

//user routes
router.get('/user/dashboard', protect, getdashboard)
router.post('/user/transfer', protect, transfer)
router.get('/user/transactions', protect, transactions)
router.post('/user/withdraw', protect, withdraw)
router.post('/user/deposit', protect, deposit)

// bills routes
router.post('/airtime', protect, airtime)
router.post('/data', protect, getdata)
router.post('/electric', protect, electricity)

// loan routes
router.post('/apply', protect, getloan)
router.get('/account/myloans', protect, myloans)

//admin routes
router.get('/admin/stats', protect, adminOnly, getstats)
router.get('/admin/users', protect, adminOnly, getusers)
router.post('/admin/users', protect, adminOnly, createuser)
router.put('/admin/users/:id', protect, adminOnly, updateusers)
router.put('/admin/users/:id/ban', protect, adminOnly, banuser)
router.get('/admin/loans', protect, adminOnly, getAllLoans)
router.put('/admin/loans/:id/status', protect, adminOnly, updateloans)
router.get('/admin/transactions', protect, adminOnly, admintrans)

module.exports = router