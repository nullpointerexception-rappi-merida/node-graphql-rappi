const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentMethods = new Schema({
	cardNumber: { type: String, required: true },
	cardHolder: { type: String, required: true },
	expires: { type: String, required: true },
}, { collection: 'payment_methods', timestamps: true });

module.exports = mongoose.model('payment_methods', PaymentMethods);
