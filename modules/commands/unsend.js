const fs = require("fs");
const filePath = "modules/commands/data/unsendReaction.json";

module.exports.config = {
	name: "unsend",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Cho phép gỡ tin nhắn bằng thả cảm xúc",
	commandCategory: "Nhóm",
	cooldowns: 0,
};

module.exports.run = ({ event, api }) => {
	try {
		let data = JSON.parse(fs.readFileSync(filePath));
		const id = event.threadID;

		data[id] = { data: !data[id]?.data };
		fs.writeFileSync(filePath, JSON.stringify(data, null, 4));

		const status = data[id].data ? "bật" : "tắt";
		api.sendMessage(
			`Gỡ tin nhắn bằng cách thả cảm xúc đã được ${status} ở ID: ${id}`,
			event.threadID,
			event.messageID
		);
	} catch (error) {
		console.error("Error updating reaction:", error);
		api.sendMessage(
			"Đã xảy ra lỗi khi cập nhật phản ứng.",
			event.threadID,
			event.messageID
		);
	}
};
