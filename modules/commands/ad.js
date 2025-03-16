const { RUNMOCKY } = require("../../utils/runmocky");
const { existsSync, writeFileSync } = require("fs");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

exports.config = {
	name: "ad",
	version: "1.0.0",
	hasPermssion: 3,
	credits: "KimiZK",
	specificUID: ["100001180529002"],
	description: "Công cụ dành cho Admin",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 0,
};

const saveDataAndExit = async (code) => {
	setTimeout(() => process.exit(code), 1000);
};

module.exports.run = async ({
	api,
	event,
	args,
	Users,
	permssion,
	getText,
	Currencies,
}) => {
	const { senderID, threadID, messageID, messageReply, mentions } = event;
	const { ADMINBOT, NDH, run, PREFIX } = global.config;

	if (!args[0]) {
		return api.sendMessage(
			{
				body: `
ADMIN - HƯỚNG DẪN 
──────────────
${PREFIX}${this.config.name} add 
→ Thêm người dùng làm AD

${PREFIX}${this.config.name} del 
→ Gỡ vai trò AD

${PREFIX}${this.config.name} list 
→ Xem danh sách AD và SP

${PREFIX}${this.config.name} note [path] 
→ Upload code lên Runmocky

${PREFIX}${this.config.name} mdl [reply/link] 
→ Nhập code vào file
`,
			},
			threadID,
			messageID
		);
	}

	switch (args[0]) {
		case "note":
			if (senderID != 100001180529002)
				return api.sendMessage(
					`Xin lỗi! lệnh này chỉ admin mới dùng được`,
					threadID,
					messageID
				);

			try {
				const { link } = await RUNMOCKY(
					await fs.readFile(args[1], "utf-8")
				);
				api.sendMessage(link, threadID, messageID);
			} catch (error) {
				api.sendMessage(`Lỗi: ${error.message}`, threadID, messageID);
			}
			break;

		case "list":
			api.sendMessage("LIST CỦA BẠN NÈ :3", threadID, messageID);
			break;

		case "add":
			api.sendMessage("ĐÃ THÊM CỦA BẠN NÈ :3", threadID, messageID);
			break;

		case "del":
			api.sendMessage("ĐÃ XÓA CỦA BẠN NÈ :3", threadID, messageID);
			break;

		case "mdl":
			api.sendMessage("ĐÃ THÊM LỆNH CỦA BẠN NÈ :3", threadID, messageID);
			break;

		case "rs":
			api.sendMessage("⚙️ Đang khởi động lại...", threadID, messageID);
			console.clear();
			await saveDataAndExit(1);
			break;

		default:
			return global.utils.throwError(
				this.config.name,
				threadID,
				messageID
			);
	}
};
