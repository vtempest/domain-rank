import {test, expect} from 'vitest';
import searchWikipedia from '../src/search-wikipedia.js';

test('search wiki', async () => {

    var result = await searchWikipedia("subway", {
        plainText: false,
        summarySentenceLimit: 3,
        limitSearchResults: 3,
        images: true,
        imageSize: 200,
        searchInTitleOnly: 1,
        rerankByTitleSimilarity: 1,
        filterDisambiguation: 1
      });
    console.log(result);

    expect(result.results[0].title).toBe('Subway (restaurant)');

})


test('search wiki', async () => {

    var result = await searchWikipedia("taylor", {
        plainText: false,
        summarySentenceLimit: 3,
        limitSearchResults: 3,
        images: true,
        imageSize: 200,
        searchInTitleOnly: 1,
        rerankByTitleSimilarity: 0,
        filterDisambiguation: 1
      });
    console.log(result);

    expect(result.results[0].title).toBe('Taylor series');

})
