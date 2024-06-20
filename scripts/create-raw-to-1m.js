const fs = require("fs");
const readline = require("readline");
import { error } from "console";

// https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2024-feb-apr-may/index.html

function getDomains() {
  const rl = readline.createInterface({
    input: fs.createReadStream("./cc-main-2024-feb-apr-may-domain-ranks.txt"),
    output: process.stdout,
    terminal: false,
  });

  var writeStream = fs.createWriteStream("domains10M.txt", { flags: "w" });

  var lineNum = 0,
    limitMax = 10000000;

setInterval(() => {
    console.log("Line: " + lineNum);
}, 5000);

  rl.on("line", (line) => {
    var dom = line.split("\t")[4];
    var hostsPointingTo = line.split("\t")[5];

    dom = dom.split(".").reverse().join(".");
    writeStream.write( dom );
    // writeStream.write('"' + dom + '",\n');
    if (lineNum++ > limitMax) {
      rl.close();
      writeStream.end();
      zip()
    }
  });
}

// getDomains()


import dns from "dns";
import domains from "./domains-trie.js";


async function domainToIP(){

  var domainsWithIP ={}

  for (let i = 0; i < 10000; i++) {
    try{
    var address = await dns.promises.resolve(domains[i], { ttl: true });
    
    } catch (error) {
      
      
      address = null
    }
    try{
    if (!address) {
            address = await dns.promises.resolve("www."+domains[i], { ttl: true });
            if (address) console.log("www."+domains[i] + " found")
            }
  } catch (error) {
    console.log(domains[i]+ " not found")
  }
  address = address ? address[0].address: null;

    domainsWithIP[domains[i]] = address;
  }

  console.log(domainsWithIP)

  fs.writeFileSync(
    "domainsWithIP.js",
    "export default " + JSON.stringify(domainsWithIP)
  );

}




async function makeDictionaryPrefixTree(){

  var tree ={}

  for (let i = 0; i < 10000; i++) {
    var domain = domains[i]
    var prefix = domain[0]+domain[1];
    if(!tree[prefix]) 
      tree[prefix] = []
    tree[prefix].push(domain)



  }

  console.log(tree)

  fs.writeFileSync(
    "makeDictionaryPrefixTree.js",
    "export default " + JSON.stringify(tree)
  );

}

// import dict from "./makeDictionaryPrefixTree.js";

// var dictObj = {}
// var keys = Object.keys(dict).sort().map(key=>[key,dict[key]?.length]).filter(key=>key[1]>100)
// console.log(keys)

const base64Img = require('node-base64-img');

async function getFavicons(){
  
  var domainToFavicon = {}
  for (var domain of domains.slice(100,400)){

    var url = "https://"+domain+"/favicon.ico";



	try {
    var res = await fetch(url);
    var type = res.headers.get('Content-Type');
    if (!type?.startsWith("text")){
      var base64Favicon = await base64Img.toBase64(url);
      if(base64Favicon)	
        domainToFavicon[domain] = (base64Favicon)
    }
    
    console.log(domain)
  
    

	} catch (error) {
		console.log(error);
		//=> 'Internal server error ...'
	}


  }

  
  fs.writeFileSync(
    "domainToFavicon2.js",
    "export default " + JSON.stringify(domainToFavicon)
  );


}

await getFavicons();

import  favicons from "./domainToFavicon2.js";

function displayFavicons(){
  var prefix= "data:image/x-icon;base64,"

  var html = "";
  for (var domain of Object.keys(favicons)){
    html+=`<img width="16px"  height="16px" src="${prefix}${favicons[domain]}" > ${domain} <br>`;
  }
  fs.writeFileSync("favicons.html", html);
}
// displayFavicons()