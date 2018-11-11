const req = require('sync-request');

const fun = require('./functions');
const token = require('./../configs/token.json').token;

const conf = require('./../configs/main.json');




module.exports.help = function(mas,event)
{
    switch(mas[1])
    {
        case "help":
        case "Help":
        case "хелп":
        case "Хелп":
        case "помощь":
        case "Помощь":
        case "помощ":
        case "Помощ":

        //  "" + "\n" +


        var mass = 
        
        "------------- " + conf.Bot_Display_name +  " -------------" + "\n" +
        "[&#10002;] Рег" + "\n";




        fun.VKReq(token,'messages.send',
        {
            
            "peer_id":event[3],

            "message": mass
        });
        return true;
    }
    return false;
}