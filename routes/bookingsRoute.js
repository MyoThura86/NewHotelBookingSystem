// const express = require('express')
// const router = express.Router();
// const Booking = require("../models/booking")
// const Room = require("../models/room")
// const moment = require('moment');

// router.post("/bookroom", async(req, res)=>{
//     const {
//         room,
//         userid,  // Change this to match key from the frontend
//         fromdate,
//         todate,
//         totalamount,
//         totaldays,
//     } = req.body;

//     try{
//         const  newbooking= new Booking({
//             room: room.name,
//             roomid : room._id,
//             userid,
//             fromdate : (fromdate).format('DD-MM-YYYY'),
//             todate : (todate).format('DD-MM-YYYY'),
//             totalamount,
//             totaldays,
//             transcationId : '1234'
//         })
//         const booking =await newbooking.save()
//         const roomtemp = await Room.findOne({_id:room._id})

//         roomtemp.currentbookings.push({bookingid: booking._id, fromdate : moment(fromdate).format('DD-MM-YYYY'), todate : moment(fromdate).format('DD-MM-YYYY'), userid: userid,
//             status: booking.status
//         });

//         await roomtemp.save()

//         res.send("Room Booked successfully")
//     }
//     catch(error){
//         return res.status(400).json({error});


//     }
// })
// module.exports= router

//dr ka a sin pyay

const express = require('express');
const router = express.Router();
const Booking = require("../models/booking");
const Room = require("../models/room");
// const user = require("../models/user")
const moment = require('moment');
const stripe = require('stripe')('sk_test_51PsBLbGCjrxZWa3d5sVPx1dqJhSnxMV5N71Oono9J5KsBCpQQllYwYeRb81HGpdu2QnQlRLGKGrwnEZBYGl73AKD006WrNTP2k')
const { v4: uuidv4 } = require('uuid');

router.post("/bookroom", async (req, res) => {
    const {
        room,
        userid,  // Extracts userid from req.body
        fromdate,
        todate,
        totalamount,
        totaldays,
        token
    } = req.body;

    try {
        // Stripe payment process
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });
        const payment = await stripe.charges.create(
            {
                amount: totalamount * 100,
                customer: customer.id,
                currency: 'MMK',
                receipt_email: token.email
            },
            {
                idempotencyKey: uuidv4()
            }
        );

        if (payment) {
            // Proceed with booking if payment is successful
            const newbooking = new Booking({
                room: room.name,
                roomid: room._id,
                userid: userid,  // This is where userid is used
                fromdate: fromdate,
                todate: todate,
                totalamount,
                totaldays,
                transactionId: '1234',
            });

            const booking = await newbooking.save();

            const roomtemp = await Room.findOne({ _id: room._id });

            roomtemp.currentbookings.push({
                bookingid: booking._id,
                fromdate,
                todate,
                userid: userid,  // This is another instance of userid usage
                status: booking.status
            });

            await roomtemp.save();
            res.send('Booked Successfully!');
        } else {
            return res.status(400).json({ message: "Payment was not successful." });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post('/getbookingsbyuserid' ,async(req, res)=>{
    const userid=req.body.userid
    try{
        const booking =await Booking.find({userid:userid})
        res.send(booking)
    }catch(error){
        return res.status(400).json({error});
    }
});

router.post("/cancelbooking", async(req, res)=>{
    const{bookingid, roomid}=req.body

    try {
        
        const bookingitem = await Booking.findOne({_id: bookingid})
        bookingitem.status ='cancelled'
        await bookingitem.save()
        const room = await Room.findOne({_id:roomid})

        const bookings = room.currentbookings
        const temp = bookings.filter(booking => booking.bookingid.toString()!==bookingid)
        room.currentbookings = temp
        await room.save()

        res.send('Your booking cancelled successfully')

    } catch (error) {
        return res.status(400).json({error});
        
    }

});

router.get('/getallbookings', async(req,res)=>{
    try {
        const bookings = await Booking.find()
        res.send(bookings)
    } catch (error) {
        return res.status(400).json({error})
    }

}) ;

module.exports = router;
