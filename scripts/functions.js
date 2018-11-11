const req = require('sync-request');
const qs = require('query-string');

const token = require('./../configs/token.json').token;

const conf = require('./../configs/main.json');





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

module.exports.VKReqGET = function(token,method,params = {})
{
    var url = "https://api.vk.com/method/" +  method+ "?&access_token=" + token + "&v=5.87&"
    var params = qs.stringify(params);

    var resp = req("GET",url + params);

    return JSON.parse(resp.getBody('utf8'));
};


module.exports.Currency_tail = function(num)
{
    var tail = num % 100;

    if(tail > 10 && tail < 20)
    {
        return conf.Economics.Currency.Cases.Plural.Genitive;
    } else 
    {
        tail = tail % 10;
        switch(tail)
        {
            case 1:
                return conf.Economics.Currency.Cases.Singular.Accusative
            case 2:
            case 3:
            case 4:
                return conf.Economics.Currency.Cases.Singular.Genitive
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                return conf.Economics.Currency.Cases.Plural.Genitive
        }
    }
}

module.exports.cascade_table = function(rang)
{
    switch(rang)
    {
        case "User":
        return 1;
        case "Vip":
        return 2;
    }
}
