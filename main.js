//modules
const db    = require('sqlite-sync');
const fs    = require('fs');
const req   = require('sync-request'); 

const fun = require('./scripts/functions');
const echo_fun = require('./scripts/echo_functions');

const token = require('./configs/token.json').token;

var conf = require('./configs/main.json');
//.........................


//DB dir create
try{fs.mkdirSync("databases")}catch(error){}
//...................



//create tables
db.connect('databases/vk.db');

try {db.run(fs.readFileSync('tables_SQL/users.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/ignoring.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/alllist.sql','utf8'))} catch (error) {}
try {db.run(fs.readFileSync('tables_SQL/education.sql','utf8'))} catch (error) {}


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

                    

                    db.connect('databases/vk.db');

                    var education_db_data =  db.run("SELECT * FROM education WHERE id_user = ?;",[from_id])[0];

                    
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
                                var bool = echo_fun.help(mass_arr,event);

                                if (!bool) 
                                {
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

                                        default:

                                        var mass = "[&#9940;] Вы не зарегистрированны!"

                                        fun.VKReq(token,'messages.send',
                                        {
                                            "forward_messages":event[1],
                                            "peer_id":event[3],

                                            "message": mass
                                        });

                                        break;
                                    }
                                }

                                
                            } else 
                            {
                                //user registered
                                if (db_users_data.banned != 1)
                                {
                                    //user not banned


                                    //Cascade privilege table

                                    var rang = fun.cascade_table(db_users_data.rang);

                                    if (rang >= 1)  //user
                                    {
                                        bool = echo_fun.help(mass_arr,event);
                                        if (!bool) 
                                        {
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

                                                var mass = 
                                                "[&#9940;] Вы уже зарегистрированны!"

                                                fun.VKReq(token,'messages.send',
                                                {
                                                    "forward_messages":event[1],
                                                    "peer_id":event[3],

                                                    "message": mass
                                                });


                                                
                                                break;

                                                case "ранг":
                                                case "Ранг":
                                                case "rang":
                                                case "Rang":

                                                var mass = "[&#9824;] Ваш ранг: " + db_users_data.rang + ".";

                                                fun.VKReq(token,'messages.send',
                                                {
                                                    "forward_messages":event[1],
                                                    "peer_id":event[3],

                                                    "message": mass
                                                });

                                                break;

                                                case "баланс":
                                                case "Баланс":

                                                
                                                

                                                var mass = "[&#128179;] Ваш баланс составляет " + db_users_data.balanсe + " " + fun.Currency_tail(db_users_data.balanсe) + ".";

                                                fun.VKReq(token,'messages.send',
                                                {
                                                    "forward_messages":event[1],
                                                    "peer_id":event[3],

                                                    "message": mass
                                                });


                                                break;

                                                case "обучение":
                                                case "Обучение":
                                                case "учеба":
                                                case "Учеба":
                                                case "учёба":
                                                case "Учёба":
                                                case "study":
                                                case "Study":

                                                if(typeof (mass_arr[2]) == "undefined")
                                                {
                                                    var mass = "[&#10071;] Для того чтоб узнать о системе образования, наберите: \"" + conf.Bots_Names[0] + " обучение помощь\".";
                                                    fun.VKReq(token,'messages.send',
                                                    {
                                                        "forward_messages":event[1],
                                                        "peer_id":event[3],

                                                        "message": mass
                                                    });
                                                } else 
                                                {
                                                    switch(mass_arr[2])
                                                    {
                                                        case "помощ":
                                                        case "Помощ":
                                                        case "помощь":
                                                        case "Помощь":
                                                        case "help":
                                                        case "Help":

                                                        var mass = 
                                                        "[&#128526;] Не скажу...";
                                                        fun.VKReq(token,'messages.send',
                                                        {
                                                            "peer_id":event[3],

                                                            "message": mass
                                                        });

                                                        break;

                                                        case "рег":
                                                        case "Рег":
                                                        case "reg":
                                                        case "Reg":
                                                        case "регистрация":
                                                        case "Регистрация":
                                                        case "registration":
                                                        case "Registration":

                                                        if(typeof(education_db_data) == "undefined")
                                                        {
                                                            db.connect('databases/vk.db');

                                                            db.run("INSERT INTO education (id_user, name, surname, begin_course) VALUES (?,?,?,?);",[user_data.id_user,user_data.name,user_data.surname,fun.now()]);

                                                            db.close();

                                                            var mass = "[&#9989;] Вы успешно зарегистрировались в системе образования!";
                                                            fun.VKReq(token,'messages.send',
                                                            {
                                                                "forward_messages":event[1],
                                                                "peer_id":event[3],

                                                                "message": mass
                                                            });
                                                        } else 
                                                        {
                                                            var mass = 
                                                            "[&#9940;] Вы уже зарегистрированны в системе образования!"

                                                            fun.VKReq(token,'messages.send',
                                                            {
                                                                "forward_messages":event[1],
                                                                "peer_id":event[3],

                                                                "message": mass
                                                            });
                                                        }


                                                        break;

                                                        default:

                                                        if(typeof(education_db_data) == "undefined")
                                                        {
                                                            var mass = 
                                                            "[&#9940;] Вы не можете воспользоватся системой образования, так как вы не зарегистрированны в ней!\n\n" + 
                                                            "[&#10071;] Для того чтоб узнать о системе образования, наберите: \"" + conf.Bots_Names[0] + " обучение помощь\".";

                                                            fun.VKReq(token,'messages.send',
                                                            {
                                                                "forward_messages":event[1],
                                                                "peer_id":event[3],
        
                                                                "message": mass
                                                            });
                                                        } else 
                                                        {
                                                            //user registered and req other command
                                                            switch(mass_arr[2]) 
                                                            {
                                                                case "место":
                                                                case "Mесто":
                                                                case "plaсe":
                                                                case "Plaсe":
                                                                case "заведение":
                                                                case "Заведение":
                                                                case "учреждение":
                                                                case "Учреждение":
                                                                switch(education_db_data.education_place)
                                                                {
                                                                    case "school":
                                                                    var mass = "[&#128216;] Вы учитесь в школе.";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });


                                                                    break;

                                                                    case "сollege":
                                                                    var mass = "[&#128215;] Вы учитесь в колледже.";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });
                                                                    break;

                                                                    case "university":
                                                                    var mass = "[&#128213;] Вы учитесь в университете.";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });
                                                                    break;

                                                                    case "end":

                                                                    var mass = "[&#10071;] Вы завершили своё обучение!";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });

                                                                    break;

                                                                    
                                                                    default:

                                                                    var mass = "[&#10067;] Вы учитесь хрен пойми где.";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });

                                                                    break;

                                                                    
                                                                }
                                                                break;

                                                                case "школа":
                                                                case "Школа":
                                                                case "school":
                                                                case "School":
                                                                case "шк":

                                                                if (education_db_data.education_place != "school") 
                                                                {

                                                                    switch(education_db_data.education_place)
                                                                    {
                                                                        case "school":
                                                                        var reason = "учитесь в школе";
                                                                        break;
                                                                        case "сollege":
                                                                        var reason = "учитесь в колледже";
                                                                        break;
                                                                        case "university":
                                                                        var reason = "учитесь в университете";
                                                                        break;
                                                                        case "end":
                                                                        var reason = "завершили своё обучение"
                                                                        break;
                                                                        default:
                                                                        var reason = "учитесь хрен пойми где";
                                                                        break;
                                                                    }

                                                                    var mass = "[&#9940;] Вы не можете посетить занятие в школе, так как вы " + reason + ".";

                                                                    fun.VKReq(token,'messages.send',
                                                                    {
                                                                        "forward_messages":event[1],
                                                                        "peer_id":event[3],
                
                                                                        "message": mass
                                                                    });
                                                                } else 
                                                                {
                                                                    if((education_db_data.last_lesson + conf.Day_length * 60) > fun.now())
                                                                    {
                                                                        var wait_time = fun.timeparse((education_db_data.last_lesson + conf.Day_length * 60) - fun.now());
                                                                        var str_tail = "";
                                                                        if (wait_time.d.value > 0)
                                                                        {
                                                                            str_tail += " " + wait_time.d.value + " " + wait_time.d.string;
                                                                        }
                                                                        if (wait_time.h.value > 0)
                                                                        {
                                                                            str_tail += " " + wait_time.h.value + " " + wait_time.h.string;
                                                                        }
                                                                        if (wait_time.m.value > 0)
                                                                        {
                                                                            str_tail += " " + wait_time.m.value + " " + wait_time.m.string;
                                                                        }
                                                                        if (wait_time.s.value > 0)
                                                                        {
                                                                            str_tail += " " + wait_time.s.value + " " + wait_time.s.string;
                                                                        }
                                                                        var mass = "[&#9940;] Вы не можете пойти в школу прямо сейчас.\n" + 
                                                                        "[&#8987;] До следующего занятия осталось:\n" + str_tail + ".";

                                                                        fun.VKReq(token,'messages.send',
                                                                        {
                                                                            "forward_messages":event[1],
                                                                            "peer_id":event[3],
                    
                                                                            "message": mass
                                                                        });
                                                                    } else 
                                                                    {
                                                                        var earnings = fun.random(conf.Education.School.Earned_point[0],conf.Education.School.Earned_point[1]);
                                                                        var las_lesson = education_db_data.begin_course + conf.Day_length * 60 * Math.floor((fun.now() - education_db_data.begin_course) / (conf.Day_length * 60));
                                                                        var count_lesson = Math.floor((fun.now() - education_db_data.begin_course) / (conf.Day_length * 60)) + 1;

                                                                        db.connect('databases/vk.db');
                                                                        db.run("UPDATE education SET study_level = ? WHERE id_user = ?;",[education_db_data.study_level + earnings,education_db_data.id_user]);
                                                                        db.run("UPDATE education SET last_lesson = ? WHERE id_user = ?;",[las_lesson,education_db_data.id_user]);
                                                                        db.run("UPDATE education SET count_of_classes_attended = ? WHERE id_user = ?;",[education_db_data.count_of_classes_attended + 1,education_db_data.id_user]);
                                                                        db.run("UPDATE education SET count_of_lessons_now = ? WHERE id_user = ?;",[count_lesson,education_db_data.id_user]);
                                                                        db.close();

                                                                        var mass = "[&#10004;] Вы успешно проучились в школе!\n" +
                                                                        "[&#128218;] Вы заработали " + earnings + " " + fun.learning_points_tail(earnings) + " обучения";
                                                                        fun.VKReq(token,'messages.send',
                                                                        {
                                                                            "forward_messages":event[1],
                                                                            "peer_id":event[3],
                    
                                                                            "message": mass
                                                                        });
                                                                    }
                                                                    
                                                                }
                                                                
                                                                
                                                                break;

                                                            }
                                                        }

                                                        break;
                                                    }
                                                }



                                                break;

                                            }
                                        }
                                    }
                                    if (rang >= 2)  //Vip
                                    {
                                        switch(mass_arr[1])
                                        {

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        ts = response.ts;
    }
}