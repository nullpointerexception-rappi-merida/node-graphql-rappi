// call the env file:
require('dotenv').config();

// third party libraries:
const { GraphQLServer } = require('graphql-yoga');
const { importSchema } = require('graphql-import');
const mongoose = require('mongoose');

const resolvers = require('./resolvers');

//Auth
const { AuthDirective, CustomerTypeDirective, DealerTypeDirective } = require('./resolvers/directives');
const { verifyToken } = require('./utils/verifyToken');

// our own definitions
const deliverySchema = importSchema(__dirname + '/schemas/delivery-service-schema.graphql');
const paymentMethodSchema = importSchema(__dirname + '/schemas/payment-method-schema.graphql');
const userSchema = importSchema(__dirname + '/schemas/user-schema.graphql');
const allSchemas = {
	deliverySchema, paymentMethodSchema, userSchema
};
const typeDefs = importSchema(__dirname + '/schemas/schema.graphql', allSchemas);

// connection to mongoose.
mongoose.connect(process.env.MONGO_URI, { useCreateIndex: true, useNewUrlParser: true });
const mongo = mongoose.connection;
mongo.on('error', (error) => console.log('error is: ', error))
	.once('open', () => console.log('Connected to database'));

const server = new GraphQLServer({
	typeDefs,
	resolvers,
	schemaDirectives: {
		auth: AuthDirective,
		customer: CustomerTypeDirective,
		dealer: DealerTypeDirective
	},
	context: async ({ request }) => verifyToken(request)
});

server.start()
	.then(() => console.log('Server started in port 4000'));
