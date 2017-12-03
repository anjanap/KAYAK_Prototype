/*
var mysql =  require('./../database/mysql');
var errorHandler = require('./../utils/errorLogging');

var saveHotel = function (data,callback) {
    var  query = "INSERT INTO hotel (hotel_name,hotel_address,hotel_city,hotel_state,hotel_zipcode,hotel_description,hotel_ameneties) values(?,?,?,?,?,?,?)";
    var dataArry =  [];

    mysql.setData(query,dataArry,function(err,results){

        if(err){
           errorHandler.logError("Hotel.js","saveHotel",err);
        }else{


            console.log("Hotel added successfully.")
        }
        callback(err,results);
    })
};

var saveRoom = function (hotel_id,data,callback) {
    var query = "";
    if(data.id && data.id>0){
        query = "UPDATE room set room_type=?,room_size=?,guestAllowed=?,room_price=? WHERE room_id = ?";
    }else{
        query = "INSERT INTO room (hotel_id,room_type,room_size,guestAllowed,room_price) VALUES(?,?,?,?)";
    }
    var dataArry =  [];
    if(data instanceof Array == false){
        var dataArry = [];
        dataArry.push(data);
        data = dataArry;
    }

    var length = data.length;
    while(length>0){
        var room = data[--length];
        var roomData  = [];
        if(data.id && data.id>0){
            roomData.push(data.id);
        }
        dataArry.push(roomData);
    }
    if(dataArry.length<=1){
        dataArry = dataArry[0];
    }else{
        dataArry = [dataArry];
    }
    mysql.setData(query,dataArry,function (err,results){
        if(err){
            errorHandler.logError("Hotel.js","saveRoom",err);
        }else{
            callback(err,results);
        }
    });
};

var deleteHotel = function(data,callback){
    var query = "UPDATE hotel SET deleteflag = 1 WHERE hotel_id = ?";
    mysql.setData(query,[data.hotel_id],function(err,results){
       callback(err,results);
    });
};

var deleteRoom = function(data,callback){
    var query = "UPDATE room SET deleteflag = 1 WHERE hotel_id = ?";
    mysql.setData(query,[data.room_id],function(err,results){
        callback(err,results);
    });
};

exports.deleteHotel = deleteHotel;
exports.saveHotel = saveHotel;
exports.saveRoom = saveRoom;
exports.deleteRoom = deleteRoom;*/

var security = require('./../utils/security');
var mysql=require('./../database/mysql');
var errorHandler = require('./../utils/errorLogging');

var insertHotelData = function(msg,callback){
    var res = {};
    console.log("In handle request:"+ JSON.stringify(msg));

    var insertQuery="INSERT INTO hotels (hotel_name,hotel_star,hotel_location,hotel_city,hotel_state,hotel_zipcode,hotel_description,hotel_amenities) values(?,?,?,?,?,?,?,?)";
    var query= "INSERT INTO hotel_availability (hotel_id,date,king_rooms,queen_rooms,standard_rooms) VALUES(?,?,?,?,?) ";
    var query1 = "INSERT INTO room_rates (hotel_id,king_rates,queen_rates,standard_rates,deleteflag) VALUES(?,?,?,?,0)";
    var array=[];

    var dataArry =  [];
    dataArry.push(msg.hotelname);
    dataArry.push(msg.hotelstar);
    dataArry.push(msg.hoteladdress);
    dataArry.push(msg.hotelcity);
    dataArry.push(msg.hotelstate);
    dataArry.push(msg.hotelzipcode);
    dataArry.push(msg.hoteldesc);
    dataArry.push(msg.hotelameneties);
    //console.log("DATA: "+dataArry);
    mysql.setData(insertQuery,dataArry,function (err,results,id){
        //console.log("CHECK RES: "+results);
        if (err){
            //res.code = "401";
            res = "Failed Insertion";
            //console.log("Failed signup---");
            errorHandler.logError("Signup.js","afterSignUp",err);
        }
        else{
            res.code = "200";
            res.value=results;
            res.id=id;
            console.log("Successfully Hotel Data Inserted: ",id);
            var hotelid = id;

            var array = [];
            array.push(id);
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate());
            var dateToInsert =   tomorrow.getFullYear()+"-"+(tomorrow.getMonth()+1)+"-"+tomorrow.getDate()
            array.push(dateToInsert);
            array.push(msg.kingrooms);
            array.push(msg.queenrooms);
            array.push(msg.standardrooms);

            for(var i=0;i<60;i++){

            }

            mysql.setData(query,array,function (err,results,id) {
                if (err){
                    //res.code = "401";
                    res = "Failed Insertion";
                    console.log(err);
                   // console.log("Failed signup---");
                    errorHandler.logError("Signup.js","afterSignUp",err);
                }
                else
                {

                for(var i=1;i<60;i++){
                    var arrData = [];
                    arrData.push(hotelid);
                    var tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate()+i);
                    var dateToInsert =   tomorrow.getFullYear()+"-"+(tomorrow.getMonth()+1)+"-"+tomorrow.getDate();
                    console.log("dateToInsert is : "+dateToInsert);
                    arrData.push(dateToInsert);
                    arrData.push(msg.kingrooms);
                    arrData.push(msg.queenrooms);
                    arrData.push(msg.standardrooms);
                    mysql.setData(query,arrData,function (err,results,id) {});
                }


                    array = [];
                    array.push(hotelid);
                    var rate = 150 + parseInt(hotelid);

                    console.log("rate is "+rate);
                    rate = rate+rate;

                    if(rate/500 > 0){
                        rate = rate%500;
                    }
                    if(rate<60){
                        rate = rate+150;
                    }}

                    console.log("rate is "+rate);
                    array.push(msg.kingrate);
                    array.push(msg.queenrate);
                    array.push(msg.standardrate);

                    mysql.setData(query1,array,function (err,results,id) {

                        console.log("error in hotel is "+err);
                    });

                    res.code = "200";
                    res.value=results;
                    res.id=id;
                    console.log("Successfully Room Data Inserted: ",id);
                })

            }



        callback(null, res);

    },true);

};


var insertRoomData = function(msg,callback){
    var res = {};
    console.log("In handle request:"+ JSON.stringify(msg));

    var insertQuery="INSERT INTO room (room_type,room_size,guestAllowed,room_price,hotel_id,count) values(?,?,?,?,?,?)";
    var dataArry =  [];
    dataArry.push(msg.roomtype);
    dataArry.push(msg.roomsize);
    dataArry.push(msg.guestAllowed);
    dataArry.push(msg.roomprice);
    dataArry.push(msg.hotelid);
    dataArry.push(msg.roomcount);

    console.log("DATA: "+dataArry);
    mysql.setData(insertQuery,dataArry,function (err,results){
        console.log("CHECK RES: "+results);
        if (err){
            //res.code = "401";
            res = "Failed Insertion";
            console.log("Failed signup---");
            errorHandler.logError("Signup.js","afterSignUp",err);
        }
        else{
            res.code = "200";
            res.value=results;
            console.log("Successfully Room Data Inserted");
        }
        callback(null, res);

    });

};

function getHotelData(msg, callback){
    console.log("In getHotel:"+ JSON.stringify(msg));
    var res={};
    var fetchQuery="SELECT * FROM hotels LEFT OUTER JOIN hotel_availability on hotels.hotel_id = hotel_availability.hotel_id JOIN room_rates on hotels.hotel_id = room_rates.hotel_id WHERE hotels.deleteflag=0 GROUP BY hotels.hotel_id";
    console.log("SELECT QUERY: "+fetchQuery);
    var dataArry =  [];

    console.log("DATA: "+dataArry);
    mysql.fetchData(fetchQuery,dataArry,function (err,results){
        console.log("LIST Hotels: "+results);
        if(err){
            errorHandler.logError("Hotels.js","getHotelData",err);
            res.code = "401";
            res.value = 0;
            console.log("Failed account");
            callback(null, res);
        }
        else{
            res.code = "200";
            res.value=results;
            callback(null, res);
        }
    });
};

function getRoomData(msg, callback){
  console.log("In getRoomData:"+ JSON.stringify(msg));
 var res=[];
  var fetchQuery="SELECT * FROM room WHERE hotel_id=? and deleteflag=0";
  console.log("SELECT QUERY: "+fetchQuery);
  var dataArry =  [];
  dataArry.push(msg.hid);
  console.log("DATA: "+dataArry);
  mysql.fetchData(fetchQuery,dataArry,function (err,results){
    console.log("LIST ROOMS: "+results);
    if(err){
        errorHandler.logError("Hotel.js","getRoomData",err);
        res.code = "401";
        res.value = 0;
        console.log("Failed account");
        callback(null, res);
    }
    else{
      res.code = "200";
        res.value=results;
        callback(null, res);
}
},true);
};


function updateRoomData(msg, callback){
  var res = '';
  console.log("In handle request:"+ JSON.stringify(msg));

  var insertQuery="UPDATE room SET room_size=?,guestAllowed=?,room_price=?,count=? WHERE room_id="+msg.roomid;
  var dataArry =  [];
  dataArry.push(msg.roomsize);
  dataArry.push(msg.guestAllowed);
  dataArry.push(msg.roomprice);
  dataArry.push(msg.roomcount);
  console.log("DATA: "+dataArry);
  mysql.setData(insertQuery,dataArry,function (err,results){
    console.log("CHECK RES: "+results);
    if (err){
            res= "Failed Update";
            console.log("Failed update---");
            errorHandler.logError("account.js","handle_update",err);
            callback(null, res);
    }
    else{
          res.code = "200";
            res.value=results;
            console.log("Success---");
            callback(null, results);
    }
});
};

function deleteRoomData(msg, callback){
  var res = '';
  console.log("In handle request:"+ JSON.stringify(msg));
  var insertQuery="UPDATE room SET deleteflag=1 WHERE room_id="+msg.roomid;
  var dataArry =  [];
  console.log("DATA: "+dataArry);
  mysql.setData(insertQuery,dataArry,function (err,results){
    console.log("CHECK RES: "+results);
    if (err){
            res= "Failed Update";
            console.log("Failed update---");
            errorHandler.logError("account.js","handle_update",err);
            callback(null, res);
    }
    else{
          res.code = "200";
            res.value=results;
            console.log("Success---");
            callback(null, results);
    }
});
};

function deleteHotelData(msg, callback){
    var res = '';
    console.log("In handle request:"+ JSON.stringify(msg));
    var insertQuery="UPDATE hotels SET deleteflag=1 WHERE hotel_id in ("+msg.hotelid+")";
    var dataArry =  [];
    console.log(insertQuery);

    console.log("DATA: "+dataArry);
    mysql.setData(insertQuery,dataArry,function (err,results){
        console.log("CHECK RES: "+results);
        if (err){
            res= "Failed Update";
            console.log("Failed update---");
            errorHandler.logError("account.js","handle_update",err);
            callback(null, res);
        }
        else{
            res.code = "200";
            res.value=results;
            console.log("Success---");
            callback(null, results);
        }
    });
};

function updateHotelData(msg, callback){
    var res = '';
    console.log("In handle request:"+ JSON.stringify(msg));
    var insertQuery="UPDATE hotels SET hotel_name=?,hotel_star=?,hotel_location=?,hotel_city=?,hotel_state=?,hotel_zipcode=?,hotel_description=? WHERE hotel_id="+msg.hotelid;
    var dataArry =  [];
    dataArry.push(msg.hotelname);
    dataArry.push(msg.hotelstar);
    dataArry.push(msg.hoteladdress);
    dataArry.push(msg.hotelcity);
    dataArry.push(msg.hotelstate);
    dataArry.push(msg.hotelzipcode);
    dataArry.push(msg.hoteldesc);
    console.log("DATA: "+dataArry);
    console.log(insertQuery);

    mysql.setData(insertQuery,dataArry,function (err,results){
        console.log("CHECK RES: "+results);
        if (err){
            res= "Failed Update";
            console.log("Failed update---");
            errorHandler.logError("account.js","handle_update",err);
            callback(null, res);
        }
        else{
            res.code = "200";
            res.value=results;
            console.log("Success---");
            callback(null, results);
        }
    });
};

exports.insertHotelData = insertHotelData;
exports.insertRoomData=insertRoomData;
exports.getRoomData=getRoomData;
exports.updateRoomData=updateRoomData;
exports.deleteRoomData=deleteRoomData;
exports.getHotelData=getHotelData;
exports.deleteHotelData=deleteHotelData;
exports.updateHotelData=updateHotelData;