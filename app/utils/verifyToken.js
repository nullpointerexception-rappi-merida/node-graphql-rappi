const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const verifyToken = async (req) => {
	const Authorization = req.get('Authorization');
	if (!Authorization) {
		return req;
	} else {
		const formatedToken = Authorization.replace('JWT ','');
		const payload = jwt.verify(formatedToken, process.env.SECRET_KEY);
		const user = await UserModel.findOne({_id:payload._id});
		if (!user) return req;
		return {...req, user};
	}
};

module.exports = {
	verifyToken
};