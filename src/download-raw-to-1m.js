const fs = require("fs");
const readline = require("readline");

/**
 * Get 100M domains from CommonCrawl
 * https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2024-feb-apr-may/index.html
 * 
 * wget https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2024-feb-apr-may/domain/cc-main-2024-feb-apr-may-domain-ranks.txt.gz
 * gunzip cc-main-2024-feb-apr-may-domain-ranks.txt.gz

 */
function getDomains() {
  const rl = readline.createInterface({
    input: fs.createReadStream("./cc-main-2024-feb-apr-may-domain-ranks.txt"),
    output: process.stdout,
    terminal: false,
  });

  var writeStream = fs.createWriteStream("./data/domains-1m.js", { flags: "w" });

  var lineNum = 0,
    limitMax = 1000000;

  var ticker = setInterval(() => {
    console.log("Line: " + lineNum);
    if (lineNum++ > limitMax) {
      clearInterval(ticker);
      writeStream.end();
      rl.close();
      
      return;
    }
  }, 1000);

  writeStream.write("export default \"\n");

  rl.on("line", (line) => {
    var dom = line.split("\t")[4];

    if (dom == "#host_rev") return;

    var hostsPointingTo = line.split("\t")[5];

    dom = dom.split(".").reverse().join(".");
    // writeStream.write('"' + dom + '",');
    writeStream.write( dom + ',');
    if (lineNum++ > limitMax) {
      writeStream.write(";\n");

      clearInterval(ticker);
      writeStream.end();
      rl.close();
      return;
    }
  });


}

getDomains();
