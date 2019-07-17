const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	birthDate: { type: String },
	gender: { type: String, enum: ['F', 'M', 'O'] },
	profilePicture: { type: String },
	user: { type: Schema.Types.ObjectId, ref: 'users' }
}, { collection: 'user_profiles', timestamps: true });

module.exports = mongoose.model('user_profiles', UserProfileSchema);
