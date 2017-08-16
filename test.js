/**
 * Created by harel on 15/08/2017.
 */



var short_cm = require("./app");

// short_cm.domainApi("API_KEY").then(function(res){
//     console.log(res);
// });
short_cm.auth("API_KEY", "SHORT_DOMAIN");
// short_cm.short("FULL_URL", "TITLE").then(function(res){
//     console.log('res:');
//     console.log(res);
// });
// short_cm.expand('SHORT_URL').then(function(res){
//     console.log('expand:');
//     console.log(res);
// });
//
// short_cm.analytics(SHORT_ID').then(function(res){
//     console.log('analytics:');
//     console.log(res);
// });
// short_cm.analyticsByUrl(SHORT_URL).then(function(res){
//     console.log('analytics:');
//     console.log(res);
// });
