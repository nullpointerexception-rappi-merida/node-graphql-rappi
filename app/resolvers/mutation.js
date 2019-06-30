const UserModel = require('../models/user');
const authenticate = require('../utils/authenticate');

// eslint-disable-next-line no-unused-vars
const createUser = async (root, params, context, info) => {
	const newUser = await UserModel.create(params.data)
		.catch((error) => {
			console.log('Error while creating the user: ', error);
			throw new Error('Error occurred');
		});
	if (!newUser) {
		throw new Error('User was not created. ');
	}
	return newUser.toObject();
};

const login = async(root, params, context, info) => {
	const token = await authenticate(params).catch(e => { throw e;});
	return {
		token,
		message: 'OK'
	};
};


module.exports = { createUser, login };
