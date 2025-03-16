module.exports = function ({ api, models, Users, Threads, Currencies }) {
	const stringSimilarity = require("string-similarity"),
		escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
		logger = require("../../utils/log.js");

	const axios = require("axios");
	const request = require("request");
	const fs = require("fs");
	const path = require("path");
	const moment = require("moment-timezone");
	return async function ({ event }) {
		const dateNow = Date.now();
		const time = moment
			.tz("Asia/Ho_Chi_minh")
			.format("HH:MM:ss DD/MM/YYYY");
		const {
			allowInbox,
			PREFIX,
			ADMINBOT,
			NDH,
			DeveloperMode,
			adminOnly,
			keyAdminOnly,
			ndhOnly,
			adminPaseOnly,
		} = global.config;
		const {
			userBanned,
			threadBanned,
			threadInfo,
			threadData,
			commandBanned,
		} = global.data;
		const { commands, cooldowns } = global.client;
		var { body, senderID, threadID, messageID } = event;
		var senderID = String(senderID),
			threadID = String(threadID);
		const threadSetting = threadData.get(threadID) || {};
		const prefixRegex = new RegExp(
			`^(<@!?${senderID}>|${escapeRegex(
				threadSetting.hasOwnProperty("PREFIX")
					? threadSetting.PREFIX
					: PREFIX
			)})\\s*`
		);

		if (senderID === api.getCurrentUserID()) return;

		if (
			userBanned.has(senderID) ||
			threadBanned.has(threadID) ||
			(allowInbox == ![] && senderID == threadID)
		) {
			if (!body.startsWith(PREFIX)) return;
			if (!ADMINBOT.includes(senderID.toString())) {
				if (userBanned.has(senderID)) {
					const { reason, dateAdded } =
						userBanned.get(senderID) || {};
					return api.sendMessage(
						global.getText(
							"handleCommand",
							"userBanned",
							reason,
							dateAdded
						),
						threadID,
						async (err, info) => {
							await new Promise((resolve) =>
								setTimeout(resolve, 5 * 1000)
							);
							return api.unsendMessage(info.messageID);
						},
						messageID
					);
				} else {
					if (threadBanned.has(threadID)) {
						const { reason, dateAdded } =
							threadBanned.get(threadID) || {};
						return api.sendMessage(
							global.getText(
								"handleCommand",
								"threadBanned",
								reason,
								dateAdded
							),
							threadID,
							async (err, info) => {
								await new Promise((resolve) =>
									setTimeout(resolve, 5 * 1000)
								);
								return api.unsendMessage(info.messageID);
							},
							messageID
						);
					}
				}
			}
		}
		body = body !== undefined ? body : "x";
		const [matchedPrefix] = body.match(prefixRegex) || [""];
		var args = body.slice(matchedPrefix.length).trim().split(/ +/);
		var commandName = args.shift().toLowerCase();
		var command = commands.get(commandName);

		if (!prefixRegex.test(body)) {
			args = (body || "").trim().split(/ +/);
			commandName = args.shift()?.toLowerCase();
			command = commands.get(commandName);
			if (command && command.config) {
				if (
					command.config.usePrefix === false &&
					commandName.toLowerCase() !==
						command.config.name.toLowerCase()
				) {
					api.sendMessage(
						global.getText(
							"handleCommand",
							"notMatched",
							command.config.name
						),
						event.threadID,
						event.messageID
					);
					return;
				}
				if (
					command.config.usePrefix === true &&
					!body.startsWith(PREFIX)
				) {
					return;
				}
			}
			if (command && command.config) {
				if (typeof command.config.usePrefix === "undefined") {
					return;
				}
			}
		}

		if (!command) {
			if (
				!body.startsWith(
					threadSetting.hasOwnProperty("PREFIX")
						? threadSetting.PREFIX
						: PREFIX
				)
			)
				return;

			var allCommandName = [];
			const commandValues = commands["keys"]();
			for (const cmd of commandValues) allCommandName.push(cmd);

			const checker = stringSimilarity.findBestMatch(
				commandName,
				allCommandName
			);
			if (checker.bestMatch.rating >= 0.5)
				command = client.commands.get(checker.bestMatch.target);
		}

		if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
			if (!ADMINBOT.includes(senderID)) {
				const banThreads = commandBanned.get(threadID) || [],
					banUsers = commandBanned.get(senderID) || [];
				if (banThreads.includes(command.config.name))
					return api.sendMessage(
						global.getText(
							"handleCommand",
							"commandThreadBanned",
							command.config.name
						),
						threadID,
						async (err, info) => {
							await new Promise((resolve) =>
								setTimeout(resolve, 5 * 1000)
							);
							return api.unsendMessage(info.messageID);
						},
						messageID
					);
				if (banUsers.includes(command.config.name))
					return api.sendMessage(
						global.getText(
							"handleCommand",
							"commandUserBanned",
							command.config.name
						),
						threadID,
						async (err, info) => {
							await new Promise((resolve) =>
								setTimeout(resolve, 5 * 1000)
							);
							return api.unsendMessage(info.messageID);
						},
						messageID
					);
			}
		}
		var threadInfo2;
		if (event.isGroup == !![])
			try {
				threadInfo2 =
					threadInfo.get(threadID) ||
					(await Threads.getInfo(threadID));
				if (Object.keys(threadInfo2).length == 0) throw new Error();
			} catch (err) {
				logger(
					global.getText(
						"handleCommand",
						"cantGetInfoThread",
						"error"
					)
				);
			}
		var permssion = 0;
		var threadInfoo =
			threadInfo.get(threadID) || (await Threads.getInfo(threadID));
		const find = threadInfoo.adminIDs?.find((el) => el.id == senderID);
		if (NDH.includes(senderID.toString())) permssion = 2;
		if (ADMINBOT.includes(senderID.toString())) permssion = 3;
		else if (
			!ADMINBOT.includes(senderID) &&
			!NDH.includes(senderID) &&
			find
		)
			permssion = 1;

		if (command.config.hasPermssion === 3) {
			const specificUID = command.config.specificUID;
			if (!specificUID.includes(senderID)) {
				return api.sendMessage(
					global.getText(
						"handleCommand",
						"permssionNotEnough",
						command.config.name
					),
					event.threadID,
					event.messageID
				);
			}
		} else if (command.config.hasPermssion > permssion) {
			return api.sendMessage(
				global.getText(
					"handleCommand",
					"permssionNotEnough",
					command.config.name
				),
				event.threadID,
				event.messageID
			);
		}

		if (!client.cooldowns.has(command.config.name))
			client.cooldowns.set(command.config.name, new Map());
		const timestamps = client.cooldowns.get(command.config.name);
		const expirationTime = (command.config.cooldowns || 1) * 1000;
		if (
			timestamps.has(senderID) &&
			dateNow < timestamps.get(senderID) + expirationTime
		)
			return api.sendMessage(
				`🔄 Vui lòng quay lại sau ${(
					(timestamps.get(senderID) + expirationTime - dateNow) /
					1000
				)
					.toString()
					.slice(0, 5)}s`,
				threadID,
				messageID
			);

		var getText2;
		if (
			command.languages &&
			typeof command.languages == "object" &&
			command.languages.hasOwnProperty(global.config.language)
		)
			getText2 = (...values) => {
				var lang =
					command.languages[global.config.language][values[0]] || "";
				for (
					var i = values.length;
					i > 0x2533 + 0x1105 + -0x3638;
					i--
				) {
					const expReg = RegExp("%" + i, "g");
					lang = lang.replace(expReg, values[i]);
				}
				return lang;
			};
		else getText2 = () => {};
		try {
			const Obj = {};
			Obj.api = api;
			Obj.event = event;
			Obj.args = args;
			Obj.models = models;
			Obj.Users = Users;
			Obj.Threads = Threads;
			Obj.Currencies = Currencies;
			Obj.permssion = permssion;
			Obj.getText = getText2;
			command.run(Obj);
			timestamps.set(senderID, dateNow);
			if (DeveloperMode == !![])
				logger(
					global.getText(
						"handleCommand",
						"executeCommand",
						time,
						commandName,
						senderID,
						threadID,
						args.join(" "),
						Date.now() - dateNow
					),
					"[ DEV MODE ]"
				);
			return;
		} catch (e) {
			return api.sendMessage(
				global.getText("handleCommand", "commandError", commandName, e),
				threadID
			);
		}
	};
};
