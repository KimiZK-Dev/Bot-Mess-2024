const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const _ = require("lodash");
const readFileAsync = promisify(fs.readFile);
const pathChars = path.join(
	__dirname,
	"cache",
	"lienquan",
	"danh_sach_tuong.txt"
);
const { name, images, skinsName, news, skill } = require("../../utils/lq");

module.exports.config = {
	name: "lq",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Thông tin tướng Liên Quấn",
	commandCategory: "Tiện ích",
	cooldowns: 0,
};

module.exports.run = async ({ event, api, args }) => {
	if (!args[0]) {
		return api.sendMessage(
			`
INFO - LIÊN QUÂN
──────────────
→ ${global.config.PREFIX}${module.exports.config.name} list
Xem danh sách tướng

→ ${global.config.PREFIX}${module.exports.config.name} name [tên tướng]
Xem thông tin tướng

→ ${global.config.PREFIX}${module.exports.config.name} skill [tên tướng]
Xem thông tin kĩ năng tướng

→ ${global.config.PREFIX}${module.exports.config.name} news [trang]
Xem thông tin bài đăng 
`,
			event.threadID,
			event.messageID
		);
	}

	try {
		switch (args[0]) {
			case "list":
				const data = await readFileAsync(pathChars, "utf8");
				const indexedData = _(data.split("\n"))
					.filter((line) => line.trim())
					.map((line, index) => `${index + 1}. ${line}`)
					.join("\n");

				return api.sendMessage(
					`
Danh sách tướng hiện có
→ Số tướng: ${indexedData.split("\n").length}
──────────────
${indexedData}
──────────────
→ Lưu ý: Khi tìm kiếm ghi đúng tên như trên danh sách này !
`,
					event.threadID,
					event.messageID
				);

			case "name":
				const Name = await name(args[1]);
				const imagePaths = await images(Name);
				const listSkin = await skinsName(args[1]);

				return api.sendMessage(
					{
						body: listSkin.join("\n"),
						attachment: imagePaths.map((imagePath) =>
							fs.createReadStream(imagePath)
						),
					},
					event.threadID,
					event.messageID
				);

			case "skill":
				const Skill = await skill(args[1]);
				const { skills, imgSkills } = Skill;
				const skillDescriptions = skills
					.map(
						(skill, index) => ` ${skill.name}\n${skill.description}`
					)
					.join("\n\n");

				return api.sendMessage(
					{
						body: skillDescriptions,
						attachment: imgSkills.map((imagePath) =>
							fs.createReadStream(imagePath)
						),
					},
					event.threadID,
					event.messageID
				);

			case "news":
				const News = await news(args[1] ? args[1] : "1");
				const { pageNum, titleNews, urlNews, imgNews } = News;

				const body = titleNews
					.map((title, i) => `${title}\n→ Liên kết: ${urlNews[i]}`)
					.join("\n\n");

				return api.sendMessage(
					{
						body: `
${body}
──────────────
→ Trang hiện tại: ${args[1] ? args[1] : "1"}
→ Tổng số trang: ${pageNum}`,
						attachment: imgNews.map((imagePath) =>
							fs.createReadStream(imagePath)
						),
					},
					event.threadID,
					event.messageID
				);

			default:
				return api.sendMessage(
					"Lệnh không hợp lệ!",
					event.threadID,
					event.messageID
				);
		}
	} catch (err) {
		console.error(err);
		return api.sendMessage(
			`Xử lí không thành công!\nErr: ${err}`,
			event.threadID,
			event.messageID
		);
	}
};
