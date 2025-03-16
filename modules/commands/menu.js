module.exports.config = {
	name: "menu",
	version: "1.1.1",
	hasPermssion: 0,
	credits: "DC-Nam",
	description: "Xem danh sách lệnh và info",
	commandCategory: "Tiện ích",
	usages: "[tên lệnh/all]",
	cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
	const { threadID: tid, messageID: mid } = event;
	const type = args[0] ? args[0].toLowerCase() : "";
	const cmds = global.client.commands;
	const TIDdata = global.data.threadData.get(tid) || {};
	const prefix = TIDdata.PREFIX || global.config.PREFIX;

	if (type) {
		const cmd = cmds.get(type);
		if (!cmd) {
			const stringSimilarity = require("string-similarity");
			const commandName = args.shift().toLowerCase();
			const allCommandNames = Array.from(cmds.keys());
			const checker = stringSimilarity.findBestMatch(
				commandName,
				allCommandNames
			);

			if (checker.bestMatch.rating >= 0.5) {
				const msg = `
→ Không tìm thấy lệnh '${type}' trong hệ thống
→ Lệnh gần giống được tìm thấy => '${checker.bestMatch.target}'`;
				return sendTemporaryMessage(api, msg, tid, mid);
			}
		} else {
			const {
				name,
				version,
				credits,
				hasPermssion,
				description,
				commandCategory,
				cooldowns,
			} = cmd.config;
			const msg = `→ Tên lệnh: ${name} 
──────────────
→ Coder: ${credits}
→ Phiên Bản: ${version}
→ Quyền Hạn: ${TextPr(hasPermssion)}
→ Mô Tả: ${description}
→ Thuộc Nhóm: ${commandCategory}
→ Thời Gian Chờ: ${cooldowns}s`;
			return sendTemporaryMessage(api, msg, tid, mid);
		}
	} else {
		const categories = getCmdCategories(cmds);
		let msg = categories
			.map(
				(cmd, i) => `
${i + 1}. ${cmd.cmdCategory.toUpperCase()}
→ Quyền Hạn: ${TextPr(cmd.permission)}
→ Tổng ${cmd.nameModule.length} Lệnh
→ Gồm: ${cmd.nameModule.join(", ")}
──────────────`
			)
			.join("");

		msg += `
→ Tổng số lệnh: ${cmds.size}
→ ${prefix}menu + tên lệnh để xem chi tiết
→ Sau 15s sẽ tự gỡ tin nhắn
`;
		return sendTemporaryMessage(api, msg, tid, mid);
	}
};

function getCmdCategories(cmds) {
	const categories = [];
	cmds.forEach((cmd) => {
		const { commandCategory, hasPermssion, name: nameModule } = cmd.config;
		const category = categories.find(
			(i) => i.cmdCategory === commandCategory
		);
		if (category) {
			category.nameModule.push(nameModule);
		} else {
			categories.push({
				cmdCategory: commandCategory,
				permission: hasPermssion,
				nameModule: [nameModule],
			});
		}
	});
	return categories.sort((a, b) => b.nameModule.length - a.nameModule.length);
}

function sendTemporaryMessage(api, msg, tid, mid) {
	return api.sendMessage(
		msg,
		tid,
		(err, info) => {
			if (!err)
				setTimeout(() => api.unsendMessage(info.messageID), 15000);
		},
		mid
	);
}

function TextPr(permission) {
	return (
		["Thành Viên", "QTV Nhóm", "Admin Bot", "Toàn Quyền"][permission] ||
		"Toàn Quyền"
	);
}
