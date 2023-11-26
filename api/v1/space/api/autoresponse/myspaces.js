let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
let spaceUserModal = require("../../../database/spaceUser")
const users = require("../../../database/users.js");
const express = require("express");
const router = express.Router();
let async = require("async")

module.exports = client => {
    router.get("/findmyspacelist", async (req, res) => {
        try {

         let findSpace = await spaceModal.find();

         let findUser = await users.findOne({token: req.query['token'] });
        if(!findUser) return res.json({ success: false, message: "Unauthorized (Please login)", data: null });   

         if(findSpace == null) return res.json({
            success: false,
            messsage: "User does not have a space"
         })

         let spaceArray = [];

         async.forEach(findSpace, async (sp) => {

            let findSpacePerms = await spaceRoleModal.findOne({
                CatagoryId: sp.CatagoryId
             })
    
             if(findSpace !== null && findSpacePerms == null) return;


             let checkUserPermms = await client.guilds.cache.get(sp.GuildId).members.fetch(`${findUser.user}`);


             if(checkUserPermms.roles.cache.has(findSpacePerms.OwnerId) || checkUserPermms.roles.cache.has(findSpacePerms.AdminId)){

                spaceArray.push(sp);

            } else {
                return;
             }

         }).finally(() => {
            
            res.json({
                success: true,
                message: "Approiate Spaces for user",
                data: {
                    Spaces: spaceArray
                }
            })

         })
            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    
    
    return router;
}