module.exports.config = {
	name: "uid",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Lấy id người dùng",
	commandCategory: "Nhóm",
	cooldowns: 0,
};

const { getUID } = require("../../utils/index");
module.exports.run = async ({ event, api, args }) => {
	if (args[0]) {
		const uid = await getUID(args[0]);
		api.sendMessage(uid, event.threadID, event.messageID);
	} else {
		api.sendMessage(event.senderID, event.threadID, event.messageID);
	}
};
