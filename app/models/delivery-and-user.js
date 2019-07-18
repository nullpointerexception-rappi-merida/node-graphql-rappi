const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliveryAndUserSchema = new Schema({
	delivery: { type: Schema.Types.ObjectId, ref: 'delivery_services' },
	customer: { type: Schema.Types.ObjectId, ref: 'users' },
	dealer: { type: Schema.Types.ObjectId, ref: 'users' }
}, { collection: 'deliveries_and_users', timestamps: true });

module.exports = mongoose.model('deliveries_and_users', DeliveryAndUserSchema);
