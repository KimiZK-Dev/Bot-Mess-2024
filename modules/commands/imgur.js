const fs = require("fs");
const path = require("path");
const { downloadFile } = require("../../utils/index");
const { uploadImageToImgur } = require("../../utils/imgur");

module.exports.config = {
	name: "imgur",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Upload phương tiện lên Imgur",
	commandCategory: "Tiện ích",
	usages: "[reply]",
	cooldowns: 3,
};

module.exports.run = async ({ api, event }) => {
	const { threadID, type, messageReply, messageID } = event;
	const ClientID = "c76eb7edd1459f3";

	if (type !== "message_reply" || !messageReply.attachments.length) {
		return api.sendMessage(
			"Bạn phải reply một video, ảnh nào đó",
			threadID,
			messageID
		);
	}

	const attachmentSend = await getAttachments(messageReply.attachments);
	const { msg, errors } = await uploadAttachmentsToImgur(
		attachmentSend,
		ClientID
	);

	if (errors.length) {
		console.error("Lỗi khi tải ảnh lên Imgur:", errors);
	}

	return api.sendMessage(msg, threadID, messageID);
};

async function getAttachments(attachments) {
	const attachmentSend = [];
	let startFile = 0;

	for (const data of attachments) {
		const ext = getExtension(data.type);
		const pathSave = path.join(__dirname, `/cache/${startFile++}.${ext}`);
		await downloadFile(data.url, pathSave);
		attachmentSend.push(pathSave);
	}

	return attachmentSend;
}

function getExtension(type) {
	switch (type) {
		case "photo":
			return "jpg";
		case "video":
			return "mp4";
		case "audio":
			return "m4a";
		case "animated_image":
			return "gif";
		default:
			return "txt";
	}
}

async function uploadAttachmentsToImgur(attachments, clientID) {
	let msg = "";
	const errors = [];

	for (const filePath of attachments) {
		try {
			const { link } = await uploadImageToImgur(filePath, clientID);
			msg += `${link}\n`;
		} catch (error) {
			errors.push({ filePath, error });
		} finally {
			fs.unlinkSync(filePath);
		}
	}

	return { msg, errors };
}
