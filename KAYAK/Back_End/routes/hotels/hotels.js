var kafka = require('../kafka/client');

exports.getHotels= function(req,res) {

    console.log("Inside getHotels");
    console.log(req.body.City);
    console.log(req.body.Checkin);
    console.log(req.body.Checkout);
    console.log(req.body.Rooms);
    var checkin = req.body.Checkin;
    var checkout = req.body.Checkout;
    var rooms = req.body.Rooms;
    kafka.make_request('hotels_topic',
        {"action":"getHotels","city":req.body.City,"checkin":req.body.Checkin,"checkout":req.body.Checkout,"rooms":req.body.Rooms},
        function(err,results){
            console.log(results);
            
            if(results.code == 400)
            {
                console.log("Unable to fetch hotels");
                res.status(400).json({message:"Unable to fetch hotels"});
            }
            else if(results.code == 200){
                console.log("Hotels Fetched!");
                res.status(200).json({results,checkin,checkout,rooms});
            }
            else{
                console.log("ERROR");
                res.status(400).json({message:"Unable to fetch hotels"});
            }
    });

    console.log("Hotels : "+req.body);
};

exports.doBooking= function(req,res) {
    
        console.log("Inside doBooking");
        console.log(req.body.hotelItem.hotel_id);
        console.log(req.body.checkin);
        console.log(req.body.checkout);
        var checkin = req.body.checkin;
        var checkout = req.body.checkout;
        var roomtype = req.body.roomtype;
        var hotelid = req.body.hotelItem.hotel_id;
        var roomcount = req.body.roomcount;
        kafka.make_request('hotels_topic',
            {"action":"doBooking","checkin":checkin,"checkout":checkout,"hotelid":hotelid, "roomtype":roomtype, "roomcount":roomcount},
            function(err,results){
                console.log(results);
                
                if(results.code == 400)
                {
                    console.log("Unable to book hotel");
                    res.status(400).json({message:"Unable to book hotel"});
                }
                else if(results.code == 200){
                    console.log("Hotel Booked!");
                    res.status(200).json({message:"Hotel Booked"});
                }
                else{
                    console.log("ERROR");
                    res.status(400).json({message:"Error while booking hotel"});
                }
        });
    };