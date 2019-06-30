const UserModel = require('../models/user');

// eslint-disable-next-line no-unused-vars
const listUsers = async (root, params, context, info) => {
	return await UserModel.find();
};

module.exports = { 
	listUsers 
};
