/**
 * Created by harel on 15/08/2017.
 */
const request = require("request");

var api_key, short_domain;

const cm_short = {
    auth: function(apiKey, shortDomain){
        api_key = apiKey;
        short_domain = shortDomain || "smart.short.cm";
    },
    domainApi: function(apiKey){
        var options = {
            method: 'GET',
            url: 'https://api.short.cm/api/domains',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            }
        };
        return new Promise(function(resolve,reject){
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in domain api request");
                }
            })
        });
    },
    shorten: function(url){
        var options = {
            method: 'POST',
            url: 'https://api.short.cm/links',
            form: {
                domain: short_domain,
                originalURL: url
                // title: title || "title_placeholder"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': api_key
            }
        };
        return new Promise(function(resolve,reject){
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in domain api request");
                }
            })
        });
    },
    getPathFromUrl: function(url){
        return url.replace(short_domain, '').replace(/(http:\/\/|https:\/\/|\/)/g, '')
    },
    deleteByUrl: function(url){
        return new Promise(function(resolve,reject){
            cm_short.expand(url).then(function(link){
                cm_short.delete(link.id).then(function(){
                    resolve(url + 'deleted');
                }).catch(function(err){
                    console.log('delete error');
                    reject(err);
                });

            }).catch(function(err){
                console.log('expand error');
                reject(err);
            });
        });
    },
    delete: function(link_id){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'DELETE',
                url: 'https://api.short.cm/links/' + link_id,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    console.log('Status:', response.statusCode);
                    console.log('Headers:', JSON.stringify(response.headers));
                    console.log('Response:', body);
                    console.error(error);
                    reject("error in domain api request");
                }
            })
        });
    },

    expand: function(url){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'GET',
                url: 'https://api.short.cm/links/expand?domain=' + encodeURI(short_domain) + '&path=' + encodeURI(cm_short.getPathFromUrl(url)),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in domain api request");
                }
            })
        });
    },
    analyticsById: function(link_id){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'GET',
                url: 'https://api.short.cm/links/statistics/' + link_id + '?period=total',
                // url: 'https://api.short.cm/links/' + link_id + '/statistics',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in domain api request");
                }
            })
        });
    },
    updateShortUrlByLinkId: function(link_id, newLongUrl){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'POST',
                url: 'https://api.short.cm/links/' + link_id,
                form: {
                    originalURL: newLongUrl,
                    // title: title || "title_placeholder"
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in domain api request");
                }
            })
        });
    },
    updateLocaleById: function(link_id, country, url){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'POST',
                url: 'https://api.short.cm/link_country/' + link_id,
                form: {
                    originalURL: url,
                    country: country
                    // title: title || "title_placeholder"
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    resolve(info);
                }else{
                    reject("error in update locale by id");
                }
            })
        });
    },
    updateShortUrl: function(shortUrl, newLongUrl){
        return new Promise(function(resolve,reject){
            cm_short.expand(shortUrl).then(function(expand_res){
                cm_short.updateShortUrlByLinkId(expand_res.id, newLongUrl).then(function(res){
                    resolve(res);
                }).catch(function(err){
                    reject(err);
                });
            }).catch(function(){
                console.log('not a success');
                reject('url is not valid, or expand didn\'nt worked');
            });
        });
    },
    updateLocalForLink: function(short_url, country, url){
        return new Promise(function(resolve,reject){
            cm_short.expand(short_url).then(function(expand_res){
                cm_short.updateLocaleById(expand_res.id, country, url).then(function(res){
                    resolve(res);
                }).catch(function(err){
                    reject(err);
                });
            })
        });
    },
    analytics: function(url){
        return new Promise(function(resolve,reject){
            cm_short.expand(url).then(function(res){
                cm_short.analyticsById(res.id).then(function(res){
                    resolve(res);
                }).catch(function(err){
                    reject(err);
                });
            }).catch(function(){
                console.log('not a success');
                reject('url is not valid, or expand didn\'nt worked');
            });
        });
    }
};
module.exports = cm_short;






