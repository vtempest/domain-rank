import dns from "dns";
import domains from "./data/domains-1m.js";

export async function domainToIP() {
  var domainsWithIP = {};
  domains = domains.split(",");

  for (let i = 0; i < 10000; i++) {
    try {
      var address = await dns.promises.resolve(domains[i], { ttl: true });
    } catch (error) {
      address = null;
    }
    try {
      if (!address) {
        address = await dns.promises.resolve("www." + domains[i], {
          ttl: true,
        });
        if (address) console.log("www." + domains[i] + " found");
      }
    } catch (error) {
      console.log(domains[i] + " not found");
    }
    address = address ? address[0].address : null;

    domainsWithIP[domains[i]] = address;
  }

  console.log(domainsWithIP);

  fs.writeFileSync(
    "data/domains-IP.js",
    "export default " + JSON.stringify(domainsWithIP)
  );
}
