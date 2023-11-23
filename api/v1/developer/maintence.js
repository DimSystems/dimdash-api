const users = require("../database/users.js");
const express = require("express");
const router = express.Router();
const async = require("async");
const config = require("../../../config.js");
const devSet = require("../database/devSettings.js")


module.exports = client => {
    router.get("/dev/maintence/view", async (req, res) => {
        try {

            let findMaintence = await devSet.findOne({
                isMaintence: true
            })
            
            if(findMaintence == null) return res.json({
                success: true,
                state: false
            }) 

            res.json({
                success: true,
                state: true, 
                message: findMaintence.maintenceMsg,
                date: findMaintence.maintenceDate || null
            }) 

            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    router.post("/dev/maintence/enable", async (req, res) => {
        try {
            let mmsg = req.body["data"]?.mmsg;
            let mdate = req.body["data"]?.mdate;
            let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });   

        
       

            if(!config.developers.includes(findUser.user)) return res.json({ success: false, message: "Unauthorized for this types of commands.", data: null });   

            let findMaintence = await devSet.findOne();

            if(findMaintence.isMaintence !== false){
                return res.json({ success: false, message: "Already set." });   
            }
            
            if(findMaintence == null){

                if(mdate !== null){
                    new devSet({
                        maintenceMsg: mmsg || "Not Specified",
                        isMaintence: true,
                        maintenceDate: mdate
                     })   
                } else {
                    new devSet({
                        maintenceMsg: mmsg || "Not Specified",
                        isMaintence: true
                     }) 
                }
           

            } else {

                if(mdate !== null){
                    await devSet.findOneAndUpdate({ isMaintence: false }, { isMaintence: true, maintenceDate: mdate, maintenceMsg: mmsg || "Not Specified" });
                } else {
                    await devSet.findOneAndUpdate({ isMaintence: false }, { isMaintence: true, maintenceMsg: mmsg || "Not Specified" });
                }

            }

            res.json({
                success: true,
                state: await devSet.findOne().isMaintence
            }) 

            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    
    
    return router;
}