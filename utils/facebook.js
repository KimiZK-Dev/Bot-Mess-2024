const axios = require("axios");
require("dotenv").config();
const ACCESSTOKEN = process.env.ACCESSTOKEN;

class FACEBOOK {
	async getInfo(UID) {
		const res = await axios.get(
			`https://graph.facebook.com/${UID}?fields=id,education,timezone,updated_time,is_verified,cover,created_time,work,hometown,username,name,locale,website,birthday,gender,relationship_status,significant_other,subscribers.limit(0)&access_token=${ACCESSTOKEN}`
		);
		return {
			data: res.data,
			cover: res.data?.cover?.source,
		};
	}

	async avatar(UID) {
		const res = await axios.get(
			`https://graph.facebook.com/${UID}/picture?width=1500&height=1500&access_token=${ACCESSTOKEN}`,
			{ responseType: "arraybuffer" }
		);
		return res.data;
	}
}

module.exports = new FACEBOOK();
