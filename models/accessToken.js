var mongoose = require('mongoose');
var https = require('https');
var util = require('../util');
var sha1 = require('sha1');
var config = require('../config');
var Schema = mongoose.Schema;
var debug = require('debug')('accessToken');
var querystring = require('querystring');
var request = require('request');

var accessTokenSchema = new Schema({
    token: String,
    record_time: Date,
    expires: Number
});

var AccessToken = mongoose.model('accessToken', accessTokenSchema);

module.exports.model = AccessToken;

/**
 * get token from api
 */

module.exports.fetch = () => {
  var url = config.wechat + "?" + querystring.stringify({
      grant_type: config.grantType,
      appid: config.appID,
      secret: config.appSecret
  });

  request(url, (err, res) => {
    if (!err) {
      try {
          const accessTokenData = JSON.parse(res.body);
          client.set('token', accessTokenData['access_token'], 'EX', 7200);
      } catch (e) {
          console.error('parse error: ' + e);
      }
    }
  });
}

/**
 * access to the wechat server
 */

module.exports.validate = function (req)
{
    var request = req.query;    //not req.params here!!
    var token = config.appToken;
    var params = [];

    if (util.isset(request.timestamp) && util.isset(request.nonce)) {
      var dataToBeEncrypted = [token, request.timestamp, request.nonce];
      params = dataToBeEncrypted.sort();
    }

    var ecryptedContent = sha1(params.join(""));

    if (util.isset(request.signature) && ecryptedContent == request.signature) {
        return request.echostr;
    } else {
        return "error";
    }
}

