module.exports.config = {
	name: "link",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Mirai-Team",
	description: "Lấy url download từ video, audio, hoặc ảnh được gửi từ nhóm",
	commandCategory: "Admin",
	cooldowns: 1,
};

module.exports.run = async ({ api, event }) => {
	const messageReply = event.messageReply;
	if (!messageReply) {
		return api.sendMessage(
			"❌ Bạn phải reply một audio, video, hoặc ảnh nào đó",
			event.threadID,
			event.messageID
		);
	}

	const attachment = messageReply.attachments?.[0];
	if (!attachment) {
		return api.sendMessage(
			"❌ Không có file đính kèm trong tin nhắn này. Vui lòng reply một audio, video, hoặc ảnh!",
			event.threadID,
			event.messageID
		);
	}

	if (messageReply.attachments.length > 1) {
		return api.sendMessage(
			"❌ Vui lòng reply chỉ một audio, video, hoặc ảnh!",
			event.threadID,
			event.messageID
		);
	}

	return api.sendMessage(attachment.url, event.threadID, event.messageID);
};
