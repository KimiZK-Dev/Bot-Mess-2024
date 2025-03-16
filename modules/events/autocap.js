module.exports.config = {
	name: "autocap",
	eventType: ["message"],
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Tiến",
	description: "Tự động screenshot khi phát hiện link trong tin nhắn",
	commandCategory: "Tiện Ích",
	cooldowns: 0,
	dependencies: {
		"fs-extra": "",
		path: "",
	},
};

module.exports.handleEvent = async ({ event, api }) => {
	const { readFileSync, createReadStream, unlinkSync } =
		global.nodemodule["fs-extra"];
	const message = event.body;

	if (!message) return;

	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const urls = message.match(urlRegex);

	if (!urls) return;

	try {
		const path =
			__dirname + `/cache/${event.threadID}-${event.senderID}s.png`;
		await global.utils.downloadFile(
			`https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${urls[0]}`,
			path
		);

		api.sendMessage(
			{ attachment: createReadStream(path) },
			event.threadID,
			() => unlinkSync(path)
		);
	} catch {
		return api.sendMessage(
			"Không thể xử lý URL này, có thể định dạng không đúng ?",
			event.threadID,
			event.messageID
		);
	}
};

module.exports.run = () => {};
