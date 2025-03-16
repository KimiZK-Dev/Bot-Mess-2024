const path = require("path");
const fs = require("fs");
const moment = require("moment-timezone");
const FACEBOOK = require("../../utils/facebook");

module.exports.config = {
	name: "info",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "KimiZK",
	description: "Lấy thông tin người dùng Facebook",
	commandCategory: "Tiện ích",
	usages: "",
	cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
	const { messageID, threadID, senderID } = event;

	const info = await FACEBOOK.getInfo(senderID);
	const avatar = await FACEBOOK.avatar(senderID);
	const { data, cover } = info;
	const {
		website,
		id,
		education,
		hometown,
		timezone,
		updated_time,
		is_verified,
		created_time,
		work,
		username,
		name,
		locale,
		birthday,
		gender,
		relationship_status,
		significant_other,
		subscribers,
	} = data;

	let attachments = [];
	const avatarPath = path.join(__dirname, `/cache/avatar.jpg`);
	try {
		fs.writeFileSync(avatarPath, avatar);
		attachments.push(fs.createReadStream(avatarPath));
	} catch (e) {
		console.error(`Lỗi khi lưu avatar: ${e.message}`);
		return api.sendMessage(
			"Không thể lưu ảnh đại diện.",
			threadID,
			messageID
		);
	}

	const coverPath = path.join(__dirname, `/cache/cover.jpg`);
	if (cover) {
		try {
			const coverImage = await axios.get(cover, {
				responseType: "arraybuffer",
			});
			fs.writeFileSync(coverPath, coverImage.data);
			attachments.push(fs.createReadStream(coverPath));
		} catch (e) {
			console.error(`Lỗi khi lưu ảnh bìa: ${e.message}`);
		}
	}

	api.sendMessage(
		{
			body: `
→ Tên: ${name}
→ Tên tài khoản: ${username}
→ ID: ${id}
→ Sinh nhật: ${birthday ? birthday : "Không có"}
→ Giới tính: ${gender ? (gender === "male" ? "Nam" : "Nữ") : "Không có"}
→ Số Follows: ${subscribers ? subscribers.summary.total_count : "Không có"}
→ Đã xác minh: ${is_verified ? "Đã xác minh" : "Chưa xác minh"}
──────────────
→ Mối quan hệ: ${relationship_status}
→ Người yêu: ${significant_other ? significant_other.name : "Không có"}
──────────────
→ Quê quán: ${hometown ? hometown.name : "Không có"}
→ Trường:${education ? education.map((edc) => " " + edc.school.name) : " Không có"}
→ Công việc:${work ? work.map((job) => " " + job.employer.name) : " Không có"}
→ Trang web: ${website ? website : "Không có"}
──────────────
→ Múi giờ: ${timezone}
→ Khu vực: ${locale}
→ Ngày tạo: ${moment(created_time).format("HH:mm:ss • DD/MM/YYYY")}
→ Cập nhật lúc: ${moment(updated_time).format("HH:mm:ss • DD/MM/YYYY")}`,
			attachment: attachments,
		},
		threadID,
		() => {
			if (fs.existsSync(avatarPath)) {
				fs.unlinkSync(avatarPath);
			}
			if (cover && fs.existsSync(coverPath)) {
				fs.unlinkSync(coverPath);
			}
		},
		messageID
	);
};
