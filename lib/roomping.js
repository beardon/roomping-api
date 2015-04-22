'use strict';

var _ = require('lodash');
var fmt = require('util').format;
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

function Roomping(environment, options) {
    options = options || {};
    this.name = 'roomping';
    this.apiKey = options.apiKey || '';
    this.apiVersion = options.apiVersion || options.version || 1;
    this.debug = options.debug || false;
    this.environment = environment || 'development';
    this.host = options.host || '';
    this.protocol = options.protocol || 'https';
}

Roomping.prototype._buildApiUrl = function (endpoint) {
    if (endpoint.substring(0, 1) != '/') {
        endpoint = '/' + endpoint;
    }
    var host = this.host;
    if (!host) {
        switch (this.environment) {
            case 'production':
                host = 'api.roomping.com';
                break;
            case 'staging':
            case 'testing':
                host = 'api-test.roomping.com';
                break;
            case 'development':
            default:
                host = 'api-dev.roomping.com';
        }
    }
    return this.protocol + '://' + host + '/v' + this.apiVersion + endpoint;
};

Roomping.prototype.findUser = function (id) {
    var endpoint = '/users/' + id;
    return this._get(endpoint);
};

Roomping.prototype.findUsers = function (where) {
    var endpoint = '/users';
    return this._get(endpoint, where);
};

/**
 * Makes a DELETE request to the Roomping API.
 * @param {String} endpoint       API endpoint
 * @param {Object} [qs]           querystring
 * @returns {Promise}
 * @private
 */
Roomping.prototype._delete = function (endpoint, qs) {
    var options = {
        method: 'DELETE',
        url: this._buildApiUrl(endpoint),
        qs: qs || {}
    };
    return this._http(options);
};

/**
 * Makes a GET request to the Roomping API.
 * @param {String} endpoint       API endpoint
 * @param {Object} [qs]           querystring
 * @returns {Promise}
 * @private
 */
Roomping.prototype._get = function (endpoint, qs) {
    var options = {
        method: 'GET',
        url: this._buildApiUrl(endpoint),
        qs: qs || {}
    };
    return this._http(options);
};

/**
 * HTTP request to Roomping API.  Automatically adds API key and JSON-type headers.
 * @param {Object} options   request library options
 * @returns {Promise}
 * @private
 */
Roomping.prototype._http = function (options) {
    options = options || {};
    options.headers = {
        'Content-Type': 'application/json',
        'X-Roomping-API-Key': this.apiKey
    };
    options.json = true;
    return request(options)
        .spread(function (response, body) {
            if (!isResponseSuccessful(response)) {
                var err = new Error(fmt('%s - %s failed', response.statusCode, options.url));
                err.code = response.statusCode;
                err.meta = body;
                return Promise.reject(err);
            }
            return body;
        })
};

var isResponseSuccessful = function (response) {
    return ((response.statusCode >= 200) && (response.statusCode < 300));
};

/**
 * Makes a POST request to the Roomping API.
 * @param {String} endpoint       API endpoint
 * @param {Object} [qs]           querystring
 * @param {Object} [body]         body
 * @returns {Promise}
 * @private
 */
Roomping.prototype._post = function (endpoint, qs, body) {
    var options = {
        method: 'POST',
        url: this._buildApiUrl(endpoint),
        qs: qs || {},
        body: body
    };
    return this._http(options);
};

/**
 * Makes a PUT request to the Roomping API.
 * @param {String} endpoint       API endpoint
 * @param {Object} [qs]           querystring
 * @param {Object} [body]         body
 * @returns {Promise}
 * @private
 */
Roomping.prototype._put = function (endpoint, qs, body) {
    var options = {
        method: 'PUT',
        url: this._buildApiUrl(endpoint),
        qs: qs || {},
        body: body
    };
    return this._http(options);
};

module.exports = Roomping;
