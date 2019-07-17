const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery-service');
const PaymentMethod = require('../models/payment_methods');


// eslint-disable-next-line no-unused-vars
const listUsers = async (root, params, context, info) => {
	return await UserModel.find();
};

// deliveryService services queries:
const listDeliveryServices = async (root, params, context, info) => {
	return await DeliveryService.find({ isActive: true })
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
};

const getDeliveryService = async (root, params, context, info) => {
	const { id } = params;
	return await DeliveryService.findOne({
			_id: id,
			isActive: true
		})
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
};

const getProfile = async (root, params, context, info) => {
	const { user } = context;
	return await UserModel.findOne({ _id: user._id, isActive: true })
		.populate('userProfile');
};


// Payment method queries:
const listPaymentMethods = async (root, params, context, info) => {
	return await PaymentMethod.find({ isActive: true });
};


module.exports = {
	listUsers,
	getProfile,
	listDeliveryServices,
	getDeliveryService,
	listPaymentMethods
};
