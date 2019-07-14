const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Point = new Schema({
	latitude: { type: String, required: true },
	longitude: { type: String, required: true },
	reference: { type: String },
	deliveryService: { type: Schema.Types.ObjectId, ref: 'delivery_services' }
}, { collection: 'points', timestamps: true });

module.exports = mongoose.model('points', Point);
