//modules
const db    = require('sqlite-sync');
const fs    = require('fs');
const req   = require('sync-request'); 

const fun = require('./scripts/functions');

const token = require('./configs/token.json').token;

const conf = require('./configs/main.json');
//.........................



//create tables
db.connect('databases/vk.db');

try {db.run(fs.readFileSync('tables_SQL/users.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/ignoring.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/alllist.sql','utf8'))} catch (error) {}


db.close();
console.clear();
//..........................

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
        

        
        if (response.updates.length !== 0)
        {
            //тут событие не пустое (и их может быть много)

            for (let i = 0; i < response.updates.length; i++) 
            {
                //тут можно разобрать каждое событие
                
                const event = response.updates[i];


                if (event[0] == 4)
                {
                    //пришло сообщение


                    //установка переменной from_id
                    if(typeof(event[6].from) !== 'undefined')
                    {
                        var from_id = parseInt(event[6].from);
                    } else 
                    {
                        var from_id = event[3];
                    }

                    

                    db.connect('databases/vk.db')

                    // Переменную user_data мы поучаем из своей базы, если в ней (в базе) есть этот пользователь, если нет то мы обращаемся к VK_API и записываем оттуда данные о пользователе
                    var user_data = db.run("SELECT * FROM alllist WHERE id_user = ?;",[from_id])[0];

                    if (typeof(user_data) == 'undefined') 
                    {
                        user_data = fun.VKReq(token,"users.get",{"user_ids":from_id}).response[0];
                        db.run("INSERT INTO alllist (id_user, name, surname) VALUES (?,?,?);",[user_data.id,user_data.first_name,user_data.last_name]);
                        user_data = db.run("SELECT * FROM alllist WHERE id_user = ?;",[from_id])[0];
                    }


                    //переменная db_ignorelst_user_data из игнорлиста
                    var db_ignorelst_user_data = db.run("SELECT * FROM ignorelist WHERE id_user = ?;",[from_id])[0];
                    if (typeof(db_ignorelst_user_data) == 'undefined') 
                    {
                        db.run("INSERT INTO ignorelist (id_user, name, surname) VALUES (?,?,?);",[user_data.id_user,user_data.name,user_data.surname]);
                        db_ignorelst_user_data = db.run("SELECT * FROM ignorelist WHERE id_user = ?;",[from_id])[0];
                    }

                    // из таблици users
                    var db_users_data = db.run("SELECT * FROM users WHERE id_user = ?;",[from_id])[0];

                    console.log(db_users_data);
                    

                    db.close();

                    
                    

                }



            }

        }

        ts = response.ts;
    }
}