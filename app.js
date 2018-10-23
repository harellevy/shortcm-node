const request = require("request");
const RateLimiter = require('request-rate-limiter');
const limiter = new RateLimiter(120); //120 requests per minute

let api_key, short_domain;
const cm_short = {
    auth: function (apiKey, shortDomain) {
        api_key = apiKey;
        short_domain = shortDomain || "smart.short.cm";
    },
    domainApi: function (apiKey) {
        const options = {
            method: 'GET',
            url: 'https://api.short.cm/api/domains',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            }
        };
        return makeLimitedRequest(options);
    },
    shorten: function (url) {
        const options = {
            method: 'POST',
            url: 'https://api.short.cm/links',
            form: {
                domain: short_domain,
                originalURL: url
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': api_key
            }
        };
        return makeLimitedRequest(options);
    },
    getPathFromUrl: function (url) {
        return url.replace(short_domain, '').replace(/(http:\/\/|https:\/\/|\/)/g, '')
    },
    deleteByUrl: function (url) {
        return new Promise(function (resolve, reject) {
            cm_short.expand(url).then(function (link) {
                cm_short.delete(link.id).then(function () {
                    resolve(url + 'deleted');
                }).catch(function (err) {
                    console.log('delete error');
                    reject(err);
                });

            }).catch(function (err) {
                console.log('expand error');
                reject(err);
            });
        });
    },
    delete: function (link_id) {
        return new Promise(function (resolve, reject) {
            const options = {
                method: 'DELETE',
                url: 'https://api.short.cm/links/' + link_id,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_key
                }
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = checkIfJsonStringAndParse(body);
                    info.error ? reject(info) : resolve(info);
                    ;
                } else {
                    console.log('Status:', response.statusCode);
                    console.log('Headers:', JSON.stringify(response.headers));
                    console.log('Response:', body);
                    console.error(error);
                    reject({
                        msg: "error in shorten delete method api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },

    expand: function (url) {
        const options = {
            method: 'GET',
            url: 'https://api.short.cm/links/expand?domain=' + encodeURI(short_domain) + '&path=' + encodeURI(cm_short.getPathFromUrl(url)),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': api_key
            }
        };
        return makeLimitedRequest(options);
    },

    expandByLongUrl: function (url) {
        const options = {
            method: 'GET',
            url: 'https://api.short.cm/links/by-original-url?domain=' + encodeURI(short_domain) + '&originalURL=' + encodeURIComponent(url),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': api_key
            }
        };
        return makeLimitedRequest(options);
    },
    analyticsById: function (link_id) {
        const options = {
            method: 'GET',
            url: 'https://api.short.cm/links/statistics/' + link_id + '?period=total',
            // url: 'https://api.short.cm/links/' + link_id + '/statistics',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': api_key
            }
        };
        return makeLimitedRequest(options);
    },
    updateShortUrlByLinkId: function (link_id, newLongUrl) {
        const options = {
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
        return makeLimitedRequest(options);
    },

    updateLocaleById: function (link_id, country, url) {
        const options = {
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
        return makeLimitedRequest(options);
    },

    updateShortUrl: function (shortUrl, newLongUrl) {
        return new Promise(function (resolve, reject) {
            cm_short.expand(shortUrl).then(function (expand_res) {
                cm_short.updateShortUrlByLinkId(expand_res.id, newLongUrl).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            }).catch(function (err) {
                console.log('not a success');
                reject(err);
            });
        });
    },
    updateLocalForLink: function (short_url, country, url) {
        return new Promise(function (resolve, reject) {
            cm_short.expand(short_url).then(function (expand_res) {
                cm_short.updateLocaleById(expand_res.id, country, url).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            })
        });
    },
    analytics: function (url) {
        return new Promise(function (resolve, reject) {
            cm_short.expand(url).then(function (res) {
                cm_short.analyticsById(res.id).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            }).catch(function (err) {
                console.log('not a success');
                reject(err);
            });
        });
    }
};

//helper to test if json can be parsed

function checkIfJsonStringAndParse(str) {
    let x;
    try {
        x = JSON.parse(str);
    } catch (e) {
        return {
            msg: "error in updateLocale api request",
            error: "couldn't parse :::\n" + str,
        };
    }
    return x;
}

function makeLimitedRequest(options) {
    return new Promise(function (resolve, reject) {
        limiter.request()
            .then(function (backoff) {
                request(options, function (error, response, body) {
                    if (response.statusCode === 429) {
                        // we have to back off. this callback will be called again as soon as the remote enpoint
                        // should accept requests again. no need to queue your callback another time on the limiter.
                        backoff();
                    } else if (!error && response.statusCode == 200) {
                        const info = checkIfJsonStringAndParse(body);
                        info.error ? reject(info) : resolve(info);
                    } else {
                        reject({
                            msg: "error in domain api request",
                            error: error,
                            response: response
                        });
                    }
                })
            }).catch((limiterError) => reject({msg: "limiter error", error: limiterError}));
    });
}

const SHORTCM_API_KEY = "NSVRGcIHcVrasPSd";
cm_short.auth(SHORTCM_API_KEY, "sllc.co");
cm_short.expand('https://sllc.co/wsgRaN')
    .then(x => console.log(x))

//
// module.exports = cm_short;





