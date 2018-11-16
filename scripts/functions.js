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

module.exports.now = function()
{
    return Math.floor(Date.now() / 1000);
};

module.exports.random = function (min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};






module.exports.timeparse = function(sec)
{

    var tail;
    var robj = new Object;

    robj.d = new Object;
    robj.h = new Object;
    robj.m = new Object;
    robj.s = new Object;

    
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec - d * 86400) / 3600);
    var m = Math.floor((sec - d * 86400 - h * 3600) / 60);
    var s = sec - d * 86400 - h * 3600  - m * 60;

    robj.d.value = d; 
    robj.h.value = h; 
    robj.m.value = m; 
    robj.s.value = s; 
    
    var dt = d % 100;
    if(dt > 10 && dt < 20)
    {
        robj.d.string = "дней";
    } else 
    {
        tail = dt % 10;
        switch(tail)
        {
            case 1:
                robj.d.string = "день";
            break;
            case 2:
            case 3:
            case 4:
                robj.d.string = "дня";
            break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                robj.d.string = "дней";
            break;
        }
    }


    var ht = h % 100;
    if(ht > 10 && ht < 20)
    {
        robj.h.string = "часов";
    } else 
    {
        tail = ht % 10;
        switch(tail)
        {
            case 1:
                robj.h.string = "час";
            break;
            case 2:
            case 3:
            case 4:
                robj.h.string = "часа";
            break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                robj.h.string = "часов";
            break;
        }
    }


    var mt = m % 100;
    if(mt > 10 && mt < 20)
    {
        robj.m.string = "минут";
    } else 
    {
        tail = mt % 10;
        switch(tail)
        {
            case 1:
                robj.m.string = "минута";
            break;
            case 2:
            case 3:
            case 4:
                robj.m.string = "минуты";
            break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                robj.m.string = "минут";
            break;
        }
    }


    var st = s % 100;
    if(st > 10 && st < 20)
    {
        robj.s.string = "секунд";
    } else 
    {
        tail = st % 10;
        switch(tail)
        {
            case 1:
                robj.s.string = "секунда";
            break;
            case 2:
            case 3:
            case 4:
                robj.s.string = "секунды";
            break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                robj.s.string = "секунд";
            break;
        }
    }
    return robj;
};


module.exports.learning_points_tail = function(num)
{
    var tail = num % 100;
    if(tail > 10 && tail < 20)
    {
        return "баллов";
    } else 
    {
        tail = tail % 10;
        switch(tail)
        {
            case 1:
                return "балл";
            
            case 2:
            case 3:
            case 4:
                return "балла";
            
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                return "баллов";
        }
    }
}