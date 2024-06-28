export default "tilda.ws,googleapis.com,googletagmanager.com,ampproject.org,fb.watch,ibb.co,ggpht.com,unpkg.com,githubusercontent.com,.com,gstatic.com,polyfill.io,jsdelivr.net,g.page,wixstatic.com,staticflickr.com,googleadservices.com,googleusercontent.com,bootstrapcdn.com,amazonaws.com,googlesyndication.com,cloudfront.net,youtube-nocookie.com,example.com";

const exceptions = {
    "googleapis.com": {main: "google.com"},
    "googletagmanager.com": {main: "google.com"},
    "fb.watch": {main: "facebook.com"},
    "ibb.co": {main: "imgbb.com"},
    "ggpht.com": {main: "google.com"},
    "unpkg.com": {main: "npmjs.com"},
    "githubusercontent.com": {main: "github.com"},
    "gstatic.com": {main: "google.com"},
    "polyfill.io": {removedTool: true},

}
