module.exports.config = {
	name: "tid",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Lấy id nhóm",
	commandCategory: "Nhóm",
	cooldowns: 0,
};

module.exports.run = ({ event, api }) => {
	api.sendMessage(event.threadID, event.threadID, event.messageID);
};
