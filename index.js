const { spawn } = require("child_process");
const fs = require("fs");
const axios = require("axios");
var deviceID = require("uuid");
var adid = require("uuid");
const logger = require("./utils/log");
var express = require("express");
var app = express();

function getUptimeString() {
	const uptime = process.uptime();
	const uptimeHours = Math.floor(uptime / (60 * 60));
	const uptimeMinutes = Math.floor((uptime % (60 * 60)) / 60);
	const uptimeSeconds = Math.floor(uptime % 60);
	return `${uptimeHours.toString().padStart(2, "0")}:${uptimeMinutes.toString().padStart(2, "0")}:${uptimeSeconds.toString().padStart(2, "0")}`;
}
app.get("/", function (req, res) {
	const botInfo = {
		Author: "Thjhn",
		Uptime: getUptimeString(),
	};
	res.json(botInfo);
});

app.listen(8080, function () {});
function startBot(message) {
	message ? logger(message, "[ Starting ]") : "";
	const child = spawn(
		"node",
		["--trace-warnings", "--async-stack-traces", "main.js"],
		{
			cwd: __dirname,
			stdio: "inherit",
			shell: true,
		}
	);
	console.clear();
	logger(`KimiZK-Dev (Source: T.Kien)`, "[ DATABASE ]");
	fs.readFile("package.json", "utf8", (err, data) => {
		if (err) {
			return;
		}
		try {
			const packageJson = JSON.parse(data);
			const dependencies = packageJson.dependencies || {};
			const totalDependencies = Object.keys(dependencies).length;
			logger(
				`Hiện tại tổng có ${totalDependencies} Package`,
				"[ PACKAGE ]"
			);
		} catch (parseError) {}
	});
	child.on("close", (codeExit) => {
		if (codeExit != 0 || (global.countRestart && global.countRestart < 5)) {
			startBot("Kiendz");
			global.countRestart += 1;
			return;
		} else return;
	});

	child.on("error", function (error) {
		logger("Đã xảy ra lỗi: " + JSON.stringify(error), "[ Starting ]");
	});
}
const config = require("./config.json");
async function get2fa() {
	try {
		const response = await axios.get(
			`https://api.code.pro.vn/2fa/v1/get-code?secretKey=${config.OTPKEY}`
		);
		return response.data.code;
	} catch (error) {}
}
async function login() {
	if (config.ACCESSTOKEN !== "") return;
	if (config.EMAIL === "") {
		return logger.loader("Điền Tài Khoản Và Mật Khẩu vào `config.json`!");
	}
	var uid = config.EMAIL;
	var password = config.PASSWORD;
	var fa = await get2fa();

	var form = {
		adid: adid.v4(),
		email: uid,
		password: password,
		format: "json",
		device_id: deviceID.v4(),
		cpl: "true",
		family_device_id: deviceID.v4(),
		locale: "en_US",
		client_country_code: "US",
		credentials_type: "device_based_login_password",
		generate_session_cookies: "1",
		generate_analytics_claim: "1",
		generate_machine_id: "1",
		currently_logged_in_userid: "0",
		try_num: "1",
		enroll_misauth: "false",
		meta_inf_fbmeta: "NO_FILE",
		source: "login",
		machine_id: randomString(24),
		meta_inf_fbmeta: "",
		fb_api_req_friendly_name: "authenticate",
		fb_api_caller_class:
			"com.facebook.account.login.protocol.Fb4aAuthHandler",
		api_key: "882a8490361da98702bf97a021ddc14d",
		access_token: "275254692598279|585aec5b4c27376758abb7ffcb9db2af",
	};

	form.sig = encodesig(sort(form));
	var options = {
		url: "https://b-graph.facebook.com/auth/login",
		method: "post",
		data: form,
		transformRequest: [
			(data, headers) => {
				return require("querystring").stringify(data);
			},
		],
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"x-fb-friendly-name": form["fb_api_req_friendly_name"],
			"x-fb-http-engine": "Liger",
			"user-agent":
				"Mozilla/5.0 (Linux; Android 12; TECNO CH9 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.118 Mobile Safari/537.36[FBAN/EMA;FBLC/pt_BR;FBAV/339.0.0.10.100;]",
		},
	};
	axios(options)
		.then((i) => {
			var sessionCookies = i.data.session_cookies;
			var cookies = sessionCookies.reduce((acc, cookie) => {
				acc += `${cookie.name}=${cookie.value};`;
				return acc;
			}, "");
			if (i.data.access_token) {
				config.ACCESSTOKEN = i.data.access_token;
				saveConfig(config);
			}
		})
		.catch(async function (error) {
			var data = error.response.data.error.error_data;
			form.twofactor_code = fa;
			form.encrypted_msisdn = "";
			form.userid = data.uid;
			form.machine_id = data.machine_id;
			form.first_factor = data.login_first_factor;
			form.credentials_type = "two_factor";
			await new Promise((resolve) => setTimeout(resolve, 2000));
			delete form.sig;
			form.sig = encodesig(sort(form));
			var option_2fa = {
				url: "https://b-graph.facebook.com/auth/login",
				method: "post",
				data: form,
				transformRequest: [
					(data, headers) => {
						return require("querystring").stringify(data);
					},
				],
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					"x-fb-http-engine": "Liger",
					"user-agent":
						"Mozilla/5.0 (Linux; Android 12; TECNO CH9 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.118 Mobile Safari/537.36[FBAN/EMA;FBLC/pt_BR;FBAV/339.0.0.10.100;]",
				},
			};
			axios(option_2fa)
				.then((i) => {
					var sessionCookies = i.data.session_cookies;
					var cookies = sessionCookies.reduce((acc, cookie) => {
						acc += `${cookie.name}=${cookie.value};`;
						return acc;
					}, "");
					if (i.data.access_token) {
						config.ACCESSTOKEN = i.data.access_token;
						saveConfig(config);
					}
				})
				.catch(function (error) {
					console.log(error.response.data);
				});
		});
}

function saveConfig(data) {
	setTimeout(() => {
		const json = JSON.stringify(data, null, 4);
		fs.writeFileSync(`./config.json`, json);
	}, 50);
}
function randomString(length) {
	length = length || 10;
	var char = "abcdefghijklmnopqrstuvwxyz";
	char = char.charAt(Math.floor(Math.random() * char.length));
	for (var i = 0; i < length - 1; i++) {
		char += "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
			Math.floor(36 * Math.random())
		);
	}
	return char;
}

function encodesig(string) {
	var data = "";
	Object.keys(string).forEach(function (info) {
		data += info + "=" + string[info];
	});
	data = md5(data + "62f8ce9f74b12f84c123cc23437a4a32");
	return data;
}

function md5(string) {
	return require("crypto").createHash("md5").update(string).digest("hex");
}

function sort(string) {
	var sor = Object.keys(string).sort(),
		data = {},
		i;
	for (i in sor) data[sor[i]] = string[sor[i]];
	return data;
}

async function startb() {
	if (config.ACCESSTOKEN !== "") {
		startBot();
	} else {
		login();
		setTimeout(() => {
			startBot();
		}, 5000);
	}
}
startb();
