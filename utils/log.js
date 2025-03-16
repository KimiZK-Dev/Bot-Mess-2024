const chalk = require("chalk");

module.exports = (data, option) => {
	switch (option) {
		case "warn":
			console.log("» Lỗi « " + data);
			break;
		case "error":
			console.log("» Lỗi « " + data);
			break;
		default:
			console.log(`${option} » ` + data);
			break;
	}
};

module.exports.loader = (data, option) => {
	const message = `[ LOAD ] > ${chalk.hex("#FADFA1")(data)}`;
	switch (option) {
		case "warn":
			console.log(chalk.hex("#FFFF00")(message));
			break;
		case "error":
			console.log(chalk.hex("#FFFF00")(message));
			break;
		default:
			console.log(chalk.hex("#FFFF00")(message));
			break;
	}
};
