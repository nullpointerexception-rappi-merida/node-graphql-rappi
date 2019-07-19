const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');
const USER_TYPES = require('../models/user-types');


class AuthDirective extends SchemaDirectiveVisitor {

	// eslint-disable-next-line no-unused-vars
	visitFieldDefinition(field, details) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			if (context.user) {
				return await resolve.apply(this, args);
			} else {
				throw new Error('You need to be logged in');
			}
		};
	}
}

class CustomerTypeDirective extends SchemaDirectiveVisitor {

	// eslint-disable-next-line no-unused-vars
	visitFieldDefinition(field, details) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			if (USER_TYPES.customer === context.user.type) {
				return await resolve.apply(this, args);
			} else {
				throw new Error('You are not a customer');
			}
		};
	}
}

class DealerTypeDirective extends SchemaDirectiveVisitor {

	// eslint-disable-next-line no-unused-vars
	visitFieldDefinition(field, details) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			if (USER_TYPES.dealer === context.user.type) {
				return await resolve.apply(this, args);
			} else {
				throw new Error('You are not a dealer');
			}
		};
	}
}

module.exports = {
	AuthDirective,
	CustomerTypeDirective,
	DealerTypeDirective
};
