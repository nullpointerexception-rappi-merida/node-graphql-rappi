// call the env file:
require('dotenv').config();

// third party libraries:
const { GraphQLServer } = require('graphql-yoga');
const { importSchema } = require('graphql-import');
const mongoose = require('mongoose');

const resolvers = require('./resolvers');

//Auth
const { AuthDirective } = require('./resolvers/directives');
const { verifyToken } = require('./utils/verifyToken');

// our own definitions
const typeDefs = importSchema('./app/user-schema.graphql');

// connection to mongoose.
mongoose.connect(process.env.MONGO_URI, { useCreateIndex: true, useNewUrlParser: true });
const mongo = mongoose.connection;
mongo.on('error', (error) => console.log('error is: ', error))
	.once('open', () => console.log('Connected to database'));

const server = new GraphQLServer({ 
	typeDefs, 
	resolvers,
	schemaDirectives: {
		auth: AuthDirective
	},
	context: async({request}) => verifyToken(request)
});

server.start()
	.then(() => console.log('Server started in port 4000'));
