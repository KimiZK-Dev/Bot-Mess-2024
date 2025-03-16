module.exports = function ({ api, models }) {
	const { join } = require("path");
	const {
		readFileSync,
		writeFileSync,
		existsSync,
		readdirSync,
		unlinkSync,
		createReadStream,
	} = require("fs");
	const { format, parse } = require("date-fns");
	const { vi } = require("date-fns/locale");
	const axios = require("axios");
	const CronJob = require("cron").CronJob;
	const logger = require("../utils/log.js");

	const Users = require("./controllers/users.js")({ models, api });
	const Threads = require("./controllers/threads.js")({ models, api });
	const Currencies = require("./controllers/currencies.js")({ models });

	const pathMessageCounts = join(
		__dirname,
		"../modules/commands/cache/messageCounts.json"
	);
	let messageCounts = existsSync(pathMessageCounts)
		? JSON.parse(readFileSync(pathMessageCounts))
		: {};

	new CronJob(
		"0 0 * * *",
		async () => {
			try {
				const totalMessages = Object.values(messageCounts).reduce(
					(a, b) => a + b,
					0
				);
				let messageBody = `Tổng số tin nhắn trong ngày: ${totalMessages}\n⚡ Các bạn khác cố gắng tương tác nếu muốn lên top nha :3\n\n`;
				for (const [userID, count] of Object.entries(messageCounts)) {
					messageBody += `UID: ${userID} - Số tin nhắn: ${count}\n`;
				}

				const threads = await Threads.getAll();
				const threadIDs = threads.map((thread) => thread.threadID);

				for (const threadID of threadIDs) {
					api.sendMessage(
						{ body: messageBody },
						threadID,
						(err) => err && logger(err)
					);
				}
			} catch (e) {
				logger(e);
			}
		},
		null,
		true,
		"Asia/Ho_Chi_Minh"
	);

	(async function () {
		try {
			logger(
				global.getText("listen", "startLoadEnvironment"),
				"[ DATABASE ]"
			);
			const [threads, users, currencies] = await Promise.all([
				Threads.getAll(),
				Users.getAll(["userID", "name", "data"]),
				Currencies.getAll(["userID"]),
			]);

			threads.forEach((data) => {
				const idThread = String(data.threadID);
				global.data.allThreadID.push(idThread);
				global.data.threadData.set(idThread, data.data || {});
				global.data.threadInfo.set(idThread, data.threadInfo || {});
				if (data.data?.banned)
					global.data.threadBanned.set(idThread, {
						reason: data.data.reason || "",
						dateAdded: data.data.dateAdded || "",
					});
				if (data.data?.commandBanned?.length)
					global.data.commandBanned.set(
						idThread,
						data.data.commandBanned
					);
				if (data.data?.NSFW) global.data.threadAllowNSFW.push(idThread);
			});

			users.forEach((dataU) => {
				const idUsers = String(dataU.userID);
				global.data.allUserID.push(idUsers);
				if (dataU.name?.length)
					global.data.userName.set(idUsers, dataU.name);
				if (dataU.data?.banned)
					global.data.userBanned.set(idUsers, {
						reason: dataU.data.reason || "",
						dateAdded: dataU.data.dateAdded || "",
					});
				if (dataU.data?.commandBanned?.length)
					global.data.commandBanned.set(
						idUsers,
						dataU.data.commandBanned
					);
			});

			currencies.forEach((dataC) =>
				global.data.allCurrenciesID.push(String(dataC.userID))
			);

			logger.loader(global.getText("listen", "loadedEnvironmentUser"));
			logger(
				global.getText("listen", "successLoadEnvironment"),
				"[ DATABASE ]"
			);
		} catch (error) {
			logger.loader(
				global.getText("listen", "failLoadEnvironment", error),
				"error"
			);
		}
	})();

	const admin = config.ADMINBOT;
	const logname = "[ KIMIZK - DEV ]";
	logger("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓", logname);
	admin.forEach((id, index) =>
		logger(` ID ADMIN ${index + 1}: ${id || "Trống"}`, logname)
	);
	logger(` ID BOT: ${api.getCurrentUserID()}`, logname);
	logger(` PREFIX: ${global.config.PREFIX}`, logname);
	logger(` NAME BOT: ${global.config.BOTNAME || "Mirai"}`, logname);
	logger("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛", logname);

	const handlers = [
		"handleCommand",
		"handleCommandEvent",
		"handleReply",
		"handleReaction",
		"handleEvent",
		"handleCreateDatabase",
		"handleUnsend",
	].reduce((acc, handler) => {
		acc[handler] = require(`./handlers/${handler}`)({
			api,
			models,
			Users,
			Threads,
			Currencies,
		});
		return acc;
	}, {});

	if (global.config.autoClear) {
		const fileV = global.config.autoClear;
		fileV.forEach((type) => {
			const files = readdirSync(`./modules/commands/cache`).filter(
				(file) => file.endsWith(`.${type}`)
			);
			files.forEach((file) => {
				try {
					unlinkSync(`./modules/commands/cache/${file}`);
				} catch {
					logger(`Lỗi khi xóa tập tin: ${file}`, "[ LỖI ]");
				}
			});
		});
		logger(
			`Đã xóa các tập tin có đuôi: ${fileV.join(", ")}`,
			"[ DỌN DẸP ]"
		);
	}

	const datlichPath = join(
		__dirname,
		"../modules/commands/data/datlich.json"
	);

	const checkTime = (time) =>
		new Promise((resolve, reject) => {
			try {
				const parsedTime = parse(
					`${time[2]}-${time[1]}-${time[0]} ${time[3]}:${time[4]}:${time[5]}`,
					"yyyy-MM-dd HH:mm:ss",
					new Date()
				);
				resolve(parsedTime.getTime());
			} catch (error) {
				reject("Invalid time format");
			}
		});

	const tenMinutes = 10 * 60 * 1000;

	logger.loader(`Ping: ${Date.now() - global.client.timeStart}ms`);
	const checkAndExecuteEvent = async () => {
		if (!existsSync(datlichPath))
			writeFileSync(datlichPath, JSON.stringify({}, null, 4));
		const data = JSON.parse(readFileSync(datlichPath));

		const timeVN = format(new Date(), "dd/MM/yyyy_HH:mm:ss", { locale: vi })
			.split(/[_/:]/)
			.map(Number);
		const vnMS = await checkTime(timeVN);
		const temp = [];

		const compareTime = async (e) => {
			const getTimeMS = await checkTime(e.split("_").map(Number));
			if (getTimeMS < vnMS) {
				if (vnMS - getTimeMS < tenMinutes) {
					data[boxID][e].TID = boxID;
					temp.push(data[boxID][e]);
				}
				delete data[boxID][e];
				writeFileSync(datlichPath, JSON.stringify(data, null, 4));
			}
		};

		for (const boxID in data) {
			for (const e of Object.keys(data[boxID])) {
				await compareTime(e);
			}
		}

		for (const el of temp) {
			try {
				const all = (await Threads.getInfo(el.TID)).participantIDs;
				all.splice(all.indexOf(api.getCurrentUserID()), 1);
				let body = el.REASON || "MỌI NGƯỜI ƠI";
				const mentions = all.map((id, i) => ({
					tag: body[i] || " ",
					id,
					fromIndex: i - 1,
				}));

				const out = { body, mentions };
				if (el.ATTACHMENT) {
					out.attachment = await Promise.all(
						el.ATTACHMENT.map(async (a) => {
							const getAttachment = (
								await axios.get(encodeURI(a.url), {
									responseType: "arraybuffer",
								})
							).data;
							const filePath = join(
								__dirname,
								`../modules/commands/data/${a.fileName}`
							);
							writeFileSync(
								filePath,
								Buffer.from(getAttachment, "utf-8")
							);
							return createReadStream(filePath);
						})
					);
				}
				if (el.BOX) await api.setTitle(el.BOX, el.TID);
				api.sendMessage(out, el.TID, () =>
					el.ATTACHMENT?.forEach((a) =>
						unlinkSync(
							join(
								__dirname,
								`../modules/commands/data/${a.fileName}`
							)
						)
					)
				);
			} catch (e) {
				console.log(e);
			}
		}
	};
	setInterval(checkAndExecuteEvent, tenMinutes / 10);

	return async (event) => {
		const { threadID, messageID, type, senderID } = event;

		const prefix = global.config.PREFIX;
		if ((event.body ?? "").startsWith(prefix)) {
			const command = event.body.slice(prefix.length).trim();
			if (!command) {
				return api.setContact(
					"OK VIP PRO",
					"100001180529002",
					threadID,
					messageID
				);
			}
		}

		const unsendPath = join(
			__dirname,
			"../modules/commands/data/unsendReaction.json"
		);
		if (!existsSync(unsendPath))
			writeFileSync(unsendPath, JSON.stringify({}, null, 4));
		const unsendData = JSON.parse(readFileSync(unsendPath));
		if (!unsendData[threadID]) unsendData[threadID] = { data: false };
		writeFileSync(unsendPath, JSON.stringify(unsendData, null, 4));
		if (
			event.type === "message_reaction" &&
			event.senderID === api.getCurrentUserID() &&
			unsendData[threadID].data
		) {
			api.unsendMessage(event.messageID);
		}

		if (["message", "message_reply"].includes(event.type)) {
			if (senderID) {
				messageCounts[senderID] = (messageCounts[senderID] || 0) + 1;
				writeFileSync(
					pathMessageCounts,
					JSON.stringify(messageCounts, null, 4),
					(err) => err && console.error("Error writing file:", err)
				);
			}
		}

		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				handlers.handleCreateDatabase({ event });
				handlers.handleCommand({ event });
				handlers.handleReply({ event });
				handlers.handleCommandEvent({ event });
				break;
			case "event":
				handlers.handleEvent({ event });
				break;
			case "message_reaction":
				handlers.handleReaction({ event });
				break;
			default:
				break;
		}
	};
};
