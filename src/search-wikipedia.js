import sbd from "sbd";
import stringDistance from "wink-distance";

/**
 * Search Wikipedia for a query, return the first result's title,
 * summary, and image. Returns {error} if no results found.
 *
 * @param {string} query search phrase 
 * @param {object} options {
    plainText = false, // Return plain text instead of HTML
    summarySentenceLimit = 3, // Limit summary to this many sentences
    limitSearchResults = 1, // Limit number of search results
    images = true, // Include image in results
    imageSize = 200, // Image size in pixels
    searchInTitleOnly = false, // Search in title only
    rerankByTitleSimilarity = true, // Rerank results by query to 
      title Jaro-Winkler distance softmax
 * @returns {object} {results:[{title, summary, image}..]}
 */
export default async function searchWikipedia(query, options = {}) {
  // Set default options
  var {
    plainText = false,
    summarySentenceLimit = 3,
    limitSearchResults = 2,
    images = true,
    imageSize = 200,
    searchInTitleOnly = false,
    rerankByTitleSimilarity = true,
    filterDisambiguation = true,
  } = options;

  // Formet URL for Wikipedia search
  var url =
    "https://en.wikipedia.org/w/api.php?action=query&gsrlimit=" +
    limitSearchResults +
    "&origin=*&" +
    (plainText ? "explaintext=1&exsectionformat=plain" : "") +
    "&generator=search&exintro=&inprop=url&prop=" +
    (images ? "extracts|pageimages|info" : "extracts|info") +
    "&format=json&gsrsearch=" +
    (searchInTitleOnly ? "intitle:" : "") +
    query.replace(/ /g, "%20");

  // Fetch search results as JSON
  var info = await (await fetch(url)).json();

  // Return error if no results found
  if (!info || !info.query || !Object.keys(info?.query?.pages).length)
    return { error: "No results" };

  var resultsKeys = Object.keys(info.query.pages);
  var resultsObjects = [];

  for (var i = 0; i < resultsKeys.length; i++) {
    // Get first search result
    var pageObject = info.query.pages[resultsKeys[i]];

    // Create page data object with title
    var pageData = { title: pageObject.title };
    pageData.url = pageObject.fullurl;

    //preserve basic html but remove links and spans of wiki-classes
    var extract = plainText
      ? pageObject.extract?.replace(/[\n\r]/g, " ")
      : pageObject.extract
          ?.replace(/<(link|span|\/span)[^>]*>/g, " ")
          ?.replace(/( class=\"mw-empty-elt\")/g, "")
          .replace(/[\n\r]/g, " ")
          .replace(/<p>[ ]*<\/p>/g, "")


    // Use sentence boundary detection to limit summary to a few sentences
    pageData.summary =
      summarySentenceLimit > 0
        ? sbd.sentences(extract).slice(0, summarySentenceLimit).join(" ")
        : extract;

    // Check if page is a disambiguation page
    if (extract.includes(" may refer to: </p>")) 
      pageData.isDisambiguation = true;

    // Get image if requested in size specified
    if (images)
      pageData.image = pageObject.thumbnail
        ? pageObject.thumbnail.source.replace("/50px", "/" + imageSize + "px")
        : null;

    // push into results the page data object with title, summary, and image
    resultsObjects.push(pageData);
  }

  if (filterDisambiguation)
    resultsObjects = resultsObjects.filter(
      (i) => !i.isDisambiguation
    );

  //compare string distance of page titles to query, and sort by proximity
  if (rerankByTitleSimilarity) {
    resultsObjects = resultsObjects
      .map((element) => {
        element.similarity = stringDistance.string.jaroWinkler(
          query.toUpperCase(),
          element.title.toUpperCase()
        );
        return element;
      })
      .sort((a, b) => a.similarity - b.similarity);

    var similarityList = softmax(
      resultsObjects.map((i) => 10 - 10 * i.similarity)
    ).map((i) => Math.floor(i * 100));

    resultsObjects.map((i, index) => (i.similarity = similarityList[index]));
  }

  return { results: resultsObjects };
}

/**
 * Compute the softmax of an array of numbers.
 * https://en.wikipedia.org/wiki/Softmax_function
 *
 * Softmax is a generalization of the logistic sigmoid function used in
 * logistic regression. It is commonly used in machine learning models
 * for multi-class classification problems where there are more than two
 * possible output classes. The softmax function takes a vector of arbitrary
 * real-valued scores and squashes it to a vector of values between 0 and 1
 * that sum to 1. This allows the output to be interpreted as a probability
 * distribution over the possible classes.
 *
 * @param {array} arr The array of numbers to compute the softmax of.
 * @returns {array} The softmax array.
 */

export function softmax (array){
  return array.map(
    (val, index) =>
      Math.exp(array[index]) /
      array.map((y) => Math.exp(y)).reduce((a, b) => a + b)
  );
}
