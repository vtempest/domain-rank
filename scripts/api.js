// import { getDomainRank } from "./domain-rank.js";
import domains from "../data/domains-1m.js";

// https://en.wikipedia.org/wiki/Common_Crawl
const server = Bun.serve({
  async fetch(req) {
    const { pathname, searchParams } = new URL(req.url);

    if (pathname === "/") {
      var limit = searchParams.get("limit");
      var startFrom = searchParams.get("startFrom");

      var domainsOutput = domains.slice(startFrom, limit);
      
      return Response.json(domainsOutput);
    } 

    if (pathname === "/rank") {
      var domain = searchParams.get("domain");

      var domainInfo = domains[domain];
      
      return Response.json(domainInfo);
    } 

  },
});

console.log(`Listening on ${server.url}`);
