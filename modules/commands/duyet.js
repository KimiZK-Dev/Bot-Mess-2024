exports.config = {
	name: "duyet",
	version: "1.0.6",
	credits: "Niiozic",
	hasPermssion: 3,
	specificUID: ["100001180529002"],
	description: "Quản lý tin nhắn chờ của bot",
	commandCategory: "Admin",
	usages: "[u] [t] [a]",
	cooldowns: 0,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
	if (String(event.senderID) !== String(handleReply.author)) return;
	const { body, threadID, messageID } = event;
	var count = 0;

	if (
		(isNaN(body) && body.indexOf("c") == 0) ||
		body.indexOf("cancel") == 0
	) {
		const index = body.slice(1).split(/\s+/);
		for (const singleIndex of index) {
			if (
				isNaN(singleIndex) ||
				singleIndex <= 0 ||
				singleIndex > handleReply.pending.length
			)
				return api.sendMessage(
					`→ ${singleIndex} Không phải là một con số hợp lệ`,
					threadID,
					messageID
				);
		}
		return api.sendMessage(
			`[ PENDING ] - Đã từ chối thành công`,
			threadID,
			messageID
		);
	} else {
		const index = body.split(/\s+/);
		for (const singleIndex of index) {
			if (
				isNaN(singleIndex) ||
				singleIndex <= 0 ||
				singleIndex > handleReply.pending.length
			)
				return api.sendMessage(
					`→ ${singleIndex} Không phải là một con số hợp lệ`,
					threadID,
					messageID
				);
			api.unsendMessage(handleReply.messageID);
			api.changeNickname(
				`${global.config.BOTNAME || ""}`,
				handleReply.pending[singleIndex - 1].threadID,
				api.getCurrentUserID()
			);
			api.sendMessage("", event.threadID, () =>
				api.sendMessage(
					`❯ Admin: fb.com/100001180529002`,
					handleReply.pending[singleIndex - 1].threadID
				)
			);
			count += 1;
		}
		return api.sendMessage(
			`[ PENDING ] - Đã phê duyệt thành công`,
			threadID,
			messageID
		);
	}
};

module.exports.run = async function ({ api, event, args }) {
	var prefix = global.config.PREFIX;
	var idAllow = ["100001180529002"];

	// Check if the user is allowed to use the command
	if (!idAllow.includes(String(event.senderID))) {
		return api.sendMessage(
			"Bạn không có quyền sử dụng lệnh này.",
			event.threadID,
			event.messageID
		);
	}

	if (!args[0]) {
		return api.sendMessage(
			`${prefix}${this.config.name} user: Hàng chờ người dùng
${prefix}${this.config.name} thread: Hàng chờ nhóm
${prefix}${this.config.name} all: Tất cả box đang chờ duyệt`,
			event.threadID,
			event.messageID
		);
	}
	switch (args[0]) {
		case "user":
		case "u":
		case "-u":
		case "User": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "",
				index = 1;

			try {
				var spam =
					(await api.getThreadList(100, null, ["OTHER"])) || [];
				var pending =
					(await api.getThreadList(100, null, ["PENDING"])) || [];
			} catch (e) {
				return api.sendMessage(
					"[ PENDING ] - Không thể lấy danh sách chờ",
					threadID,
					messageID
				);
			}

			const list = [...spam, ...pending].filter(
				(group) => group.isGroup == false
			);

			for (const single of list)
				msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0)
				return api.sendMessage(
					`→ Tổng số người dùng cần duyệt: ${list.length} người dùng\n${msg}\nReply (phản hồi) theo stt để duyệt`,
					threadID,
					(error, info) => {
						global.client.handleReply.push({
							name: commandName,
							messageID: info.messageID,
							author: event.senderID,
							pending: list,
						});
					},
					messageID
				);
			else
				return api.sendMessage(
					"[ PENDING ] - Hiện tại không có người dùng nào trong hàng chờ",
					threadID,
					messageID
				);
			break;
		}
		case "thread":
		case "-t":
		case "t":
		case "Thread": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "",
				index = 1;

			try {
				var spam =
					(await api.getThreadList(100, null, ["OTHER"])) || [];
				var pending =
					(await api.getThreadList(100, null, ["PENDING"])) || [];
			} catch (e) {
				return api.sendMessage(
					"[ PENDING ] - Không thể lấy danh sách đang chờ",
					threadID,
					messageID
				);
			}

			const list = [...spam, ...pending].filter(
				(group) => group.isSubscribed && group.isGroup
			);

			for (const single of list)
				msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0)
				return api.sendMessage(
					`→ Tổng số nhóm cần duyệt: ${list.length} nhóm\n${msg}\nReply (phản hồi) theo stt để duyệt`,
					threadID,
					(error, info) => {
						global.client.handleReply.push({
							name: commandName,
							messageID: info.messageID,
							author: event.senderID,
							pending: list,
						});
					},
					messageID
				);
			else
				return api.sendMessage(
					"[ PENDING ] - Hiện tại không có nhóm nào trong hàng chờ",
					threadID,
					messageID
				);
			break;
		}
		case "all":
		case "a":
		case "-a":
		case "al": {
			const { threadID, messageID } = event;
			const commandName = this.config.name;
			var msg = "",
				index = 1;

			try {
				var spam =
					(await api.getThreadList(100, null, ["OTHER"])) || [];
				var pending =
					(await api.getThreadList(100, null, ["PENDING"])) || [];
			} catch (e) {
				return api.sendMessage(
					"[ PENDING ] - Không thể lấy danh sách chờ",
					threadID,
					messageID
				);
			}

			const list = [...spam, ...pending].filter(
				(group) => group.isSubscribed
			);

			for (const single of list)
				msg += `${index++}. ${single.name}\n${single.threadID}\n`;

			if (list.length != 0)
				return api.sendMessage(
					`→ Tổng số User & Thread cần duyệt: ${list.length} User & Thread\n${msg}\nReply (phản hồi) theo stt để duyệt`,
					threadID,
					(error, info) => {
						global.client.handleReply.push({
							name: commandName,
							messageID: info.messageID,
							author: event.senderID,
							pending: list,
						});
					},
					messageID
				);
			else
				return api.sendMessage(
					"[ PENDING ] - Hiện tại không có User & Thread nào trong hàng chờ",
					threadID,
					messageID
				);
			break;
		}
	}
};
