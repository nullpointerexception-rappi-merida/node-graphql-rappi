const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');

class AuthDirective extends SchemaDirectiveVisitor {

	// eslint-disable-next-line no-unused-vars
	visitFieldDefinition(field, details) {
		const { resolve = defaultFieldResolver } = field;
		field.resolve = async function (...args) {
			const [, , context] = args;
			/*TODO: check if 'author' instead of user*/
			if (context.user) {
				return await resolve.apply(this, args);
			} else {
				throw new Error('You need to be logged in');
			}
		};
	}
}

module.exports = {
	AuthDirective
};