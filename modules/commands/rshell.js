const { promisify } = require("util");
const { exec } = require("child_process");
const execPromise = promisify(exec);

module.exports.config = {
	name: "rshell",
	version: "1.0.0",
	hasPermssion: 3,
	credits: "KimiZK",
	specificUID: ["100001180529002"],
	description: "Chạy lệnh shell",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
	const shellCommand = args.join(" ");

	if (!shellCommand) {
		return api.sendMessage(
			"⚠️ Vui lòng nhập lệnh shell cần chạy!",
			event.threadID,
			event.messageID
		);
	}

	try {
		const { stdout, stderr } = await execPromise(shellCommand);
		if (stderr) {
			return api.sendMessage(
				`⚠️ stderr: ${stderr}`,
				event.threadID,
				event.messageID
			);
		}
		api.sendMessage(
			`✅ stdout: ${stdout}`,
			event.threadID,
			event.messageID
		);
	} catch (error) {
		api.sendMessage(
			`❌ Lỗi khi thực thi lệnh: ${error.message}`,
			event.threadID,
			event.messageID
		);
	}
};
