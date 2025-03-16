const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function getPackageInfo(name) {
	let namePkg,
		version,
		downloads,
		repository,
		timePublic,
		totalFiles,
		unpackedSize,
		homePage;
	const collaborators = [];
	const keywords = [];

	try {
		const response = await fetch(`https://www.npmjs.com/package/${name}`);
		if (!response.ok)
			throw new Error(
				`Đã xảy ra lỗi khi lấy thông tin package: ${response.statusText}`
			);

		const html = await response.text();
		const $ = cheerio.load(html);

		timePublic = $("._76473bea time").attr("title");
		namePkg = $("._50685029").text();
		version = $("._76473bea").first().text().replace("•", "").trim();
		downloads = $("._9ba9a726").text().trim();
		repository = $("#repository-link").text().trim();
		totalFiles = $("._702d723c").eq(6).find("p").text().trim();
		homePage = "https://" + $("._702d723c").eq(1).find("p").text().trim();
		unpackedSize = $("._702d723c").eq(5).find("p").text().trim();

		$("._426b8533 div a").each((index, el) => {
			collaborators.push(
				" " + $(el).attr("href").replace(/\/~/g, "").trim()
			);
		});
		$("._75a5f581").each((index, el) => {
			keywords.push(" " + $(el).text().trim());
		});

		return {
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
		};
	} catch (error) {
		console.error("Error fetching data:", error);
		return error;
	}
}

module.exports = {
	getPackageInfo,
};
