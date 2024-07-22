import scrapFavicon from "scrap-favicon";

const getFavicons = require("node-get-favicons");
const axios = require("axios");

/**
 * Gets favicon for any domain
 * @param {string} domain
 * @param {object} options 
 * @returns {string} faviconData as base64 or URL to favicon
 */
export default async function convertDomainToFavicon(domain, options = {}) {
  var { timeout = 5000 } = options;


  try {
    var faviconURL = `https://${domain}/favicon.ico`;

    var response = await axios({
      url: faviconURL,
      timeout,
    }).catch((e) => { });

    if (!response || response?.status != 200) {
      faviconURL = `https://www.${domain}/favicon.ico`;

      response = await axios({
        url: faviconURL,
        timeout,
      }).catch((e) => { });
    }

    if (!response || response?.status != 200) 
      faviconURL = (await getFavicons.byUrl("https://www." + domain, {timeout}))[0]?.href

    return faviconURL;
    
  } catch (e) {
    console.log(e.message)
    console.log(`Error fetching favicon for ${domain}`);
    // console.log(e)
    return null;
  }
}
