const axios = require("axios");
const fs = require("fs");
const API_KEY = "1e802f4fc4234b40b46dca7aa33b14b9";
const { uploadImageToImgur } = require("./imgur");

async function capweb(url) {
	const res = await axios.get("https://api.apiflash.com/v1/urltoimage", {
		params: {
			access_key: API_KEY,
			format: "jpeg",
			width: 1920,
			height: 1080,
			quality: 80,
			response_type: "image",
			url,
		},
		responseType: "arraybuffer",
	});
	const buffer = Buffer.from(res.data, "binary");

	fs.writeFileSync(
		`${__dirname}/../modules/commands/cache/screenshot.jpeg`,
		buffer
	);

	const imgurData = await uploadImageToImgur(
		`${__dirname}/../modules/commands/cache/screenshot.jpeg`,
		"b473682c29bea30"
	);

	return imgurData;
}

async function capfb() {}

module.exports = { capweb };
