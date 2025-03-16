const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function name(name) {
	try {
		const response = await axios.get(
			`https://lienquan.garena.vn/hoc-vien/tuong-skin/d/${name}`
		);
		const html = response.data;
		const $ = cheerio.load(html);
		const imageUrls = [];
		$("picture img").each((index, element) => {
			imageUrls.push($(element).attr("src"));
		});
		return imageUrls;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

async function images(imgs) {
	try {
		const downIMGs = async (url, index) => {
			const res = await axios({
				url,
				method: "GET",
				responseType: "stream",
			});

			const pathSaveIMGs = path.join(
				__dirname,
				"..",
				"modules",
				"commands",
				"cache",
				"lienquan",
				"skins",
				`temp-${index}.jpg`
			);
			const writer = fs.createWriteStream(pathSaveIMGs);
			res.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on("finish", () => resolve(pathSaveIMGs));
				writer.on("error", reject);
			});
		};

		const attachIMGs = await Promise.all(
			imgs.map((url, index) => downIMGs(url, index))
		);

		return attachIMGs;
	} catch (error) {
		console.error("Error downloading images:", error);
	}
}

async function news(page) {
	try {
		const res = await axios.get(
			`https://lienquan.garena.vn/tin-tuc/page/${page}/#listing`
		);
		const imgNews = [];
		const titleNews = [];
		const urlNews = [];
		var pageNum;

		const html = res.data;
		const $ = cheerio.load(html);

		$(".p-news__post--img img").each((i, el) => {
			imgNews.push($(el).attr("src"));
		});
		$(".p-news__post--title").each((i, el) => {
			titleNews.push(`${i + 1}. ${$(el).text().trim()}`);
		});
		$(".p-news__post").each((i, el) => {
			urlNews.push($(el).attr("href"));
		});

		const pageNumbers = $(".p-news__posts--pagination .page-numbers")
			.map((i, el) => parseInt($(el).text(), 10))
			.get()
			.filter((num) => !isNaN(num));

		if (pageNumbers.length > 0) {
			pageNum = Math.max(...pageNumbers);
		} else {
			pageNum = 1;
		}

		const downIMGs = async (url, index) => {
			const res = await axios({
				url: url,
				method: "GET",
				responseType: "stream",
			});

			const pathSaveIMGs = path.join(
				__dirname,
				"..",
				"modules",
				"commands",
				"cache",
				"lienquan",
				"news",
				`temp-${index}.jpg`
			);
			const writer = fs.createWriteStream(pathSaveIMGs);
			res.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on("finish", () => resolve(pathSaveIMGs));
				writer.on("error", reject);
			});
		};

		const attachIMGs = await Promise.all(
			imgNews.map((url, index) => downIMGs(url, index))
		);

		return { pageNum, titleNews, urlNews, imgNews: attachIMGs };
	} catch (error) {
		console.error("Error downloading images:", error);
	}
}

async function skinsName(name) {
	try {
		const response = await axios.get(
			`https://lienquan.garena.vn/hoc-vien/tuong-skin/d/${name}`
		);
		const html = response.data;
		const $ = cheerio.load(html);

		const names = [];

		$(".hero__skins--detail h3").each((i, el) => {
			names.push($(el).text().trim());
		});

		return names;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

async function skill(name) {
	try {
		const res = await axios.get(
			`https://lienquan.garena.vn/hoc-vien/tuong-skin/d/${name}/`
		);
		const imgSkills = [];
		const skills = [];

		const html = res.data;
		const $ = cheerio.load(html);

		$(".hero__skills--list img").each((i, el) => {
			imgSkills.push($(el).attr("src"));
		});

		$(".hero__skills--detail").each((i, el) => {
			const skillName = $(el).find("h3").text().trim();
			const skillDescription = $(el).find("article").text().trim();

			skills.push({
				name: `${i + 1}. ${skillName}`,
				description: skillDescription,
			});
		});

		const downIMGs = async (url, index) => {
			const res = await axios({
				url: url,
				method: "GET",
				responseType: "stream",
			});

			const pathSaveIMGs = path.join(
				__dirname,
				"..",
				"modules",
				"commands",
				"cache",
				"lienquan",
				"skills",
				`temp-${index}.jpg`
			);
			const writer = fs.createWriteStream(pathSaveIMGs);
			res.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on("finish", () => resolve(pathSaveIMGs));
				writer.on("error", reject);
			});
		};

		const attachIMGs = await Promise.all(
			imgSkills.map((url, index) => downIMGs(url, index))
		);

		return { skills, imgSkills: attachIMGs };
	} catch (error) {
		console.error("Error downloading images:", error);
	}
}

module.exports = {
	name,
	images,
	news,
	skinsName,
	skill,
};
