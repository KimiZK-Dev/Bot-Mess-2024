const axios = require("axios");

module.exports = function ({ api }) {
	return async function ({ event }) {
		const { senderID, reaction, messageID } = event;
		if (senderID !== api.getCurrentUserID()) return;

		try {
			const { data } = await axios.get(
				"https://raw.githubusercontent.com/KimiZK-Dev/Tao-lao/refs/heads/main/icons.txt"
			);
			if (data.includes(reaction)) {
				api.unsendMessage(messageID);
			}
		} catch (error) {
			console.error("Lỗi khi đọc file link", error);
		}
	};
};
