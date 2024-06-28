import domains from "../data/domains-1m.js";
import filterDomains from "./filter.js";
import searchWikipedia from "./search-wikipedia.js";
import convertDomainToFavicon from "./domain-to-favicon.js";
import fs from "fs";

/**
 * Get domain info from wikipedia
 * @param {object} options { startIndex = 0, endLimit = 1000 }
 */
export default async function 
domainInfo(options = {}) {
  var { startIndex = 0, endLimit = 1000 } = options;

  var domainRank = startIndex+1;
  var domainsArray = domains.split(",");

  var writeStream = fs.createWriteStream("./data/domains-2k-wiki-info.js", {
    flags: startIndex == 0 ? "w" : "w",
  });

  if (!startIndex) writeStream.write("export default [\n");

  for (
    var domainIndex = startIndex;
    domainIndex < Math.min(endLimit, domainsArray.length);
    domainIndex++
  ) {
    var domain = domainsArray[domainIndex];
    // Skip if domain is in filter list
    if (filterDomains.includes(domain)) {
      console.log(`Skipping ${domain}`);
      continue;
    }
    var responseSearchWiki = await searchWikipedia(domain);

    if (responseSearchWiki.error) continue;

    var wikiPageData = responseSearchWiki.results[0];

    delete wikiPageData.similarity;

    wikiPageData.rank = domainRank++;

    // Get favicon
    wikiPageData.favicon = await convertDomainToFavicon(domain);

    wikiPageData.domain = domain;
    console.log(domain);

    // Write to file
    writeStream.write(` ${JSON.stringify(wikiPageData, null, 2)},\n`, {
      encoding: "utf8",
    });
  }
}

await domainInfo({
  startIndex: 1000,
  endLimit: 2000,
});
