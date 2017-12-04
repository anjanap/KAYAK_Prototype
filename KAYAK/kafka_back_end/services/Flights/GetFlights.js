var security = require('../utils/security');
var mysql=require('./../database/mysql');
//var errorHandler = require('./../utils/errorLogging');

function handle_request(msg, callback){

    console.log("In Get Files handle request:"+ JSON.stringify(msg));
    console.log("msg.class"+msg.class);

    var fetchQuery="select * from flight fl INNER JOIN flight_availibility fa ON fl.flight_id = fa.flight_id where fl.stops like ? and fl.stops like ? AND fa.dates = ? AND";
    //fa.first_seates > ?

    if(msg.class === "economy")
    {
        fetchQuery = fetchQuery+" fa.economy_seates > ?";
    }
    else if(msg.class === "first")
    {
        fetchQuery = fetchQuery+" fa.first_seates > ?";
    }
    else if(msg.class ==="business")
    {
        fetchQuery = fetchQuery+" fa.business_seates > ?";
    }

    var mappingquery;
    var dataArry = [];
    var source = msg.source;
    console.log("source------------------------"+source);
    var des = msg.Destination;
    dataArry.push('%'+source+'%');
    dataArry.push('%'+des+'%');
    dataArry.push(msg.startdate);
    dataArry.push(msg.adult);
    var res=[];
    var temp =[];
    var indexofsource;
    var indexofdes;
    var resultforflights =[]; // array will be passed to the second query
    var finalresult = [];
    var finalresultobject ={};
    var source_price = 0;
    var destination_price = 0;
    var noofarguments = '?';

    console.log("msg.adult: "+msg.adult);
    console.log("DATA: "+dataArry);
    console.log("fetchQuery:"+fetchQuery);

    // First Query will fetch flight ids from flight tables based on the input parameter

    mysql.fetchData(fetchQuery,dataArry,function (err,results){
        if(results.length >0){

        console.log("result "+results[0].flight_id);

        for( var i=0;i<results.length;i++)
        {
            temp = results[i].stops.split(',');

            console.log("AirLINE--"+results[i].airline_name);
            indexofsource =temp.indexOf(source);
            indexofdes=temp.indexOf(des);
            console.log("indexofsource--"+indexofsource);
            console.log("indexofdes--"+indexofdes);

            // condition for checking irrelevent flight ids
            if (indexofsource<indexofdes)
            {
                resultforflights.push(results[i].flight_id);
            }
        }

      console.log("resultforflights.length:"+resultforflights.length);
       if(resultforflights.length>0){
       if( resultforflights.length ===1)
       {

       }
       else{
            console.log("else");
        for(var res1=0;res1<resultforflights.length-1;res1++)
        {
            noofarguments = noofarguments+',?';
            console.log("noofarguments :" + noofarguments)
        }
       }
        resultforflights.push(source);
        resultforflights.push(des);
        console.log(resultforflights);

        // Second Query to fetch data based on the flight ids

        mappingquery=" select * from flight_mapping where flight_id in ("+ noofarguments+") and station_name in (?,?) ORDER BY flight_id,flight_duration";
        console.log("mappingquery : "+ mappingquery);

        mysql.fetchData(mappingquery,resultforflights,function (err,results1) {

            console.log("inside mapping"+results1);

            for(var i=0;i<results1.length;i++)
            {
                if(i%2 === 0 || i===0)
                {
                    finalresultobject.origin_station = results1[i].station_name;
                    finalresultobject.flight_departure = results1[i].flight_departure;

                    finalresultobject.airline_name = results1[i].airline_name;

                    // added for booking
                    finalresultobject.flight_id = results1[i].flight_id;
                    finalresultobject.date = msg.startdate;
                    
                    source_price = results1[i].economy_class;
                }
                else if (i%2 ===1)
                {
                    finalresultobject.destination_station = results1[i].station_name;
                    finalresultobject.flight_arrival = results1[i].flight_arrival;

                    destination_price = results1[i].economy_class;
                    //finalresultobject.totalprice = destination_price-source_price;
                    finalresultobject.totalprice = destination_price;
                    finalresultobject.duration = results1[i].flight_duration;
                    finalresultobject.class = msg.class;
                    finalresultobject.nooftickets = msg.adult;

                    finalresult.push(finalresultobject);
                    finalresultobject ={};
                    destination_price =0;
                    source_price =0;
                }
            }

           for(var k = 0; k<finalresult.length;k++)
           {
                console.log("final Array : "+finalresult[k].origin_station);
                console.log("final Array : "+finalresult[k].destination_station);
                console.log("final Array : "+finalresult[k].flight_departure);
                console.log("final Array : "+finalresult[k].flight_arrival);
                console.log("final Array : "+finalresult[k].totalprice);
           }

            res.code = "200";
            console.log("Success---"+res);
            callback(null, finalresult);


                 });
        }

        else
            {
                var response =[]
                response.code = "200";
           console.log("Success--- but no result"+response);
           callback(null, response);
       }
        }

        else
        {
            var response =[]

            response.code = "200";
            console.log("Success--- but no result"+response);
            callback(null, response);
        }
    });




};

exports.handle_request = handle_request;
