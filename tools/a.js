const axios = require("axios");

async function search() {
	try {
		const { data } = await axios.get(
			`https://otruyenapi.com/v1/api/tim-kiem?keyword=slime`
		);

		console.log(data.data);
	} catch (error) {
		console.error("Error fetching the URL:", error.message);
	}
}

search();
