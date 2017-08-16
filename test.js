/**
 * Created by harel on 15/08/2017.
 */



var short_cm = require("./app");


// get all short domains by api key
short_cm.domainApi("API_KEY").then(function(res){
    console.log(res);
});

// init auth with short.cm (update api key and short domain)
short_cm.auth("API_KEY", "SHORT_URL_DOMAIN");

// shorten full url, can pass also title
short_cm.short("FULL_URL", "TITLE").then(function(res){
    console.log('res:');
    console.log(res);
});
//
// // expands short url (return id, short, full url, title, some other info)
short_cm.expand('SHORT_URL').then(function(res){
    console.log('expand:');
    console.log(res);
});
// // get analytics by short id number
short_cm.analytics('SHORT_ID').then(function(res){
    console.log('analytics:');
    console.log(res);
});
// get analytics by short url (using expand and analytics)
short_cm.analyticsByUrl('SHORT_URL').then(function(res){
    console.log('analytics:');
    console.log(res);
}).catch(function(){
    console.log('catch');
});
