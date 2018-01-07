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

// // shorten full url, can pass also title
short_cm.shorten("FULL_URL", "TITLE").then(function(res){
    console.log('res:');
    console.log(res);
});
// //
// // // update short url with new url (return id, short, full url, title, some other info)
short_cm.updateShortUrl('SHORT_URL', 'NEW_FULL_URL').then(function(res){
    console.log('expand:');
    console.log(res);
}).catch(function(err){
    console.log(err);
});
// //
// // update local for link
short_cm.updateLocalForLink('SHORT_URL', 'COUNTRY_CODE', 'FULL_URL').then(function(res){
    console.log(res);
});
//
//
// // // get analytics by short id number
short_cm.analyticsById('SHORT_ID').then(function(res){
    console.log('analytics:');
    console.log(res);
});
// // get analytics by short url (using expand and analytics)
short_cm.analytics('SHORT_URL').then(function(res){
    console.log('analytics:');
    console.log(res);
}).catch(function(){
    console.log('catch');
});
//
// delete by url
short_cm.deleteByUrl("SHORT_URL").then(function(res){
    console.log('result:');
    console.log(res);
}).catch(function(err){
    console.err(err);
});
//
//
//
// get short by long url
short_cm.expandByLongUrl("LONG_URL").then(function(res){
    console.log('result:');
    console.log(res);
}).catch(function(err){
    console.err(err);
});