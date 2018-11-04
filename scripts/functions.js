const req = require('sync-request');
const qs = require('query-string');

module.exports.VKReq = function(token,method,params = {})
{
    var url = "https://api.vk.com/method/" +  method+ "?&access_token=" + token + "&v=5.87"
    var bodypar = qs.stringify(params);

    var resp = req("POST",url,
    {
        "headers":{"Content-type":"application/x-www-form-urlencoded"},
		"body":bodypar
    });

    return JSON.parse(resp.getBody('utf8'));
};