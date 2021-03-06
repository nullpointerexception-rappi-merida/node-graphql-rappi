const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: { type: String, required: true, unique: true },
	phone: {type: String, required: true },
	password: { type: String, required: true },
	isActive: { type: Boolean, default: true },
}, {
	collection: 'users', timestamps: true
});

UserSchema.pre('save', function (next) {
	const user = this;
	const SALT_FACTOR = 10;
	if (!user.isModified('password')) {
		return next();
	}
	bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

module.exports = mongoose.model('users', UserSchema);