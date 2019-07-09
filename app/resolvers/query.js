const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery');
const PaymentMethod = require('../models/payment_methods');


// eslint-disable-next-line no-unused-vars
const listUsers = async (root, params, context, info) => {
	return await UserModel.find();
};

// delivery services queries:
const listDeliveryServices = async (root, params, context, info) => {
	return await DeliveryService.find({ isActive: true });
};

// Payment method queries:
const listPaymentMethods = async (root, params, context, info) => {
	return await PaymentMethod.find({ isActive: true });
};


module.exports = {
	listUsers,
	listDeliveryServices,
	listPaymentMethods
};
