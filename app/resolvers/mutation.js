const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery-service');
const Point = require('../models/point');
const PaymentMethod = require('../models/payment_methods');
const authenticate = require('../utils/authenticate');

const printAndThrowError = (error, consoleMsg, errorMsg) => {
	if (error && consoleMsg) {
		console.log(consoleMsg, error);
	}
	throw new Error(errorMsg);
};

// eslint-disable-next-line no-unused-vars
const createUser = async (root, params, context, info) => {
	const newUser = await UserModel.create(params.data)
		.catch((error) => {
			printAndThrowError(error,
				'Error while creating the user: ',
				'Error occurred');
		});
	if (!newUser) {
		printAndThrowError(undefined,
			undefined,
			'User was not created. ');
	}
	return newUser.toObject();
};


const login = async (root, params, context, info) => {
	const token = await authenticate(params)
		.catch(e => {
			throw e;
		});
	return {
		token,
		message: 'OK'
	};
};

const deleteProfile = async (root, params, context, info) => {

	const { user } = context;

	const profile = await UserModel.findById(user._id)
		.catch(error => {
			printAndThrowError(error, 'Error while deleting profile', 'Error ocurred');
		});
	if (!profile) {
		printAndThrowError(undefined, undefined, 'Profile was not found');
	}
	profile.isActive = false;
	await profile.save({ new: true });

	return 'Profile deleted';

};

/***** DELIVERY SERVICE SECTION ******/

const createDeliveryService = async (root, params, context, info) => {
	const frontEndData = { ...params.data };
	delete frontEndData.origin;
	delete frontEndData.destinations;
	const newDeliveryService = await DeliveryService.create(frontEndData)
		.catch(error => {
			printAndThrowError(error,
				'Error while creating the delivery service: ',
				'Error occurred');
		});
	if (!newDeliveryService) {
		printAndThrowError(undefined,
			undefined,
			'delivery service was not created. ');
	}
	const originData = {
		...params.data.origin,
		isOrigin: true,
		deliveryService: newDeliveryService._id
	};
	// creates the origin:
	const originCreated = await Point.create(originData);
	newDeliveryService.origin = originCreated._id;

	// will set the destinations with its deliveryService:
	const destinationData = [];
	for (const destination of params.data.destinations) {
		destinationData.push({ ...destination, deliveryService: newDeliveryService._id });
	}
	// creates the destinations if many:
	newDeliveryService.destinations = await Point.insertMany(destinationData);
	await newDeliveryService.save();
	return await DeliveryService.findById(newDeliveryService._id)
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
};

const updateDeliveryService = async (root, params, context, info) => {
	const { id, data } = params;

	const deliveryServiceFromDB = await DeliveryService.findById(id)
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		})
		.catch(error => {
			printAndThrowError(error,
				'Error while fetching the delivery service: ',
				'Error occurred');
		});
	if (!deliveryServiceFromDB) {
		printAndThrowError(undefined,
			undefined,
			'delivery service was not created. ');
		return;
	}
	if (data.origin) {
		// then we must update the origin
		await Point.replaceOne({ _id: deliveryServiceFromDB.origin._id }, { ...data.origin, isOrigin: true });
	}
	if (data.destinations) {
		// then we must delete and add the new destinations
		await Point.deleteMany({ deliveryService: deliveryServiceFromDB._id, isOrigin: false });
		// will set the destinations with its deliveryService:
		const destinationData = [];
		for (const destination of data.destinations) {
			destinationData.push({ ...destination, deliveryService: deliveryServiceFromDB._id });
		}
		// creates the destinations if many:
		deliveryServiceFromDB.destinations = await Point.insertMany(destinationData);
	}
	if (data.observations) {
		deliveryServiceFromDB.observations = data.observations;
	}
	if (data.roundTrip !== undefined) {
		deliveryServiceFromDB.roundTrip = data.roundTrip;
	}
	await deliveryServiceFromDB.save();
	return await DeliveryService.findById(deliveryServiceFromDB._id)
		.populate('origin')
		.populate({
			path: 'destinations',
			model: 'points'
		});
};

const deleteDeliveryService = async (root, params, context, info) => {
	const { id } = params;
	await DeliveryService.findOneAndUpdate({ _id: id }, { $set: { isActive: false } });
	return 'Delivery Service Cancelled';

};

/***** PAYMENT METHODS SECTION ******/
const createPaymentMethod = async (root, params, context, info) => {
	const newPaymentMethod = await PaymentMethod.create(params.data)
		.catch(error => {
			printAndThrowError(error,
				'Error while creating the payment method: ',
				'Error occurred');
		});
	if (!newPaymentMethod) {
		printAndThrowError(undefined,
			undefined,
			'payment method was not created. ');
	}
	return newPaymentMethod.toObject();
};

const deletePaymentMethod = async (root, params, context, info) => {
	const { id } = params;

	await PaymentMethod.findOneAndUpdate({ _id: id }, { $set: { isActive: false } });

	return 'Payment Method Deleted';

};

module.exports = {
	createUser,
	login,

	createDeliveryService,
	createPaymentMethod,

	updateDeliveryService,

	deleteProfile,
	deleteDeliveryService,
	deletePaymentMethod

};
