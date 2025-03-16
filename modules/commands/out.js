module.exports.config = {
	name: "out",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "manhG",
	description: "Rời nhóm bằng ID",
	commandCategory: "Admin",
	usages: "[ID nhóm] [Nội dung]",
	cooldowns: 0,
};

module.exports.run = async function ({ api, Users, Threads, event, args }) {
	const TIDdata = global.data.threadData.get(event.threadID) || {};
	const prefix = TIDdata.PREFIX || global.config.PREFIX;
	var idbox = args[0];
	var reason = args.slice(1).join(" ");
	if (!idbox) {
		return api.sendMessage(
			`
→ Vui lòng cung cấp ID nhóm. 
→ Cách dùng: ${prefix}out [TID] [Lý do]`,
			event.threadID
		);
	}
	api.sendMessage(
		"→ Đã nhận lệnh rời nhóm từ Admin\n→ Lý do: " +
			(reason ? reason : "Không có lí do nào"),
		idbox,
		() =>
			api.removeUserFromGroup(`${api.getCurrentUserID()}`, idbox, () =>
				api.sendMessage(
					"→ Đã rời nhóm có id: " +
						idbox +
						"\n→ Lý do: " +
						(reason ? reason : "Không có lí do nào"),
					event.threadID
				)
			)
	);
};
