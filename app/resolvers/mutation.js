const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery');
const Point = require('../models/point');
const PaymentMethod = require('../models/payment_methods');
const UserProfile = require('../models/user_profile');
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
	// creates an empty profile:
	const newProfile = await UserProfile.create({
		firstName: '  ',
		lastName: '  ',
		birthDate: '',
		gender: 'O',
		profilePicture: '',
		user: newUser
	});
	const userFromDB = await UserModel.findOne({ _id: newUser._id })
		.catch((error) => {
			console.log('Error while fetching the user: ', error);
			throw new Error('Error while fetching the user');
		});
	userFromDB.userProfile = newProfile;
	userFromDB.save({ new: true });
	return userFromDB.toObject();
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
	delete frontEndData.destination;
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
		delivery: newDeliveryService._id
	};
	// creates the origin:
	const originCreated = await Point.create(originData);
	const destinationData = [];
	for (const destination of params.data.destination) {
		destinationData.push({ ...destination, delivery: newDeliveryService._id });
	}
	// creates the destinations if many:
	newDeliveryService.destination = await Point.insertMany(destinationData);
	newDeliveryService.origin = originCreated._id;
	await newDeliveryService.save();
	return await DeliveryService.findById(newDeliveryService._id)
		.populate('origin')
		.populate({
			path: 'destination',
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
	deleteProfile,
	deleteDeliveryService,
	deletePaymentMethod

};
