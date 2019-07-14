const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverySchema = new Schema({
	origin: { type: Schema.Types.ObjectId, ref: 'points' },
	destination: { type: [Schema.Types.ObjectId], ref: 'points' },
	observations: { type: String },
	roundTrip: { type: Boolean, default: false },
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	isActive: { type: Boolean, default: true },
}, { collection: 'delivery_services', timestamps: true });

module.exports = mongoose.model('delivery_services', DeliverySchema);
