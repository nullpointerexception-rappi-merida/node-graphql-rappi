const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	birthDate: { type: Date },
	gender: { type: String, enum: ['H', 'M', 'O'] },
	profilePicture: { type: String },
	isActive: { type: Boolean, default: true },
}, {collection: 'user_profile', timestamps: true});

module.exports = mongoose.model('user_profile', UserProfileSchema);