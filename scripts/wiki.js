import domains from "../data/domains-1m.js";
import fs from "fs";
import sbd from "sbd";
import scrapFavicon from "scrap-favicon";
import filterDomains from "./filter.js";
const getFavicons = require('node-get-favicons');

async function domainInfo() {

  var writeStream = fs.createWriteStream("./data/domains-1k-wiki-info.js", {
    flags: "w",
  });

  writeStream.write("export default [\n");

  for (var domain of domains.slice(0, 1000)) {

    // Skip if domain is in filter list
    if (filterDomains.includes(domain)) {
      console.log(`Skipping ${domain}`);
      continue;
    }
    var wikiPageData = await searchWikipedia(domain);

    //favicon
    try {
      if (domain!="adobe.com") 
      var favicon = await 
      getFavicons.byUrl("https://" + domain);

      wikiPageData.favicon = favicon[0]?.href;
    } catch (e) {}

    wikiPageData.domain = domain;
    console.log(domain);

    writeStream.write(` ${JSON.stringify(wikiPageData, null, 2)},\n`, {
      encoding: "utf8",
    });
  }
}

await domainInfo();

async function getFavicon(domain) {
  // Setting timeout(ms) and number of redirects for website url
  var favicon = await scrapFavicon(domain, {
    timeout: 10000,
    urlsOnly: true,
    maxRedirect: 2,
  });

  return favicon;
}

/**
 * Search Wikipedia for a query, return the first result's title,
 * summary, and image. Returns {error} if no results found.
 *
 * @param {string} query
 * @param {object} options defaults options:
 *    { plainText = false, summarySentenceLimit = 3,
 *    limitSearchResults = 1, images = false, imageSize = 200,}
 * @returns {object} {title, summary, image}
 */
export async function searchWikipedia(query, options = {}) {
  var {
    plainText = true,
    summarySentenceLimit = 3,
    limitSearchResults = 1,
    images = true,
    imageSize = 200,
  } = options;

  var url =
    "https://en.wikipedia.org/w/api.php?action=query&gsrlimit=" +
    limitSearchResults +
    "&origin=*&" +
    (plainText ? "explaintext=1&exsectionformat=plain" : "") +
    "&generator=search&exintro=&prop=" +
    (images ? "extracts|pageimages" : "extracts") +
    "&format=json&gsrsearch=" +
    query.replace(/ /g, "%20");

  var info = await (await fetch(url)).json();

  if (!info || !info.query || !Object.keys(info?.query?.pages).length)
    return { error: "No results found." };

  info = info.query.pages[Object.keys(info.query.pages)[0]];

  var pageData = { title: info.title };

  var extract = plainText
    ? info.extract?.replace(/[\n\r]/g, " ")
    : info.extract
        ?.replace(/<(link|span|\/span)[^>]*>/g, " ")
        .replace(/[\n\r]/g, " ");

  pageData.summary =
    summarySentenceLimit > 0
      ? sbd.sentences(extract).slice(0, summarySentenceLimit).join(" ")
      : extract;

  if (images)
    pageData.image = info.thumbnail
      ? info.thumbnail.source.replace("/50px", "/" + imageSize + "px")
      : null;

  return pageData;
}
