var security = require('../utils/security');
var mysql=require('./../database/mysql');
var mongo = require("../database/mongo_connect");
var mongoURL = "mongodb://localhost:27017/kayak_18";
//var errorHandler = require('./../utils/errorLogging');

// mongo DB Inclusion
var ObjectID = require('mongodb').ObjectID;

function handle_request(msg, callback){

    console.log("BOOOOOOOKKKKKKKKKKKKKKKKKKKKKINGGGGGGGGGGGG");
    var response =[];
    var fetchQuery="SELECT * FROM flight_availibility WHERE flight_id = ? AND dates = ?";
    var fetchQuery_return;
    var fetchQuery_final;
    var dataArry = [];
    var dataArry_final = [];
    var dataArry_return = [];
    dataArry.push(msg.flight_id);
    dataArry.push(msg.date);

    dataArry_return.push(msg.noofseats_return);
    dataArry_return.push(msg.flight_id_return);
    dataArry_return.push(msg.date_return);
    var final_seates;

    console.log("msg.class:"+msg.class);
    console.log("msg.noofseats:"+msg.noofseats);
    console.log("msg.class_return:"+msg.class_return);
    console.log("msg.noofseats_return:"+msg.noofseats_return);

    if(msg.class === "economy")
    {
        fetchQuery_final="UPDATE flight_availibility SET economy_seates = ? WHERE flight_id = ? AND dates = ?";
    }
    else if(msg.class === "first")
    {
        fetchQuery_final="UPDATE flight_availibility SET first_seates = ? WHERE flight_id = ? AND dates = ?";
    }
    else if(msg.class ==="business")
    {
        fetchQuery_final="UPDATE flight_availibility SET business_seates = ? WHERE flight_id = ? AND dates = ?";
    }

    // Update Query for flight return

    if(msg.class === "economy")
    {
        fetchQuery_return="UPDATE flight_availibility SET economy_seates = economy_seates - ? WHERE flight_id = ? AND dates = ?";
    }
    else if(msg.class === "first")
    {
        fetchQuery_return="UPDATE flight_availibility SET first_seates = first_seates - ? WHERE flight_id = ? AND dates = ?";
    }
    else if(msg.class ==="business")
    {
        fetchQuery_return="UPDATE flight_availibility SET business_seates = business_seates - ? WHERE flight_id = ? AND dates = ?";
    }
    console.log(msg.flight_departure);
    console.log(msg.totalprice);
    console.log(msg.airline_name);

        mysql.fetchData(fetchQuery,dataArry,function (err,results){
            console.log("Inside 1");

        if(results.length > 0)
        {
            console.log("first_seates "+results[0].first_seates);



            if(msg.class === "economy")
            {
                final_seates = results[0].economy_seates-msg.noofseats;
            }
            else if(msg.class === "first")
            {
                final_seates = results[0].first_seates-msg.noofseats;
            }
            else if(msg.class ==="business")
            {
                final_seates = results[0].business_seates-msg.noofseats;
            }

            dataArry_final.push(final_seates);
            dataArry_final.push(msg.flight_id);
            dataArry_final.push(msg.date);

            mysql.fetchData(fetchQuery_final,dataArry_final,function (err,results){
                console.log("Inside 2");


                if(!err) {

                    mysql.fetchData(fetchQuery_return,dataArry_return,function (err,results) {
                        if (!err)
                        {
                            console.log("Inside 3");
                            mongo.connect(mongoURL, function () {

                                console.log('Connected to mongo at: ' + mongoURL);
                                var coll = mongo.collection('Billing');

                                coll.findOne({"userid": msg.userid}, function (err, searchuser) {
                                        if (searchuser) {
                                            console.log("searchuser" + searchuser.flight_total);
                                            //console.log("flight_total"+searchuser[0].flight_total);
                                            var flight_total_new = searchuser.flight_total + msg.totalprice;
                                            var number_of_flight_bookings = searchuser.flight.length;
                                            number_of_flight_bookings = number_of_flight_bookings + 1;

                                            console.log("searchuser.flight.length:" + searchuser.flight.length);
                                            console.log("flight_total_new" + flight_total_new);

                                            coll.update({userid: msg.userid}, {
                                                $push: {
                                                    flight: {
                                                        billid: new ObjectID(),
                                                        flight_id: msg.flight_id,
                                                        airline_name: msg.airline_name,
                                                        origin_station: msg.origin_station,
                                                        destination_station: msg.destination_station,
                                                        flight_departure: msg.flight_departure,
                                                        flight_arrival: msg.flight_arrival,
                                                        totalprice: msg.totalprice,
                                                        noofseats: msg.noofseats,
                                                        class: msg.class,
                                                        city:msg.city,
                                                        flight_id_return:msg.flight_id_return,
                                                        airline_name_return:msg.airline_name_return,
                                                        origin_station_return:msg.origin_station_return,
                                                        destination_station_return:msg.destination_station_return,
                                                        flight_departure_return:msg.flight_departure_return,
                                                        flight_arrival_return:msg.flight_arrival_return,
                                                        date_return:msg.date_return,
                                                        class_return:msg.class_return,
                                                        noofseats_return:msg.noofseats_return
                                                    }
                                                }
                                            }, function (err, user) {


                                                console.log("inside call back" + user);
                                                if (user) {

                                                    coll.update({"userid": msg.userid}, {
                                                            $set: {
                                                                flight_total: flight_total_new,
                                                                flight_count: number_of_flight_bookings
                                                            }
                                                        },
                                                        function (err, user2) {

                                                            if (!err) {

                                                                // data to be inserted in flight_analytics

                                                                var new_total;
                                                                var new_counter;
                                                                coll = mongo.collection('flight_analytics');
                                                                coll.findOne({name: msg.airline_name,
                                                                        year:new Date().getFullYear()},
                                                                    function(err, user){
                                                                    console.log("user"+JSON.stringify(user));

                                                                    if(user && user.name)
                                                                    {
                                                                        new_total = user.revenue+msg.totalprice;
                                                                        new_counter = user.count+1;

                                                                        console.log("Inside Flight Analytics");

                                                                        coll.update({name: msg.airline_name,
                                                                                year:new Date().getFullYear()
                                                                                }, {
                                                                                $set: {
                                                                                    revenue: new_total,
                                                                                    count: new_counter
                                                                                }
                                                                            },
                                                                            function (err, user2) {

                                                                                if (!err) {

                                                                                    // City Wise Update

                                                                                    // console.log("Inside Flight Analytics 1");


                                                                                    var new_total_city;
                                                                                    var new_counter_city;
                                                                                    coll = mongo.collection('city_analytics');

                                                                                    coll.findOne({name: msg.origin_station,
                                                                                            year:new Date().getFullYear()},
                                                                                        function(err, user){
                                                                                            if(user && user.name)
                                                                                            {
                                                                                                new_total_city = user.revenue+msg.totalprice;
                                                                                                new_counter_city = user.count+1;

                                                                                                console.log("Inside City Analytics");

                                                                                                coll.update({name: msg.origin_station,
                                                                                                        year:new Date().getFullYear()
                                                                                                    }, {
                                                                                                        $set: {
                                                                                                            revenue: new_total_city,
                                                                                                            count: new_counter_city
                                                                                                        }
                                                                                                    },
                                                                                                    function (err, user2) {

                                                                                                    if(!err)
                                                                                                    {
                                                                                                        response.code = "200";
                                                                                                        console.log("Success" + response);
                                                                                                        callback(null, response);

                                                                                                    }
                                                                                                    else
                                                                                                    {
                                                                                                        response.code = "400";
                                                                                                        console.log("Fail" + response);
                                                                                                        callback(null, response);
                                                                                                    }

                                                                                                    });
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                coll.insert({name: msg.origin_station,
                                                                                                        year:new Date().getFullYear(),
                                                                                                        revenue: msg.totalprice,
                                                                                                        count: 1
                                                                                                    }
                                                                                                    ,
                                                                                                    function (err, user2) {
                                                                                                        if(!err)
                                                                                                        {
                                                                                                            response.code = "200";
                                                                                                            console.log("Success" + response);
                                                                                                            callback(null, response);

                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            response.code = "400";
                                                                                                            console.log("Fail" + response);
                                                                                                            callback(null, response);
                                                                                                        }

                                                                                                    })

                                                                                            }

                                                                                        });
                                                                                }
                                                                                    else
                                                                                {
                                                                                    response.code = "400";
                                                                                    console.log("Fail" + response);
                                                                                    callback(null, response);
                                                                                }
                                                                        });

                                                                    }
                                                                    else
                                                                    {
                                                                        console.log("Inside Flight Analytics");
                                                                        coll.insert({name: msg.airline_name,
                                                                                year:new Date().getFullYear(),
                                                                                revenue: msg.totalprice,
                                                                                count: 1
                                                                                }
                                                                            ,
                                                                            function (err, user2) {

                                                                                console.log("Inside Flight Analytics 2");

                                                                                if (!err) {

                                                                                    coll = mongo.collection('city_analytics');

                                                                                    coll.findOne({name: msg.origin_station,
                                                                                            year:new Date().getFullYear()},
                                                                                        function(err, user){
                                                                                            if(user && user.name)
                                                                                            {
                                                                                                new_total_city = user.revenue+msg.totalprice;
                                                                                                new_counter_city = user.count+1;

                                                                                                console.log("Inside City Analytics");

                                                                                                coll.update({name: msg.origin_station,
                                                                                                        year:new Date().getFullYear()
                                                                                                    }, {
                                                                                                        $set: {
                                                                                                            revenue: new_total_city,
                                                                                                            count: new_counter_city
                                                                                                        }
                                                                                                    },
                                                                                                    function (err, user2) {

                                                                                                        if(!err)
                                                                                                        {
                                                                                                            response.code = "200";
                                                                                                            console.log("Success" + response);
                                                                                                            callback(null, response);

                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            response.code = "400";
                                                                                                            console.log("Fail" + response);
                                                                                                            callback(null, response);
                                                                                                        }

                                                                                                    });
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                coll.insert({name: msg.origin_station,
                                                                                                        year:new Date().getFullYear(),
                                                                                                        revenue: msg.totalprice,
                                                                                                        count: 1
                                                                                                    }
                                                                                                    ,
                                                                                                    function (err, user2) {
                                                                                                        if(!err)
                                                                                                        {
                                                                                                            response.code = "200";
                                                                                                            console.log("Success" + response);
                                                                                                            callback(null, response);

                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            response.code = "400";
                                                                                                            console.log("Fail" + response);
                                                                                                            callback(null, response);
                                                                                                        }

                                                                                                    })

                                                                                            }

                                                                                        });

                                                                                }
                                                                                else
                                                                                {
                                                                                    response.code = "400";
                                                                                    console.log("Fail" + response);
                                                                                    callback(null, response);

                                                                                }
                                                                        });

                                                                    }

                                                                })
                                                            }
                                                            else {
                                                                response.code = "400";
                                                                console.log("Fail" + response);
                                                                callback(null, response);

                                                            }

                                                        })

                                                }
                                                else {
                                                    response.code = "400";
                                                    console.log("Fail" + response);
                                                    callback(null, response);
                                                }
                                            });

                                        }
                                        else {
                                            response.code = "400";
                                            console.log("Fail" + response);
                                            callback(null, response);

                                        }
                                    }
                                )


                            });

                    }
                    else
                        {
                            response.code = "400";
                            console.log("Fail" + response);
                            callback(null, response);

                        }

                });




                }
                else
                {
                    response.code = "400";
                    console.log("Fail"+response);
                    callback(null, response);

                }

            });


        }
        else
        {
            response.code = "400";
            console.log("Fail"+response);
            callback(null, response);
        }
    });


}

exports.handle_request = handle_request;