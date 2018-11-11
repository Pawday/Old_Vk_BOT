//modules
const db    = require('sqlite-sync');
const fs    = require('fs');
const req   = require('sync-request'); 

const fun = require('./scripts/functions');

const token = require('./configs/token.json').token;

const conf = require('./configs/main.json');
//.........................


//DB dir create
try{fs.mkdirSync("databases")}catch(error){}
//...................



//create tables
db.connect('databases/vk.db');

try {db.run(fs.readFileSync('tables_SQL/users.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/ignoring.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/alllist.sql','utf8'))} catch (error) {}

db.run("SELECT 1;")

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
        //failed from LongPoll
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

        

        
        if (response.updates.length !== 0)
        {
            //null event 

            for (let i = 0; i < response.updates.length; i++) 
            {
                //every not null event
                
                var event = response.updates[i];

                console.log(event);


                if (event[0] == 4)
                {
                    //massages


                    //var from_id
                    if(typeof(event[6].from) !== 'undefined')
                    {
                        var from_id = parseInt(event[6].from);
                    } else 
                    {
                        var from_id = event[3];
                    }

                    

                    db.connect('databases/vk.db')

                    
                    var user_data = db.run("SELECT * FROM alllist WHERE id_user = ?;",[from_id])[0];

                    if (typeof(user_data) == 'undefined') 
                    {
                        user_data = fun.VKReq(token,"users.get",{"user_ids":from_id}).response[0];
                        db.run("INSERT INTO alllist (id_user, name, surname) VALUES (?,?,?);",[user_data.id,user_data.first_name,user_data.last_name]);
                        user_data = db.run("SELECT * FROM alllist WHERE id_user = ?;",[from_id])[0];
                    }


                    //var db_ignorelst_user_data from ignorelist
                    var db_ignorelst_user_data = db.run("SELECT * FROM ignorelist WHERE id_user = ?;",[from_id])[0];
                    if (typeof(db_ignorelst_user_data) == 'undefined') 
                    {
                        db.run("INSERT INTO ignorelist (id_user, name, surname) VALUES (?,?,?);",[user_data.id_user,user_data.name,user_data.surname]);
                        db_ignorelst_user_data = db.run("SELECT * FROM ignorelist WHERE id_user = ?;",[from_id])[0];
                    }

                    // from tables users
                    var db_users_data = db.run("SELECT * FROM users WHERE id_user = ?;",[from_id])[0];

                    db.close();

                    


                    var mass_arr = event[5].split(" ");

                    if(conf.Bots_Names.indexOf(mass_arr[0]) != -1)
                    {
                        //Called bot

                        if(db_ignorelst_user_data.ignoring != 1) 
                        {
                            //user not ignoring

                            if(typeof(db_users_data) == 'undefined')
                            {
                                //user not registered
                                fun.helpfunk(mass_arr[1],event); 

                                switch(mass_arr[1])
                                {
                                    case "рег":
                                    case "Рег":
                                    case "reg":
                                    case "Reg":
                                    case "регистрация":
                                    case "Регистрация":
                                    case "registration":
                                    case "Registration":

                                    db.connect('databases/vk.db');

                                    db.run("INSERT INTO users (id_user, name, surname, balanсe) VALUES (?,?,?,?);",[user_data.id_user,user_data.name,user_data.surname,conf.Economics.Beginning_Balance]);

                                    var mass = "[&#9989;] Вы успешно зарегистрировались! \n [&#128179;] У вас на счету " + conf.Economics.Beginning_Balance + " " + fun.Currency_tail(conf.Economics.Beginning_Balance) + '.';
                                    db.close();

                                    fun.VKReq(token,'messages.send',
                                    {
                                        "forward_messages":event[1],
                                        "peer_id":event[3],

                                        "message": mass
                                    });


                                    
                                    break;
                                }
                            } else 
                            {
                                //user registered
                            }
                        }
                    }
                }
            }
        }
        ts = response.ts;
    }
}