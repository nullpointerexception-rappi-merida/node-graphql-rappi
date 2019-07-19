const UserModel = require('../models/user');
const UserProfile = require('../models/user_profile');
const DeliveryService = require('../models/delivery-service');
const DeliveryAndUser = require('../models/delivery-and-user');
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
	// let's check if has a profile added:
	const user = await UserModel.findOne({ email: params.email });
	const profile = await UserProfile.findOne({ user: user._id });
	return {
		token,
		message: 'OK',
		hasProfile: !!profile
	};
};

const addProfile = async (root, params, context, info) => {
	const { user } = context;
	if (params.data.type) {
		user.type = params.data.type;
		delete params.data.type;
	}
	const profile = {
		...params.data,
		user: user._id
	};
	const isProfileCreated = await UserProfile.findOne({ user: user._id });
	if (isProfileCreated) {
		throw new Error('The user has already a profile');
	}
	const profileCreated = await UserProfile.create(profile)
		.catch(e => {
			return {
				errorCode: 500,
				status: 500,
				error: 'Could not create the profile',
				errorMsg: 'Could not create the profile',

			};
		});
	// update the user as well.
	await UserModel.findByIdAndUpdate(user._id, { ...user.toObject(), userProfile: profileCreated._id });
	return 'Profile created successfully';
};

const updateProfile = async (root, params, context, info) => {
	const { user } = context;
	if (params.data.type) {
		await UserModel.findByIdAndUpdate(user._id, {
			...user.toObject(),
			type: params.data.type
		});
		delete params.data.type;
	}
	const profileFromDB = await UserProfile.findOne({ user: user._id });
	await UserProfile.findOneAndUpdate(
		{ user: user._id },
		{
			...profileFromDB.toObject(),
			...params.data
		}
		)
		.catch(e => {
			return {
				errorCode: 500,
				status: 500,
				error: 'Could not update the profile',
				errorMsg: 'Could not update the profile',

			};
		});
	return UserModel.findOne({ _id: user._id })
		.populate('userProfile');
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
	const { user } = context;
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
	// let's link the user in the context with the delivery service created
	await DeliveryAndUser.create({
		delivery: newDeliveryService._id,
		customer: user._id
	});
	// creates the origin point:
	const originData = {
		...params.data.origin,
		isOrigin: true,
		deliveryService: newDeliveryService._id
	};
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

const acceptDelivery = async (root, params, context, info) => {
	// the user in session should be our dealer.
	const { user } = context;
	const deliveryAndUser = await DeliveryAndUser.findOne({ delivery: params.delivery });
	deliveryAndUser.dealer = user._id;
	// updates the delivery guy
	await deliveryAndUser.save();
	return 'Delivery accepted';
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

const updatePaymentMethod = async (root, params, context, info) => {
	const paymentData = { ...params.data };
	delete paymentData._id;
	await PaymentMethod.findOneAndUpdate(
		{ _id: params.data._id },
		{
			...paymentData,
		}
		)
		.catch(e => {
			return {
				errorCode: 500,
				status: 500,
				error: 'Could not update the payment method',
				errorMsg: 'Could not update the payment method',

			};
		});
	return await PaymentMethod.findById(params.data._id);
};

const deletePaymentMethod = async (root, params, context, info) => {
	const { id } = params;

	await PaymentMethod.findOneAndUpdate({ _id: id }, { $set: { isActive: false } });

	return 'Payment Method Deleted';

};

module.exports = {
	createUser,
	login,
	addProfile,

	createDeliveryService,
	createPaymentMethod,

	updateDeliveryService,
	updatePaymentMethod,
	updateProfile,

	deleteProfile,
	deleteDeliveryService,
	deletePaymentMethod,

	acceptDelivery

};
