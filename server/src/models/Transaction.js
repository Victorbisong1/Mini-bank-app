const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    type: {
        type: String,
        enum: ['TRANFER_OUT', 'TRANFER_IN', 'WITHDRAWAL', 'BILL PAYMENT', 'LOAN_DISBURSEMENT', 'DEPOSIT', 'BONUS'],
        require: true
    },
    amount: {type: Number, required: true},
    balanceAfter: {type: Number},
    description: {type: String, required: true},
    reference: {type: String, required: true},
    counterparty: {name: String, accountNumber: String, bank: 'String'},
    metadata: {type: Object, default: {}},
}, {
    timestamps: true    
})
module.exports = mongoose.model('Transaction',TransactionSchema)