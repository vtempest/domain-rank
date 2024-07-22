import domainInfo from "../data/domains-1k-wiki-info.js";


export async function getDomainInfo() {
    var domainInfoObj = {};

    for (let i = 0; i < domainInfo.length; i++) {
        var domain = domainInfo[i].title;
        var info = domainInfo[i];
        if (domainInfoObj[domain] && !domainInfoObj[domain]?.domain.includes("google")){
            console.log( domainInfo[i].domain, domainInfoObj[domain].domain);
            
            continue;
        
        }

        domainInfoObj[domain] = info;
    }


    return domainInfoObj;
}

var domainInfoObj=     await getDomainInfo();

// console.log(domainInfoObj);
