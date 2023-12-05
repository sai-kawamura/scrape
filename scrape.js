const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeURL(pageURL) {
  try {
    const { data } = await axios.get(pageURL);
    const $ = cheerio.load(data);
    const urls = [];

    $("[id^=link_job_detail_pc_area_all_njobs_]").each((i, element) => {
      const relativeLink = $(element).find("a").attr("href");
      if (relativeLink) {
        const fullLink = baseURL + relativeLink;
        urls.push(fullLink);
      }
    });

    return urls;
  } catch (error) {
    console.error("スクレイピング中にエラーが発生しました:", error);
    return [];
  }
}

async function scrapeMultipleURLs(pageURLs) {
  const allUrls = [];
  for (const pageURL of pageURLs) {
    const urls = await scrapeURL(pageURL);
    allUrls.push(...urls);
  }

  // 以前のデータを読み込み、新しいデータを追加
  let existingUrls = [];
  if (fs.existsSync("scraped_urls.json")) {
    const json = fs.readFileSync("scraped_urls.json", "utf8");
    existingUrls = JSON.parse(json);
  }

  const updatedUrls = existingUrls.concat(allUrls);
  const json = JSON.stringify(updatedUrls, null, 2);
  fs.writeFileSync("scraped_urls.json", json);

  return updatedUrls;
}

const baseURL = "https://www.baitoru.com";
const pageURLs = [
    baseURL + "/area/tokyo/", 
    baseURL + "/area/osaka/",
    baseURL + "/area/kanagawa/",
    baseURL + "/area/chiba/",
    baseURL + "/area/saitama/",
]; // ここに複数のURLを追加

scrapeMultipleURLs(pageURLs).then((urls) => {
  console.log("URLs have been saved to scraped_urls.json");
});
