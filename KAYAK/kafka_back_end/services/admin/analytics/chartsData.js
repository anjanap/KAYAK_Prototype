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
    if(msg.type=='usertracking'){
        getUserTrackingData(msg,callback);
    }else {
        var year = msg.year;
        var data = {year: year, type: "cars", action: "count"};
        var returnData = {};
        getTop10Numbers(data, function (err, result) {
            returnData.car_count = result;
            var data = {year: year, type: "cars", action: "revenue"};
            getTop10Numbers(data, function (err, result) {
                returnData.car_revenue = result;
                var data = {year: year, type: "hotels", action: "count"};
                getTop10Numbers(data, function (err, result) {
                    returnData.hotel_count = result;
                    var data = {year: year, type: "hotels", action: "revenue"};
                    getTop10Numbers(data, function (err, result) {
                        returnData.hotel_revenue = result;
                        var data = {year: year, type: "flights", action: "count"};
                        getTop10Numbers(data, function (err, result) {
                            returnData.flight_count = result;
                            var data = {year: year, type: "flights", action: "revenue"};
                            getTop10Numbers(data, function (err, result) {
                                returnData.flight_revenue = result;
                                var data = {year: year, type: "city", action: "count"};
                                getTop10Numbers(data, function (err, result) {
                                    returnData.city_count = result;
                                    var data = {year: year, type: "city", action: "revenue"};
                                    getTop10Numbers(data, function (err, result) {
                                        returnData.city_revenue = result;
                                        clicksPerPage(function (err, result) {
                                            returnData.clicks_per_page = result;
                                            leastSeenArea(function (err, result) {
                                                returnData.least_seen_area = result;
                                                // var data = {year:year,type:"city","userid":3,action:"revenue"};

                                                console.log("returnData for charts at line 73 is :" + JSON.stringify(returnData));
                                                callback(false, returnData);

                                            });
                                        });
                                    });

                                });

                            });

                        });

                    });

                });

            });
        });
    }
};

var getUserTrackingData = function(message,callback) {
    var data = 0;
    var type = 'userid';
    var bProceed = true;
    var returnData = {};
    if (msg.userid) {
        data = msg.userid;
    } else if (msg.city) {
        type = 'city';
        data = msg.city;
    } else {
        bProceed = false;
        console.log("returnData for charts at line 98 is :" + JSON.stringify(returnData));
        callback(false, returnData);
    }
    if (bProceed) {
        getUserTrackingInfo(type, data, function (err, result) {
            returnData.user_tracting = result;
            // more calls to be added
            console.log("returnData for charts at line 105 is :" + JSON.stringify(returnData));
            callback(false, returnData);
        })
    }
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
                                data.push(resultData[length].count);
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
        var coll = mongo.collection('UserTracking');
        coll.findOne({},function (err, pages) {
            if (!err) {
                //var length = pages;
                var titles = ["Flights","Cars","Hotels","Flight booking","Car booking","Hotel Booking","Search"];
                var data = [0,0,0,0,0,0,0,0];
                if(pages && pages.FLIGHT_PAGE){
                    data = [pages.FLIGHT_COUNT, pages.CAR_COUNT, pages.HOTEL_COUNT, pages.BILLING_FLIGHT_COUNT, pages.BILLING_CAR_COUNT, pages.BILLING_HOTEL_COUNT, pages.SEARCH_COUNT];
                }
                responseData = {"title":titles,"data":data};
            }
            callback(null, responseData);
        });
    });
};


var leastSeenArea = function(callback){
    var responseData = {"title":[],"data":[]};
    mongo.connect(mongoURL, function () {
        var coll = mongo.collection('UserTracking');
        coll.findOne({},function (err, pages) {
            if (!err) {
                //var length = pages.length;
                var titles = ["FLIGHT_PAGE","CAR_PAGE","HOTEL_PAGE","BILLING_FLIGHT","BILLING_CAR","BILLING_HOTEL","SEARCH_PAGE"];
                var data = [0,0,0,0,0,0,0,0];

                if(pages && pages.FLIGHT_PAGE){
                    data = [pages.FLIGHT_COUNT, pages.CAR_COUNT, pages.HOTEL_COUNT, pages.BILLING_FLIGHT_COUNT, pages.BILLING_CAR_COUNT, pages.BILLING_HOTEL_COUNT, pages.SEARCH_COUNT];
                }

                var min = data[0];
                var minIndex = 0;
                var temp = 0;
                var actualTitles= []
                var actualData = [];
                for(var i=0;i<4;i++){
                    for(var j=i;j<data.length;j++){
                        if(min>data[i]){
                            min = data[i];
                            minIndex = i;
                        }
                    }
                    temp = data[i];
                    data[i] = data[minIndex];
                    data[minIndex] = temp;
                    actualData.push(data[i]);

                    temp = titles[i];
                    titles[i] = titles[minIndex];
                    titles[minIndex] = temp;
                    actualTitles.push(titles[i]);
                }

                responseData = {"title":actualTitles,"data":actualData};
            }
            callback(null, responseData);
        });
    });
};


var getUserTrackingInfo = function(idtype,idtoCheck,callback){
    var responseData = {"title":[],"data":[]};
    var query = {};
    var userid = 0;
    if(idtype=='user'){
        userid = idtoCheck;
        query = {'userid': idtoCheck};
    }else if(idtype=='city'){
        userid = idtoCheck.length;
        query = {'city': idtoCheck};
    }
    mongo.connect(mongoURL, function () {
        var coll = mongo.collection('usertrackingcharts');
        coll.find(query).sort({'count': -1}).limit(5).toArray(function (err, pages) {
            if (!err) {
                // var length = pages.length;
                var titles = ["Search","Signin","Flights","Flight booking","Cars","Car booking","Hotels","Hotel Booking"];
                var data = [userid*111,userid*17,221*userid,89*userid,59*userid,userid*68,userid*39,userid*29,userid*37];
                //var data = [0,0,0,0,0,0,0,0,0];
                if(pages && pages[0]){
                    titles = [];
                    var length = pages.length;
                    var i = 0;
                    while(i<length){
                        titles.push(pages[i++].path);
                    }
                    //titles = pages.path;
                    getPercentageOfPages(titles,responseData,callback);
                    //data = [pages.FLIGHT_PAGE, pages.CAR_PAGE, pages.HOTEL_PAGE, pages.BILLING_FLIGHT, pages.BILLING_CAR, pages.BILLING_HOTEL, pages.SEARCH_PAGE, pages.SIGNIN_PAGE, pages.SIGNUP_PAGE];
                }else{
                    responseData = {"title":titles,"data":data};
                    callback(null, responseData);
                }
                // responseData = {"title":titles,"data":data};
            }
            // callback(null, responseData);
        });
    });
};

var getPercentageOfPages=function(pageArr,returnData,callback){

    /*mongo.connect(mongoURL, function () {
        var coll = mongo.collection('UserTracking');
        coll.aggregate([
            { "$match": { "user_id": userid } },
            {"$group" : {_id:"$previous_page", count:{$sum:1}}}
        ]).toArray(function (err, pages) {
            var data = [];
            var nLength =  pageArr.length;
            var i = 0;
            var pageCount = pages.length;
            while(i<nLength){
                var j=0;
                while(j<pageCount){
                    if(pages[j]._id == pageArr[i]){
                        data.push(pages[j].count);
                        break;
                    }
                    j++;
                }
                i++;
                if(data.length!=i){
                    userid = parseInt(userid);
                    data.push(userid*i*111+15*17);
                }
            }
            returnData={"title":pageArr,"data":data};
            callback(null,returnData);
        });
    });*/

    mongo.connect(mongoURL, function () {
        var coll = mongo.collection('UserTracking');
        coll.findOne({},function (err, pages) {

            //var nLength =  pageArr.length;
            //
            var total = pages.FLIGHT_COUNT + pages.BILLING_FLIGHT_COUNT + pages.CAR_COUNT + pages.BILLING_CAR_COUNT + pages.HOTEL_COUNT + pages.BILLING_HOTEL_COUNT + pages.SIGNUP_PAGE_COUNT + pages.SIGNIN_PAGE_COUNT + pages.SEARCH_COUNT;
            pages =
                [
                    {'_id': 'FLIGHT_PAGE', 'count': ((pages.FLIGHT_COUNT / total) * 100)},
                    {'_id': 'BILLING_FLIGHT', 'count': ((pages.BILLING_FLIGHT_COUNT / total) * 100)},
                    {'_id': 'CAR_PAGE', 'count': ((pages.CAR_COUNT / total) * 100)},
                    {'_id': 'BILLING_CAR', 'count': ((pages.BILLING_CAR_COUNT / total) * 100)},
                    {'_id': 'HOTEL_PAGE', 'count': ((pages.HOTEL_COUNT / total) * 100)},
                    {'_id': 'BILLING_HOTEL', 'count': ((pages.BILLING_HOTEL_COUNT / total) * 100)},
                    {'_id': 'SIGNUP_PAGE', 'count': ((pages.SIGNUP_PAGE_COUNT / total) * 100)},
                    {'_id': 'SIGNIN_PAGE', 'count': ((pages.SIGNIN_PAGE_COUNT / total) * 100)},
                    {'_id': 'SEARCH_PAGE', 'count': ((pages.SEARCH_COUNT / total) * 100)}
                ];
            var nLength = pageArr.length;
            var pageCount = pages.length;
            var k = 0;
            var dataArry = [];
            while (k < nLength) {
                var data = [];
                var singleArray = pageArr[k++];
                var arrLength = singleArray.length;
                var i = 0;
                while (i < arrLength){
                    var j = 0;
                    while (j < pageCount) {
                        if (pages[j]._id == singleArray[i]) {
                            data.push(pages[j].count);
                            break;
                        }
                        j++;
                    }
                    i++;
                    /*if (data.length != i) {
                        userid = parseInt(userid);
                        data.push(userid * i * 111 + 15 * 17);
                    }*/
                }
                dataArry.push(data);
        }
            returnData={"title":pageArr,"data":dataArry};
            callback(null,returnData);
        });
    });
}

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