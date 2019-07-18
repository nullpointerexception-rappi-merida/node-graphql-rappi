const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery-service');
const DeliveryAndUser = require('../models/delivery-and-user');
const PaymentMethod = require('../models/payment_methods');


// eslint-disable-next-line no-unused-vars
const listUsers = async (root, params, context, info) => {
	return await UserModel.find();
};

const listMyDeliveryServices = async (root, params, context, info) => {
	const { user } = context;
	const deliveriesAndUsers = await DeliveryAndUser.find({
			customer: user._id
		})
		.populate('delivery')
		.populate('dealer');
	const deliveriesResponse = [];
	for (const deliveryAndUser of deliveriesAndUsers) {
		let deliveryResponse = {};
		deliveryResponse.delivery = await DeliveryService.findById(deliveryAndUser.delivery)
			.populate('origin')
			.populate({
				path: 'destinations',
				model: 'points'
			});
		if (deliveryAndUser.dealer) {
			deliveryResponse.dealer = await UserModel.findById(deliveryAndUser.dealer);
		}
		deliveriesResponse.push(deliveryResponse);
	}
	return deliveriesResponse;
};

// deliveryService services queries:
const listDeliveryServices = async (root, params, context, info) => {
	const deliveries = await DeliveryService.find({ isActive: true })
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
	const deliveriesResponse = [];
	for (const delivery of deliveries) {
		const usersOfDelivery = await DeliveryAndUser.findOne({
				delivery: delivery._id
			})
			.populate('customer')
			.populate('dealer');
		deliveriesResponse.push({
			delivery: delivery.toObject(),
			customer: usersOfDelivery.customer.toObject(),
			dealer: usersOfDelivery.dealer ? usersOfDelivery.dealer.toObject() : undefined
		});
	}
	return deliveriesResponse;
};

const getDeliveryService = async (root, params, context, info) => {
	const { id } = params;
	const delivery = await DeliveryService.findOne({
			_id: id,
			isActive: true
		})
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
	const usersOfDelivery = await DeliveryAndUser.findOne({
			delivery: delivery._id
		})
		.populate('customer')
		.populate('dealer');
	return {
		delivery: delivery.toObject(),
		customer: usersOfDelivery.customer.toObject(),
		dealer: usersOfDelivery.dealer ? usersOfDelivery.dealer.toObject() : undefined
	};
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
	listPaymentMethods,
	listMyDeliveryServices
};
