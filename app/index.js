// call the env file:
require('dotenv').config();

// third party libraries:
const { GraphQLServer } = require('graphql-yoga');
const { importSchema } = require('graphql-import');
const mongoose = require('mongoose');

const resolvers = require('./resolvers');


// our own definitions
const typeDefs = importSchema('./app/user-schema.graphql');

// connection to mongoose.
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
const mongo = mongoose.connection;
mongo.on('error', (error) => console.log('error is: ', error))
	.once('open', () => console.log('Connected to database'));

const server = new GraphQLServer({ typeDefs, resolvers });

server.start()
	.then(() => console.log('Server started in port 4000'));
