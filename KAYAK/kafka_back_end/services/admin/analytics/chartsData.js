var mongo = require("../../database/mongo_connect");
var mongoURL = "mongodb://localhost:27017/kayak_18";

var mongo_data = require("../../database/mongo");
// top 10 AIr Lines Query
// Result will be an array of Object
// Example
// [ { '2017': { count: 21, revenue: 990 },
//     _id: 5a1da4fadab666e7ce59d293,
//     name: 'airindia' },
//     { '2017': { count: 19, revenue: 700 },
//         _id: 5a1da4ebdab666e7ce59d292,
//         name: 'airasia' },
//     { '2017': { count: 17, revenue: 600 },
//         _id: 5a1da4d6dab666e7ce59d291,
//         name: 'emirates' },
//     { '2017': { count: 15, revenue: 500 },
//         _id: 5a1da4c9dab666e7ce59d290,
//         name: 'jetblue' } ]


//[
// {count:21, revenue:990,name:airindia, year:'2017'},
// {count:20, revenue:900,name:atlanta, year:'2017'},
// {count:19, revenue:890,name:emirates, year:'2017'},
// {count:21, revenue:990,name:airindia, year:'2018'},
// {count:20, revenue:900,name:atlanta, year:'2018'},
// {count:19, revenue:890,name:emirates, year:'2018'}
// ]

function handle_Request(msg,callback){
    var year = msg.year;
    var data = {year:year,type:"cars",action:"count"};
    var returnData = {};
    getTop10Numbers(data,function(err,result){
        returnData.car_count = result;
        var data = {year:year,type:"cars",action:"revenue"};
        getTop10Numbers(data,function(err,result){
            returnData.car_revenue = result;
            var data = {year:year,type:"hotels",action:"count"};
            getTop10Numbers(data,function(err,result){
                returnData.hotel_count = result;
                var data = {year:year,type:"hotels",action:"revenue"};
                getTop10Numbers(data,function(err,result){
                    returnData.hotel_revenue = result;
                    var data = {year:year,type:"flights",action:"count"};
                    getTop10Numbers(data,function(err,result){
                        returnData.flight_count = result;
                        var data = {year:year,type:"flights",action:"revenue"};
                        getTop10Numbers(data,function(err,result){
                            returnData.flight_revenue = result;
                            var data = {year:year,type:"city",action:"count"};
                            getTop10Numbers(data,function(err,result){
                                returnData.city_count = result;
                                var data = {year:year,type:"city",action:"revenue"};
                                getTop10Numbers(data,function(err,result){
                                    returnData.city_revenue = result;
                                   // clicksPerPage(function(err,result){
                                   //     returnData.clicks_per_page = result;
                                        // more calls to be added
                                        console.log("returnData for charts is :"+JSON.stringify(returnData));
                                        callback(false,returnData);
                                   // })
                                });

                            });

                        });

                    });

                });

            });

        });
    });

}

function getTop10Numbers(msg, callback) {
    var response = [];
    var responseData = {"title":[],"data":[]};
    var year = new Date().getFullYear();
    var action = "count";

    if(msg.year && msg.year!="" && msg.year!=0){
        year = msg.year;
    }
    if(msg.action && msg.action!=""){
        action = msg.action;
    }

    var column = year+'.'+action;
    var collectionName =
    mongo.connect(mongoURL, function () {
        var resultData = [];
        var coll;
        if(msg.type == "cars"){
            coll = mongo.collection('car_analytics');
        }else if(msg.type=="flights"){
            coll = mongo.collection('flight_analytics');
        }else if(msg.type=="hotels"){
            coll = mongo.collection('hotel_analytics');
        }else if(msg.type == "city"){
            coll = mongo.collection('city_analytics');
        }else{
            callback(true,responseData);
        }

        if(action=='count') {
            coll.find({'year': year}).sort({'count': -1}).limit(10).toArray(function (err, result) {
                if (!err) {
                    resultData = result;
                    var titles = [];
                    var data = [];
                    if(resultData!=[]){
                        var length = resultData.length;
                        while(length>0){
                            titles.push(resultData[--length].name);
                            data.push(resultData[length].count);
                        }
                    }
                    responseData = {"title":titles,"data":data};
                    callback(null,responseData);
                }
            });
        }else{
            coll.find({'year': year}).sort({'revenue': -1}).limit(10).toArray(function (err, result) {
                if (!err) {
                    resultData = result;
                    var titles = [];
                    var data = [];
                    if(resultData!=[]){
                        var length = resultData.length;
                        while(length>0){
                            titles.push(resultData[--length].name);
                            data.push(resultData[--length].count);
                        }
                    }
                    responseData = {"title":titles,"data":data};
                    callback(null,responseData);
                }
            });
        }
    });
};

var clicksPerPage = function(callback){
    var responseData = {"title":[],"data":[]};
    mongo.connect(mongoURL, function () {
        var coll = mongo.collection('userTracking');
        coll.findOne({},function (err, pages) {
            if (!err) {
                var length = pages.length;
                var titles = ["FLIGHT_PAGE","CAR_PAGE","HOTEL_PAGE","BILLING_FLIGHT","BILLING_CAR","BILLING_HOTEL","SEARCH_PAGE","SIGNIN_PAGE","SIGNUP_PAGE"];
                var data = [0,0,0,0,0,0,0,0,0,0];
                if(pages && pages.FLIGHT_PAGE){
                    data = [pages.FLIGHT_PAGE, pages.CAR_PAGE, pages.HOTEL_PAGE, pages.BILLING_FLIGHT, pages.BILLING_CAR, pages.BILLING_HOTEL, pages.SEARCH_PAGE, pages.SIGNIN_PAGE, pages.SIGNUP_PAGE];
                }
                responseData = {"title":titles,"data":data};
            }
            callback(null, responseData);
        });
    });
};

//exports.getTop10Numbers = getTop10Numbers;
exports.handle_Request = handle_Request;

// TOp 10 Hotel queries

//    var coll = mongo.collection('hotel_analytics');
//    coll.find({}).sort({'2017.count':-1}).limit(10).toArray(function(err, result)

// TOp 10 Car agency queries

//    var coll = mongo.collection('car_analytics');
//    coll.find({}).sort({'2017.count':-1}).limit(10).toArray(function(err, result)

// Note: These results are based on the number counts. If you want by revenue just chane 2017.count to 2017.revenue


// CLICKS PER PAGES QUERY

//     coll.find({}, function (err, searchuser) {
//         if (!err) {
//
//             callback(null, searchuser);
//         }
//         else {
//
//         }
//     });
//
// });

// Least seen page can be fetched from the above reasult itself!

// City wise revenue Query

// I have created one more collection from CITY called city_analytics

// below is the query for top 10 cities based on the revenue
//    var coll = mongo.collection('city_analytics');
//    coll.find({}).sort({'2017.count':-1}).limit(10).toArray(function(err, result)
