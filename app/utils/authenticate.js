const bcrypt = require('bcrypt');
const UserModel = require('../models/user');
const createToken = require('./createToken');

const authenticate = ({ email, password }) => {
	return new Promise((resolve, reject) => {
		UserModel.findOne({ email })
			.then((author) => {
				if (!author) {
					reject(new Error('Author does not exist'));
				}
				bcrypt.compare(password, author.password, (err, isValid) => {
					if (err) {
						reject(new Error('Error while creating the token'));
					}
					isValid ? resolve(createToken(author)) : reject('Passwords did not match');
				});
			})
			.catch(e => {
				reject(e);
			});
	});
};

module.exports = authenticate;
