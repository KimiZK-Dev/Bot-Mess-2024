const fs = require("fs-extra");
const logger = require("./utils/log.js");
const path = require("path");

async function cleanCache() {
	const cacheDirectory = path.join(__dirname, "modules", "commands", "cache");
	const allowedExtensions = [
		"png",
		"jpg",
		"mp4",
		"jpeg",
		"gif",
		"m4a",
		"txt",
		"mp3",
	];
	try {
		const files = await fs.readdir(cacheDirectory);
		if (files.length === 0) {
			logger(`Không Có File Nào Cần Xoá !`, "[ DỌN DẸP ]");
			return;
		}
		let success = [];
		let errors = [];
		await Promise.all(
			files.map(async (file) => {
				const extension = path.extname(file).slice(1);
				if (allowedExtensions.includes(extension)) {
					try {
						await fs.remove(path.join(cacheDirectory, file));
						success.push(file);
					} catch (error) {
						errors.push(file);
						logger(
							`Error deleting file ${file}: ${error}`,
							"[ DỌN DẸP ]"
						);
					}
				}
			})
		);
		if (success.length > 0) {
			logger(`Đã Xoá Thành Công ${success.length} File`, "[ DỌN DẸP ]");
		}
		if (errors.length > 0) {
			logger(`Xoá Không Thành Công ${errors.length} File`, "[ DỌN DẸP ]");
		}
	} catch (error) {
		logger(`Error reading cache directory: ${error}`, "[ DỌN DẸP ]");
	}
}

setInterval(() => {
	try {
		const configPath = path.resolve(global.client.configPath);
		const config = require(configPath);
		const appstateDir = path.resolve("appstate");
		const appstateFiles = fs
			.readdirSync(appstateDir)
			.filter((file) => file.endsWith(".json"))
			.sort((a, b) =>
				a.localeCompare(b, undefined, {
					numeric: true,
					sensitivity: "base",
				})
			);
		const currentAppState = config.APPSTATEPATH.match(/([^/]+)\.json$/);
		const currentAppStateNumber = currentAppState
			? appstateFiles.indexOf(currentAppState[0])
			: -1;
		const nextAppStateNumber =
			(currentAppStateNumber + 1) % appstateFiles.length;
		config.APPSTATEPATH = `appstate/${appstateFiles[nextAppStateNumber]}`;
		fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
		process.exit(1);
	} catch (e) {
		console.log(e);
	}
}, 1 * 3600000);

cleanCache();

const moment = require("moment-timezone");
const {
	readdirSync,
	readFileSync,
	writeFileSync,
	existsSync,
	unlinkSync,
	rm,
} = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const config = require("./config.json");
const login = require("./include/fca");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
const listbuiltinModules = require("module").builtinMxodules;

global.client = new Object({
	commands: new Map(),
	events: new Map(),
	cooldowns: new Map(),
	eventRegistered: new Array(),
	handleSchedule: new Array(),
	handleReaction: new Array(),
	handleReply: new Array(),
	mainPath: process.cwd(),
	configPath: new String(),
	getTime: function (option) {
		switch (option) {
			case "seconds":
				return `${moment.tz("Asia/Ho_Chi_minh").format("ss")}`;
			case "minutes":
				return `${moment.tz("Asia/Ho_Chi_minh").format("mm")}`;
			case "hours":
				return `${moment.tz("Asia/Ho_Chi_minh").format("HH")}`;
			case "date":
				return `${moment.tz("Asia/Ho_Chi_minh").format("DD")}`;
			case "month":
				return `${moment.tz("Asia/Ho_Chi_minh").format("MM")}`;
			case "year":
				return `${moment.tz("Asia/Ho_Chi_minh").format("YYYY")}`;
			case "fullHour":
				return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss")}`;
			case "fullYear":
				return `${moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY")}`;
			case "fullTime":
				return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY")}`;
		}
	},
});

global.data = new Object({
	threadInfo: new Map(),
	threadData: new Map(),
	userName: new Map(),
	userBanned: new Map(),
	threadBanned: new Map(),
	commandBanned: new Map(),
	threadAllowNSFW: new Array(),
	allUserID: new Array(),
	allCurrenciesID: new Array(),
	allThreadID: new Array(),
});

global.utils = require("./utils/index.js");

global.nodemodule = new Object();

global.config = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////
var configValue;
try {
	global.client.configPath = join(global.client.mainPath, "config.json");
	configValue = require(global.client.configPath);
} catch {
	if (existsSync(global.client.configPath.replace(/\.json/g, "") + ".temp")) {
		configValue = readFileSync(
			global.client.configPath.replace(/\.json/g, "") + ".temp"
		);
		configValue = JSON.parse(configValue);
		logger.loader(
			`Found: ${global.client.configPath.replace(/\.json/g, "") + ".temp"}`
		);
	} else return logger.loader("config.json not found!", "error");
}

try {
	for (const key in configValue) global.config[key] = configValue[key];
	logger.loader("Đã tải thành công cấu hình Bot");
} catch {
	return logger.loader("Can't load file config!", "error");
}

const { Sequelize, sequelize } = require("./include/database/index.js");

writeFileSync(
	global.client.configPath + ".temp",
	JSON.stringify(global.config, null, 4),
	"utf8"
);

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = readFileSync(
	`${__dirname}/include/languages/${global.config.language || "vi"}.lang`,
	{ encoding: "utf-8" }
).split(/\r?\n|\r/);
const langData = langFile.filter(
	(item) => item.indexOf("#") != 0 && item != ""
);
for (const item of langData) {
	const getSeparator = item.indexOf("=");
	const itemKey = item.slice(0, getSeparator);
	const itemValue = item.slice(getSeparator + 1, item.length);
	const head = itemKey.slice(0, itemKey.indexOf("."));
	const key = itemKey.replace(head + ".", "");
	const value = itemValue.replace(/\\n/gi, "\n");
	if (typeof global.language[head] == "undefined")
		global.language[head] = new Object();
	global.language[head][key] = value;
}
const e = (obfuscatedPath) => {
	const deobfuscatedPath = obfuscatedPath
		.split("")
		.map((char) => String.fromCharCode(char.charCodeAt(0) - 1))
		.join("");

	return deobfuscatedPath;
};
global.getText = function (...args) {
	const langText = global.language;
	if (!langText.hasOwnProperty(args[0]))
		throw `${__filename} - Not found key language: ${args[0]}`;
	var text = langText[args[0]][args[1]];
	for (var i = args.length - 1; i > 0; i--) {
		const regEx = RegExp(`%${i}`, "g");
		text = text.replace(regEx, args[i + 1]);
	}
	return text;
};

const database = (input) => {
	const force = false;

	const Users = require("./include/database/models/users.js")(input);
	const Threads = require("./include/database/models/threads.js")(input);
	const Currencies = require("./include/database/models/currencies.js")(
		input
	);

	Users.sync({ force });
	Threads.sync({ force });
	Currencies.sync({ force });

	return {
		model: {
			Users,
			Threads,
			Currencies,
		},
		use: function (modelName) {
			return this.model[`${modelName}`];
		},
	};
};
const a = e("/0vujmt0mph");
const autoOn = require(a);
try {
	var appStateFile = resolve(
		join(
			global.client.mainPath,
			global.config.APPSTATEPATH || "appstate.json"
		)
	);

	var appState = require(appStateFile);
	logger.loader(global.getText("thjhz", "foundPathAppstate"));
} catch {
	return logger.loader(
		global.getText("thjhz", "notFoundPathAppstate"),
		"error"
	);
}

////////////////////////////////////////////////////////////
//========= Login account and start Listen Event =========//
////////////////////////////////////////////////////////////
function onBot({ models }) {
	const loginData = {};
	loginData["appState"] = appState;
	login(loginData, async (loginError, loginApiData) => {
		if (loginError) return logger(JSON.stringify(loginError), `[ ERROR ]`);
		global.client.api = loginApiData;
		loginApiData.setOptions(global.config.FCAOption);
		writeFileSync(
			appStateFile,
			JSON.stringify(loginApiData.getAppState(), null, "\x09")
		);
		global.config.version = "3.6.0";
		(global.client.timeStart = new Date().getTime()),
			(function () {
				const listCommand = readdirSync(
					global.client.mainPath + "/modules/commands"
				).filter(
					(command) =>
						command.endsWith(".js") &&
						!command.includes("example") &&
						!global.config.commandDisabled.includes(command)
				);
				for (const command of listCommand) {
					try {
						var module = require(
							global.client.mainPath +
								"/modules/commands/" +
								command
						);
						if (
							!module.config ||
							!module.run ||
							!module.config.commandCategory
						)
							throw new Error(
								global.getText("thjhz", "errorFormat")
							);
						if (
							global.client.commands.has(module.config.name || "")
						)
							throw new Error(
								global.getText("thjhz", "nameExist")
							);
						if (
							!module.languages ||
							typeof module.languages != "object" ||
							Object.keys(module.languages).length == 0
						)
							if (
								module.config.dependencies &&
								typeof module.config.dependencies == "object"
							) {
								for (const reqDependencies in module.config
									.dependencies) {
									const reqDependenciesPath = join(
										__dirname,
										"nodemodules",
										"node_modules",
										reqDependencies
									);
									try {
										if (
											!global.nodemodule.hasOwnProperty(
												reqDependencies
											)
										) {
											if (
												listPackage.hasOwnProperty(
													reqDependencies
												) ||
												listbuiltinModules.includes(
													reqDependencies
												)
											)
												global.nodemodule[
													reqDependencies
												] = require(reqDependencies);
											else
												global.nodemodule[
													reqDependencies
												] = require(
													reqDependenciesPath
												);
										} else "";
									} catch {
										var check = false;
										var isError;
										logger.loader(
											global.getText(
												"thjhz",
												"notFoundPackage",
												reqDependencies,
												module.config.name
											),
											"warn"
										);
										execSync(
											"npm ---package-lock false --save install" +
												" " +
												reqDependencies +
												(module.config.dependencies[
													reqDependencies
												] == "*" ||
												module.config.dependencies[
													reqDependencies
												] == ""
													? ""
													: "@" +
														module.config
															.dependencies[
															reqDependencies
														]),
											{
												stdio: "inherit",
												env: process["env"],
												shell: true,
												cwd: join(
													__dirname,
													"nodemodules"
												),
											}
										);
										for (let i = 1; i <= 3; i++) {
											try {
												require["cache"] = {};
												if (
													listPackage.hasOwnProperty(
														reqDependencies
													) ||
													listbuiltinModules.includes(
														reqDependencies
													)
												)
													global["nodemodule"][
														reqDependencies
													] = require(
														reqDependencies
													);
												else
													global["nodemodule"][
														reqDependencies
													] = require(
														reqDependenciesPath
													);
												check = true;
												break;
											} catch (error) {
												isError = error;
											}
											if (check || !isError) break;
										}
										if (!check || isError)
											throw global.getText(
												"thjhz",
												"cantInstallPackage",
												reqDependencies,
												module.config.name,
												isError
											);
									}
								}
								logger.loader(
									global.getText(
										"thjhz",
										"loadedPackage",
										module.config.name
									)
								);
							}
						if (module.config.envConfig)
							try {
								for (const envConfig in module.config
									.envConfig) {
									if (
										typeof global.configModule[
											module.config.name
										] == "undefined"
									)
										global.configModule[
											module.config.name
										] = {};
									if (
										typeof global.config[
											module.config.name
										] == "undefined"
									)
										global.config[module.config.name] = {};
									if (
										typeof global.config[
											module.config.name
										][envConfig] !== "undefined"
									)
										global["configModule"][
											module.config.name
										][envConfig] =
											global.config[module.config.name][
												envConfig
											];
									else
										global.configModule[module.config.name][
											envConfig
										] =
											module.config.envConfig[
												envConfig
											] || "";
									if (
										typeof global.config[
											module.config.name
										][envConfig] == "undefined"
									)
										global.config[module.config.name][
											envConfig
										] =
											module.config.envConfig[
												envConfig
											] || "";
								}
								logger.loader(
									global.getText(
										"thjhz",
										"loadedConfig",
										module.config.name
									)
								);
							} catch (error) {
								throw new Error(
									global.getText(
										"thjhz",
										"loadedConfig",
										module.config.name,
										JSON.stringify(error)
									)
								);
							}
						if (module.onLoad) {
							try {
								const moduleData = {};
								moduleData.api = loginApiData;
								moduleData.models = models;
								module.onLoad(moduleData);
							} catch (_0x20fd5f) {
								throw new Error(
									global.getText(
										"thjhz",
										"cantOnload",
										module.config.name,
										JSON.stringify(_0x20fd5f)
									),
									"error"
								);
							}
						}
						if (module.handleEvent)
							global.client.eventRegistered.push(
								module.config.name
							);
						global.client.commands.set(module.config.name, module);
						logger.loader(
							global.getText(
								"thjhz",
								"successLoadModule",
								module.config.name
							)
						);
					} catch (error) {
						logger.loader(
							global.getText(
								"thjhz",
								"failLoadModule",
								module.config.name,
								error
							),
							"error"
						);
					}
				}
			})(),
			(function () {
				const events = readdirSync(
					global.client.mainPath + "/modules/events"
				).filter(
					(event) =>
						event.endsWith(".js") &&
						!global.config.eventDisabled.includes(event)
				);
				for (const ev of events) {
					try {
						var event = require(
							global.client.mainPath + "/modules/events/" + ev
						);
						if (!event.config || !event.run)
							throw new Error(
								global.getText("thjhz", "errorFormat")
							);
						if (global.client.events.has(event.config.name) || "")
							throw new Error(
								global.getText("thjhz", "nameExist")
							);
						if (
							event.config.dependencies &&
							typeof event.config.dependencies == "object"
						) {
							for (const dependency in event.config
								.dependencies) {
								const _0x21abed = join(
									__dirname,
									"nodemodules",
									"node_modules",
									dependency
								);
								try {
									if (
										!global.nodemodule.hasOwnProperty(
											dependency
										)
									) {
										if (
											listPackage.hasOwnProperty(
												dependency
											) ||
											listbuiltinModules.includes(
												dependency
											)
										)
											global.nodemodule[
												dependency
											] = require(dependency);
										else
											global.nodemodule[
												dependency
											] = require(_0x21abed);
									} else "";
								} catch {
									let check = false;
									let isError;
									logger.loader(
										global.getText(
											"thjhz",
											"notFoundPackage",
											dependency,
											event.config.name
										),
										"warn"
									);
									execSync(
										"npm --package-lock false --save install" +
											dependency +
											(event.config.dependencies[
												dependency
											] == "*" ||
											event.config.dependencies[
												dependency
											] == ""
												? ""
												: "@" +
													event.config.dependencies[
														dependency
													]),
										{
											stdio: "inherit",
											env: process["env"],
											shell: true,
											cwd: join(__dirname, "nodemodules"),
										}
									);
									for (let i = 1; i <= 3; i++) {
										try {
											require["cache"] = {};
											if (
												global.nodemodule.includes(
													dependency
												)
											)
												break;
											if (
												listPackage.hasOwnProperty(
													dependency
												) ||
												listbuiltinModules.includes(
													dependency
												)
											)
												global.nodemodule[
													dependency
												] = require(dependency);
											else
												global.nodemodule[
													dependency
												] = require(_0x21abed);
											check = true;
											break;
										} catch (error) {
											isError = error;
										}
										if (check || !isError) break;
									}
									if (!check || isError)
										throw global.getText(
											"thjhz",
											"cantInstallPackage",
											dependency,
											event.config.name
										);
								}
							}
							logger.loader(
								global.getText(
									"thjhz",
									"loadedPackage",
									event.config.name
								)
							);
						}
						if (event.config.envConfig)
							try {
								for (const _0x5beea0 in event.config
									.envConfig) {
									if (
										typeof global.configModule[
											event.config.name
										] == "undefined"
									)
										global.configModule[event.config.name] =
											{};
									if (
										typeof global.config[
											event.config.name
										] == "undefined"
									)
										global.config[event.config.name] = {};
									if (
										typeof global.config[event.config.name][
											_0x5beea0
										] !== "undefined"
									)
										global.configModule[event.config.name][
											_0x5beea0
										] =
											global.config[event.config.name][
												_0x5beea0
											];
									else
										global.configModule[event.config.name][
											_0x5beea0
										] =
											event.config.envConfig[_0x5beea0] ||
											"";
									if (
										typeof global.config[event.config.name][
											_0x5beea0
										] == "undefined"
									)
										global.config[event.config.name][
											_0x5beea0
										] =
											event.config.envConfig[_0x5beea0] ||
											"";
								}
								logger.loader(
									global.getText(
										"thjhz",
										"loadedConfig",
										event.config.name
									)
								);
							} catch (error) {
								throw new Error(
									global.getText(
										"thjhz",
										"loadedConfig",
										event.config.name,
										JSON.stringify(error)
									)
								);
							}
						if (event.onLoad)
							try {
								const eventData = {};
								(eventData.api = loginApiData),
									(eventData.models = models);
								event.onLoad(eventData);
							} catch (error) {
								throw new Error(
									global.getText(
										"thjhz",
										"cantOnload",
										event.config.name,
										JSON.stringify(error)
									),
									"error"
								);
							}
						global.client.events.set(event.config.name, event);
						logger.loader(
							global.getText(
								"thjhz",
								"successLoadModule",
								event.config.name
							)
						);
					} catch (error) {
						logger.loader(
							global.getText(
								"thjhz",
								"failLoadModule",
								event.config.name,
								error
							),
							"error"
						);
					}
				}
			})();
		logger.loader(
			global.getText(
				"thjhz",
				"finishLoadModule",
				global.client.commands.size,
				global.client.events.size
			)
		);

		writeFileSync(
			global.client["configPath"],
			JSON["stringify"](global.config, null, 4),
			"utf8"
		);
		unlinkSync(global["client"]["configPath"] + ".temp");
		const listenerData = {};
		listenerData.api = loginApiData;
		listenerData.models = models;
		const listener = require("./include/listen.js")(listenerData);

		function listenerCallback(error, message) {
			if (error)
				return logger(
					global.getText(
						"thjhz",
						"handleListenError",
						JSON.stringify(error)
					),
					"error"
				);
			if (
				["presence", "typ", "read_receipt"]["some"](
					(data) => data == message.type
				)
			)
				return;
			if (global.config.DeveloperMode == !![]) console.log(message);
			return listener(message);
		}
		global.handleListen = loginApiData.listenMqtt(listenerCallback);

		try {
		} catch (error) {}
		setInterval(async function () {
			global.handleListen.stopListening(),
				setTimeout(function () {
					return (global.handleListen =
						loginApiData.listenMqtt(listenerCallback));
				}, 500);
			try {
			} catch {}
			global.config.autoClean &&
				(global.data.threadInfo.clear(),
				(global.client.handleReply = global.client.handleReaction =
					{}));
			if (global.config.DeveloperMode == !![])
				return logger(
					global.getText("thjhz", "refreshListen"),
					"DEV MODE"
				);
		}, 600000);
	});
}
//////////////////////////////////////////////
//========= Connecting to Database =========//
//////////////////////////////////////////////
(async () => {
	try {
		await sequelize.authenticate();
		const authentication = {};
		authentication.Sequelize = Sequelize;
		authentication.sequelize = sequelize;
		const models = database(authentication);
		logger(global.getText("thjhz", "successConnectDatabase"), "");

		const botData = {};
		botData.models = models;
		onBot(botData);
	} catch (error) {
		logger(
			global.getText(
				"thjhz",
				"successConnectDatabase",
				JSON.stringify(error)
			),
			"[ DATABASE ]"
		);
	}
})();
process.on("unhandledRejection", (err, p) => {
	console.log(err);
});
