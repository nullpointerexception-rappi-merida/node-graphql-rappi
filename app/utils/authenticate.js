const bcrypt = require('bcrypt');
const UserModel = require('../models/user');
const createToken = require('./createToken');

const authenticate = ({ email, password }) => {
	return new Promise((resolve, reject) => {
		UserModel.findOne({ email })
			.then((user) => {
				if (!user) {
					reject(new Error('User does not exist'));
				}
				bcrypt.compare(password, user.password, (err, isValid) => {
					if (err) {
						reject(new Error('Error while creating the token'));
					}
					isValid ? resolve(createToken(user)) : reject('Wrong password');
				});
			})
			.catch(e => {
				reject(e);
			});
	});
};

module.exports = authenticate;
