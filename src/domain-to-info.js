import domains from "../data/domains-1m.js";
import exceptions from "./exceptions.js";
import searchWikipedia from "./search-wikipedia.js";
import convertDomainToFavicon from "./domain-to-favicon.js";
import fs from "fs";

/**
 * For each domain, Get favicon and domain info from wikipedia
 * @param {object} options { startIndex = 0, endIndex = 1000 }
 * 
 * @example domainInfo({startIndex: 0, endIndex: 1000})
 */
export default async function  domainInfo(options = {}) {
  var { startIndex = 0, endIndex = 1000 } = options;

  var domainRank = startIndex+1;
  var domainsArray = domains.split(",");

  //filter domains prepare
  var filterDomains = [];
  for (var exception of exceptions){

    if(exception.remove) 
      filterDomains.push(exception.main);

    if (exception.alt)
      for (var alternative of exception.alt) 
        filterDomains.push(alternative);
  }


  var writeStream = fs.createWriteStream("./data/domains-1k-wiki-info.js", {
    flags: startIndex == 0 ? "w" : "a",
  });

  if (!startIndex) writeStream.write("export default [\n");

  for (
    var domainIndex = startIndex;
    domainRank < endIndex;
    domainIndex++
  ) {
    var domain = domainsArray[domainIndex];
    // Skip if domain is in filter list
  if (filterDomains.includes(domain)) {
      console.log(`Skipping ${domain}`);
      continue;
    }


    var responseSearchWiki = await searchWikipedia(domain, {
        plainText: false,
        summarySentenceLimit: 3,
        limitSearchResults: 2,
        images: true,
        imageSize: 200,
        searchInTitleOnly: 0,
        rerankByTitleSimilarity: 1,
        filterDisambiguation: 1
    });

    if (responseSearchWiki.error) continue;

    var domainsWikiInfoError = "" //"pintrest.com,vimeo.com,ups.com";

    if (!domainsWikiInfoError.includes(domain))
      var wikiPageData = responseSearchWiki.results[0];
    // else
    //   wikiPageData = responseSearchWiki.results[1];

    delete wikiPageData.similarity;

    wikiPageData.rank = domainRank++;

    // Get favicon
    var domainsNoFaviconRequest = "ups.com,usnews.com,webflow.io";

    if (!domainsNoFaviconRequest.includes(domain))
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
  startIndex: 413,
  endIndex: 1000,
});
