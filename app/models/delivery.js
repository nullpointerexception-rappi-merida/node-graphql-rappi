const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverySchema = new Schema({
	origin: { type: String, required: true },           //Address
	destination: [{ type: String, required: true }],    //Address
	observations: { type: String },
	roundTrip: { type: Boolean, default: false },
}, {collection: 'delivery', timestamps: true});

module.exports = mongoose.model('delivery', DeliverySchema);