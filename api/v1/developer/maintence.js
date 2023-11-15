const users = require("../database/users.js");
const express = require("express");
const router = express.Router();
const async = require("async");
const config = require("../../../config.js");
const devSet = require("../database/devSettings.js")


module.exports = client => {
    router.get("/:id/summary", async (req, res) => {
        try {

            let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });   

            

            if(!config.developers.includes(findUser.userId)) return res.json({ success: false, message: "Unauthorized for this types of commands.", data: null });   

            let findMaintence = await devSet.findOne({
                isMaintence: true
            })
            
            if(findMaintence == null) return res.json({
                success: true,
                state: false
            }) 

            res.json({
                success: true,
                state: success
            }) 

            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    
    
    return router;
}