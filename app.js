/**
 * Created by harel on 15/08/2017.
 */
const request = require("request");

var api_key, short_domain;

const cm_short = {
    auth: function(apiKey, shortDomain){
        api_key = apiKey;
        short_domain = shortDomain || "shrt.co";
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
    short: function(url, title){
        var options = {
            method: 'POST',
            url: 'https://api.short.cm/links',
            form: {
                domain: short_domain,
                originalURL: url,
                title: title || "title_placeholder"
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
    analytics: function(link_id){
        return new Promise(function(resolve,reject){
            var options = {
                method: 'GET',
                url: 'https://api.short.cm/links/' + link_id + '/statistics',
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
    analyticsByUrl: function(url){
        return new Promise(function(resolve,reject){
            cm_short.expand(url).then(function(res){
                cm_short.analytics(res.id).then(function(res){
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






