const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const { getPackageInfo } = require("../../utils/npm");
const prefix = global.config.PREFIX;

const execAsync = promisify(exec);

exports.config = {
	name: "pkg",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "KimiZK",
	description: "Quản lí Package NPM",
	commandCategory: "Admin",
	usages: "",
	cooldowns: 0,
};

exports.run = async function ({ api, event, args }) {
	const { threadID } = event;

	const sendMessage = (message) => {
		api.sendMessage(message, threadID, (e, info) => {
			if (!e) setTimeout(() => api.unsendMessage(info.messageID), 20000);
		});
	};

	if (!args[0]) {
		return sendMessage(
			`QUẢN LÍ PACKAGE NPM
──────────────
→ ${prefix}${this.config.name} l
Danh sách Package đã tải

→ ${prefix}${this.config.name} i [TÊN GÓI]
Tải Package 

→ ${prefix}${this.config.name} u [TÊN GÓI]
Xóa Package 

→ ${prefix}${this.config.name} info [TÊN GÓI]
Thông tin Package`
		);
	}

	switch (args[0]) {
		case "l":
			fs.readFile(
				path.join(__dirname, "..", "..", "package.json"),
				"utf8",
				(e, data) => {
					if (e) return console.error("Lỗi khi đọc file", e);

					const { dependencies } = JSON.parse(data);
					let message = "PACKAGE LIST\n──────────────\n";

					for (const [key, value] of Object.entries(dependencies)) {
						message += `→ Tên: ${key}\nPhiên bản: ${value}\n\n`;
					}

					sendMessage(
						message +
							`──────────────\n→ Tổng số: ${Object.keys(dependencies).length}`
					);
				}
			);
			break;

		case "i":
			try {
				const pkgInstalls = args.slice(1).join(" ");
				const { stdout } = await execAsync(`npm i ${pkgInstalls}`);
				sendMessage(`CÀI ĐẶT GÓI THÀNH CÔNG:\n ${stdout}`);
			} catch (e) {
				sendMessage(`Lỗi: ${e.message}`);
			}
			break;

		case "u":
			try {
				const pkgUnInstalls = args.slice(1).join(" ");
				if (!pkgUnInstalls) {
					return sendMessage(
						"Vui lòng cung cấp ít nhất 1 tên gói để xóa bỏ."
					);
				}
				const { stdout } = await execAsync(`npm un ${pkgUnInstalls}`);
				sendMessage(`GỠ GÓI THÀNH CÔNG:\n ${stdout}`);
			} catch (e) {
				sendMessage(`Lỗi: ${e.message}`);
			}
			break;

		case "info":
			const pkgName = args[1];
			if (!pkgName) {
				return sendMessage(
					"Vui lòng cung cấp tên gói để xem thông tin."
				);
			}
			const data = await getPackageInfo(pkgName);

			if (data instanceof Error) {
				return sendMessage(data.message);
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

			sendMessage(
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
→ Cộng tác viên:${collaborators}`
			);
			break;
	}
};
