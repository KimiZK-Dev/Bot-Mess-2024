const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const chalk = require("chalk");

module.exports.config = {
	name: "csl",
	version: "3.0.0",
	hasPermssion: 3,
	credits: "Tiến (Mod: KimiZK)",
	description: "In thông báo trên Console",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 0,
};

var isConsoleDisabled = false;
var num = 0;
var max = 25;
var timeStamp = 0;
var messageCount = 0;
var userMessageCount = {};
var groupMessageCount = {};
var errorCount = 0;
var reportInterval = 600000;
var maintenanceMode = false;

function saveConsoleState() {
	const saveState = () => {
		const state = {
			time: moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss DD/MM/YYYY"),
			messageCount,
			userMessageCount,
			groupMessageCount,
			errorCount,
		};
		const filePath = path.join(__dirname, "/cache");
		fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
		setTimeout(saveState, reportInterval);
	};

	saveState();
}

function createFrame(type, threadName, senderName, messageBody) {
	const borderLength = 55;
	const maxMessageLength = 38;

	if (messageBody.includes("\n") || messageBody.length > maxMessageLength) {
		messageBody =
			messageBody.split("\n")[0].slice(0, maxMessageLength) + "...";
	}

	const formatLine = (label, value, color) => {
		const line = `${label}: ${value}`;
		return `║ ${chalk[color](line.padEnd(borderLength - 4))} ║`;
	};

	const title = `${type.toUpperCase()}`;
	const formattedTitle = `║ ${chalk.yellow(title.padEnd(borderLength - 4))} ║`;

	let frame = `
╔${"═".repeat(borderLength - 2)}╗
${formattedTitle}
╠${"═".repeat(borderLength - 2)}╣
${formatLine("Nhóm", threadName, "cyan")}
${formatLine("Tên", senderName, "yellow")}
${formatLine("Tin nhắn", messageBody, "red")}
╚${"═".repeat(borderLength - 2)}╝`;

	return frame;
}

function restartConsole() {
	console.log(chalk.red("Khởi động lại console do lỗi quá nhiều!"));
	process.exit(1);
}

module.exports.handleEvent = async function ({ api, Users, event }) {
	let { threadID, senderID, isGroup } = event;

	try {
		if (isConsoleDisabled || maintenanceMode) return;

		const currentTime = moment
			.tz("Asia/Ho_Chi_Minh")
			.format("HH:mm:ss DD/MM/YYYY");
		const senderName = await Users.getNameUser(senderID);
		const messageBody = event.body || "Ảnh, video hoặc kí tự đặc biệt";

		let type = isGroup ? "CHAT TRONG NHÓM" : "RIÊNG TƯ";
		let threadName = "Không có";

		if (isGroup) {
			const threadInfo = await api.getThreadInfo(threadID);
			threadName = threadInfo.threadName || "No Name";
		}

		const infoFrame = createFrame(
			type,
			threadName,
			senderName,
			messageBody
		);
		console.log(infoFrame);

		userMessageCount[senderID] = (userMessageCount[senderID] || 0) + 1;
		groupMessageCount[threadID] = (groupMessageCount[threadID] || 0) + 1;
		messageCount++;

		if (Date.now() - timeStamp > 1000) {
			if (num <= max) num = 0;
		}

		timeStamp = Date.now();
	} catch (error) {
		console.log(chalk.red("Đã xảy ra lỗi: "), error);
		errorCount++;
		if (errorCount > 10) restartConsole();
	}
};

module.exports.run = async function ({ api, event }) {
	api.sendMessage(
		"Chức năng Console đã hoạt động !",
		event.threadID,
		event.messageID
	);

	saveConsoleState();
	setInterval(() => {
		if (!maintenanceMode) {
			console.log(chalk.green("Hệ thống đang hoạt động bình thường."));
		} else {
			console.log(chalk.yellow("Hệ thống đang trong chế độ bảo trì."));
		}
	}, 60000);
};
