const UserModel = require('../models/user');
const DeliveryService = require('../models/delivery');
const PaymentMethod = require('../models/payment_methods');
const authenticate = require('../utils/authenticate');

printAndThrowError = (error, consoleMsg, errorMsg) => {
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

/***** DELIVERY SERVICE SECTION ******/

const createDeliveryService = async (root, params, context, info) => {
	const newDeliveryService = await DeliveryService.create(params.data)
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
	return newDeliveryService.toObject();
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

module.exports = {
	createUser,
	login,
	createDeliveryService,
	createPaymentMethod
};
