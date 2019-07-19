const jwt = require('jsonwebtoken');

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

const createToken = ({ _id, email, type }) => {
	const exp = new Date().addDays(10).getTime();
	const payload = {
		_id,
		email,
		type,
		exp
	};
	return jwt.sign(payload, process.env.SECRET_KEY);
};

module.exports = createToken;
