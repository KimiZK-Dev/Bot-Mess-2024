const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { downloadFile } = require("../../utils/index");

exports.config = {
	name: "ff",
	version: "1.0.0",
	credits: "KimiZK",
	hasPermssion: 0,
	description: "Lấy thông tin tài khoản Free Fire",
	commandCategory: "Tiện ích",
	usages: "[ID FF]",
	cooldowns: 3,
};

module.exports.run = async ({ api, event, args }) => {
	const { messageID, threadID } = event;

	if (!args[0])
		return api.sendMessage(
			`→ Vui lòng cung cấp id tài khoản!\n→ VD: ${global.config.PREFIX}ff 1157042375`,
			threadID,
			messageID
		);

	try {
		const { data } = await axios.get(
			`https://api.scaninfo.vn/freefire/info/?id=${args[0]}&key=vay500k`
		);

		const paths = {
			avatar: path.resolve(__dirname, "cache/freefire/avatar.jpg"),
			banner: path.resolve(__dirname, "cache/freefire/banner.jpg"),
			pin: path.resolve(__dirname, "cache/freefire/pin.jpg"),
			externalItem: path.resolve(
				__dirname,
				"cache/freefire/external_item.jpg"
			),
			clothes:
				data["Equipped Items"]?.["profile"]?.["Clothes"]?.map(
					(url, index) => ({
						url,
						filepath: path.resolve(
							__dirname,
							`cache/freefire/clothes_${index}.jpg`
						),
					})
				) || [],
		};

		const downloadTasks = [
			downloadFile(data["Account Avatar Image"], paths.avatar),
			downloadFile(data["Account Banner Image"], paths.banner),
			data["Account Pin Image"] !==
				"https://library.freefireinfo.site/icons/Not Found.png" &&
				downloadFile(data["Account Pin Image"], paths.pin),
			data["Equipped Items"]?.["profile"]?.["External Items"]?.[0]?.[
				"Image URL"
			] &&
				downloadFile(
					data["Equipped Items"]["profile"]["External Items"][0][
						"Image URL"
					],
					paths.externalItem
				),
			...paths.clothes.map(({ url, filepath }) =>
				downloadFile(url, filepath)
			),
		].filter(Boolean);

		await Promise.all(downloadTasks);

		const attachments = [
			fs.createReadStream(paths.avatar),
			fs.createReadStream(paths.banner),
			...(data["Account Pin Image"] !==
			"https://library.freefireinfo.site/icons/Not Found.png"
				? [fs.createReadStream(paths.pin)]
				: []),
			fs.createReadStream(paths.externalItem),
			...paths.clothes.map(({ filepath }) =>
				fs.createReadStream(filepath)
			),
		];

		api.sendMessage(
			{
				body: `→ Tên tài khoản: ${data["Account Name"]}
→ ID tài khoản: ${data["Account UID"]}
→ Cấp độ: Cấp ${data["Account Level"]}
→ Lượt thích: ${data["Account Likes"]}
→ Là người công chúng: ${data["Account Celebrity Status"] === "No" ? "Không" : "Đúng"}
──────────────
→ Pet đang dùng: ${data["Equipped Pet Information"]["Pet Type"] === "Unknown Pet" ? "Không dùng" : data["Equipped Pet Information"]["Pet Type"]}
→ Tên Pet: ${data["Equipped Pet Information"]["Pet Name"] === "Unknown Pet" ? "Không xác định" : data["Equipped Pet Information"]["Pet Name"]}
→ Cấp độ Pet: ${data["Equipped Pet Information"]["Pet Level"] === "Not Found" ? "Không xác định" : data["Equipped Pet Information"]["Pet Level"]}
──────────────
→ Tổng sao Rank TC: ${data["CS Rank Points"]} 🌟
→ Điểm rank thường: ${data["BR Rank Points"]}
──────────────
→ Chữ kí: ${data["Account Signature"]}
→ Loại thẻ vô cực: ${data["Account Booyah Pass"]}
→ Sô huy hiệu thẻ vô cực: ${data["Account Booyah Pass Badges"]}
→ Huy hiệu Evo: ${data["Account Evo Access Badge"] === "Inactive" ? "Không có" : "Có"}
──────────────
→ Đang ở bang: ${data["Guild Information"]["Guild Name"] === "Not Found" ? "Không có" : data["Guild Information"]["Guild Name"]}
→ Acc tạo lúc: ${data["Account Create Time (GMT 0530)"]}
→ Lần đăng nhập gần đây: ${data["Account Last Login (GMT 0530)"]}
→ Khu vực: ${data["Account Region"]}
──────────────
→ Sau 30s tin nhắn này sẽ tự gỡ`,
				attachment: attachments,
			},
			threadID,
			(e, info) => {
				if (e) return console.error(e);
				const allPaths = [
					paths.avatar,
					paths.banner,
					paths.pin,
					paths.externalItem,
					...paths.clothes.map(({ filepath }) => filepath),
				];
				allPaths.forEach((filepath) => {
					if (fs.existsSync(filepath)) {
						fs.unlinkSync(filepath);
					}
				});
				setTimeout(() => api.unsendMessage(info.messageID), 30000);
			},
			messageID
		);
	} catch (error) {
		console.error(error);
		api.sendMessage(
			"Không thể lấy thông tin tài khoản. Vui lòng thử lại sau.",
			threadID,
			messageID
		);
	}
};
