const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function uploadImageToImgur(imagePath, clientId) {
	const form = new FormData();
	form.append("image", fs.createReadStream(imagePath));
	form.append("type", "file");
	form.append("description", "Ảnh của bạn đây!");

	try {
		const response = await axios.post(
			"https://api.imgur.com/3/image",
			form,
			{
				headers: {
					Authorization: `Client-ID ${clientId}`,
					...form.getHeaders(),
				},
			}
		);
		return response.data.data;
	} catch (e) {
		console.error("Lỗi khi tải ảnh lên Imgur:", e);
		throw e;
	}
}

module.exports = { uploadImageToImgur };
