module.exports.config = {
	name: "npm",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "",
	commandCategory: "Tiện ích",
	usages: "",
	cooldowns: 3,
};

const { getPackageInfo } = require("../../utils/npm");
module.exports.run = async function ({ api, event, args }) {
	const data = await getPackageInfo(args[0]);

	if (data instanceof Error) {
		return api.sendMessage(data.message, event.threadID, event.messageID);
	}

	const {
		homePage,
		unpackedSize,
		totalFiles,
		namePkg,
		timePublic,
		version,
		downloads,
		repository,
		collaborators,
		keywords,
	} = data;

	api.sendMessage(
		`
THÔNG TIN PACKAGE NPM
──────────────
→ Tên: ${namePkg}
→ Phiên bản mới nhất: ${version}
→ Xuất bản: ${timePublic}
──────────────
→ Dung lượng chưa nén: ${unpackedSize}
→ Tổng số tệp: ${totalFiles}
→ Tải xuống hàng tuần: ${downloads}
→ Từ khóa:${keywords}
──────────────
→ Trang chính: ${homePage}
→ Link Git: ${repository}
→ Cộng tác viên:${collaborators}`,
		event.threadID,
		event.messageID
	);
};
