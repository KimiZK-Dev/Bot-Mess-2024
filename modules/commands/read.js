const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { downloadFile } = require("../../utils/index");

module.exports.config = {
	name: "read",
	version: "1.0.0",
	hasPermssion: 3,
	credits: "KimiZK",
	specificUID: ["100001180529002"],
	description: "Đọc/Lấy dữ liệu của file/phương tiện",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 0,
};

module.exports.run = async function ({ args, event, api }) {
	const nameMDL = this.config.name;
	const prefix = global.config.PREFIX;
	const option = args[0];
	const sendError = (message) =>
		api.sendMessage(message, event.threadID, event.messageID);
	const send = (message, attachment = null) =>
		api.sendMessage(
			{ body: message, attachment },
			event.threadID,
			event.messageID
		);

	const readFile = async (filename) => {
		if (!filename) return sendError("Vui lòng nhập tên file");
		const pathFile = path.resolve(filename);
		console.log(pathFile);

		try {
			if (!(await fs.pathExists(pathFile)))
				return sendError(`File '${filename}' không tồn tại`);

			const content = await fs.readFile(pathFile, "utf8");

			if (filename.endsWith(".json")) {
				try {
					const jsonData = JSON.parse(content);
					return send(
						"```\n" + JSON.stringify(jsonData, null, 2) + "\n```"
					);
				} catch (error) {
					return sendError("Lỗi khi phân tích JSON");
				}
			} else {
				return send("```\n" + content + "\n```");
			}
		} catch (error) {
			return sendError(`Lỗi khi đọc file: ${error.message}`);
		}
	};

	const readUrl = async (url) => {
		try {
			const { data } = await axios.get(url);
			const message =
				typeof data === "object" ? JSON.stringify(data, null, 2) : data;
			return send(message);
		} catch (error) {
			return sendError(`Lỗi ${url}\n ${error}`);
		}
	};

	const streamUrl = async (url) => {
		try {
			const { headers } = await axios.head(url);
			const extension = headers["content-type"]
				.split(";")[0]
				.split("/")[1];
			const dest = `${__dirname}/cache/streamed_file.${extension}`;

			await downloadFile(url, dest);
			send(`File của bạn nè`, fs.createReadStream(dest));

			fs.unlink(dest, (err) => {
				if (err) console.error(`Error deleting file: ${err}`);
			});
		} catch (error) {
			return sendError(`${error}`);
		}
	};

	switch (option) {
		case "-f":
			return readFile(args[1]);
		case "-u":
			return readUrl(args[1]);
		case "-st":
			return streamUrl(args[1]);
		default:
			return sendError(
				`READ - HƯỚNG DẪN
──────────────
→ ${prefix}${nameMDL} -f
Đọc file

→ ${prefix}${nameMDL} -u
Đọc data được fetch ở url

→ ${prefix}${nameMDL} -st
Đọc phương tiện qua url`
			);
	}
};
