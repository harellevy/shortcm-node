/**
 * Created by harel on 15/08/2017.
 */
const request = require("request");
const URL = require('url');

let apiKey, shortDomain;

const shortCm = {
    auth: (key, domain) => {
        apiKey = key;
        shortDomain = domain || "smart.short.cm";
    },
    domainApi: (apiKey) => {
        const options = {
            method: 'GET',
            url: 'https://api.short.cm/api/domains',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in domain api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    shorten: (url) => {
        const options = {
            method: 'POST',
            url: 'https://api.short.cm/links',
            body: {
                domain: shortDomain,
                originalURL: url
            },
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in shorten api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    deleteByUrl: (url) => {
        return new Promise((resolve, reject) => {
            shortCm.expand(url)
                .then((link) => {
                    shortCm.delete(link.id)
                        .then(() => resolve(url + 'deleted'))
                        .catch((err) => {
                            console.error('delete error');
                            reject(err);
                        });

                })
                .catch((err) => {
                    console.error('expand error');
                    reject(err);
                });
        });
    },
    delete: (linkId) => {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'DELETE',
                url: 'https://api.short.cm/links/' + linkId,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                }
            };
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
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

    expand: (url) => {
        return new Promise((resolve, reject) => {
            const myURL = URL.parse(url);
            const pathname = encodeURI(stripLeadingSlash(stripTrailingSlash(myURL.pathname)));
            const short = encodeURI(shortDomain);

            const options = {
                method: 'GET',
                url: `https://api.short.cm/links/expand?domain=${short}&path=${pathname}`,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                }
            };
            console.log(options);
            request(options, (error, response, body) => {
                console.log('error? ', error);
                console.log('response?', response);
                console.log('body?', body);

                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in expand api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    expandByLongUrl: (url) => {
        return new Promise((resolve, reject) => {
            const short = encodeURI(shortDomain);
            const originalUrl = encodeURIComponent(url);

            const options = {
                method: 'GET',
                url: `https://api.short.cm/links/by-original-url?domain=${short}&originalURL=${originalUrl}`,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                }
            };
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in expand api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    analyticsById: (linkId) => {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                url: `https://api.short.cm/links/statistics/${linkId}?period=total`,
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                }
            };
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in analytics shorten api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    updateShortUrlByLinkId: (linkId, newLongUrl) => {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                url: `https://api.short.cm/links/${linkId}`,
                body: {
                    originalURL: newLongUrl,
                },
                json: true,
                headers: {
                    'Authorization': apiKey
                }
            };
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in update shorten api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    updateLocaleById: (linkId, country, url) => {
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                url: `https://api.short.cm/link_country/${linkId}`,
                form: {
                    originalURL: url,
                    country: country
                },
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                }
            };
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({
                        msg: "error in updateLocale api request",
                        error: error,
                        response: response
                    });
                }
            })
        });
    },
    updateShortUrl: (shortUrl, newLongUrl) => {
        return new Promise((resolve, reject) => {
            shortCm.expand(shortUrl)
                .then((expand_res) => {
                    shortCm.updateShortUrlByLinkId(expand_res.id, newLongUrl)
                        .then((res) => resolve(res))
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    console.log('not a success');
                    reject(err);
                });
        });
    },
    updateLocalForLink: (shortUrl, country) => {
        return new Promise((resolve, reject) => {
            shortCm.expand(shortUrl)
                .then((expandRes) => {
                    shortCm.updateLocaleById(expandRes.id, country, expandRes.originalURL)
                        .then((res) => resolve(res))
                        .catch((err) => reject(err));
                })
        });
    },
    analytics: (url) => {
        return new Promise((resolve, reject) => {
            shortCm.expand(url)
                .then((res) => {
                    shortCm.analyticsById(res.id)
                        .then((res) => resolve(res))
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    console.log('not a success');
                    reject(err);
                });
        });
    }
};

function stripTrailingSlash(str) {
    return str.endsWith('/') ?
        str.slice(0, -1) :
        str;
};

function stripLeadingSlash(str) {
    return str.startsWith('/') ?
        str.slice(1, str.length) :
        str;
};

module.exports = shortCm;
