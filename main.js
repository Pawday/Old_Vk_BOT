//modules
const db    = require('sqlite-sync');
const fs    = require('fs');
const req   = require('sync-request'); 

const fun = require('./scripts/functions');

const token = require('./configs/token.json').token;

const conf = require('./configs/main.json');
//.........................

db.connect('databases/vk.db');
try {db.run(fs.readFileSync('tables_SQL/users.sql','utf8'))} catch (error) {}
db.close();
console.clear();


//connect to LongPollServer
var LP_RES = fun.VKReq(token,"messages.getLongPollServer").response;

var key         = LP_RES.key,
    server      = LP_RES.server,
    ts          = LP_RES.ts;
//..................

while(true)
{
    var response = JSON.parse(req("GET","https://" + server + "?act=a_check&key=" + key + "&ts=" + ts + "&wait=" + conf.LP_Wait_Time + "&mode=2&version=2").getBody('utf8'));

    if( typeof(response.failed) != 'undefined')
    {
        //пришлло failed от LongPoll
        switch(response.failed)
        {
            case 1:

                ts = response.ts;

            break;

            case 2:
            case 3:

                LP_RES = fun.VKReq(token,"messages.getLongPollServer").response;

                key     = LP_RES.key;
                server  = LP_RES.server;
                ts      = LP_RES.ts;

            break;
        }
    } else 
    {
        //пришо событие (но оно может быть пустым)

        console.log(response);

        ts = response.ts;
    }
} 