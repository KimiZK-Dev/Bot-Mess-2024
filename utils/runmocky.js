const axios = require("axios");

async function RUNMOCKY(data) {
	const payload = {
		status: 200,
		content: data,
		content_type: "application/json",
		charset: "UTF-8",
		secret: "KimiZK-Dev",
		expiration: "never",
	};

	try {
		const res = await axios.post("https://api.mocky.io/api/mock", payload);
		return res.data;
	} catch (error) {
		console.error("Lỗi khi upload data lên Runmocky", error);
	}
}

module.exports = { RUNMOCKY };
