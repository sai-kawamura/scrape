const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let content = "";

    $("dl").each((i, element) => {
      if ($(element).text().includes("仕事内容")) {
        // 次のddタグのテキストを取得
        content = $(element).find("dd").text().trim();
        return false; // ループを抜ける
      }
    });

    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function main() {
  try {
    // scraped_urls.jsonからURLを読み込み
    const urls = JSON.parse(fs.readFileSync("scraped_urls.json", "utf8"));
    const results = [];

    for (const url of urls) {
      const content = await scrapeContent(url);
      if (content) {
        results.push({ url, content });
      }
    }

    // 結果をresult.jsonに保存
    fs.writeFileSync("result.json", JSON.stringify(results, null, 2));
    console.log("Results have been saved to result.json");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
