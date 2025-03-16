const { capweb } = require("../../utils/capweb");
const fs = require("fs");
const path = require("path");

module.exports.config = {
	name: "cap",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Chụp màn hình web",
	commandCategory: "Tiện ích",
	cooldowns: 2,
};

module.exports.run = async ({ event, api, args }) => {
	const dataIMG = await capweb(args[0]);

	return api.sendMessage(
		{
			body: `
${dataIMG.description}
${dataIMG.link}
`,
			attachment: fs.createReadStream(
				path.join(__dirname, "cache", "screenshot.jpeg")
			),
		},
		event.threadID,
		() => {
			fs.unlinkSync(path.join(__dirname, "cache", "screenshot.jpeg"));
		},
		event.messageID
	);
};
