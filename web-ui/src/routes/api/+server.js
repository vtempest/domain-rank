import { json } from '@sveltejs/kit';
import domains from "../../../../data/domains-1k-wiki-info.js";

export async function GET({ url }) {
    // Get the 'limit' query parameter, default to 10 if not provided
    // const limit = Number(url.searchParams.get('limit') ?? '10');


    // Return only the number of users specified by the limit
    const limitedUsers = domains //.slice(0, limit);

    // Return the data as JSON
    return json(limitedUsers);
}
