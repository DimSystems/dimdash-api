let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/api/autoresponse", async (req, res) => {
        try {

         let findSpace = await spaceModal.findOne({
            CatagoryId: req.params["id"]
         })   

         let findUser = await users.findOne({token: req.query['token'] });
        if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });   

         if(findSpace == null) return res.json({
            success: false,
            messsage: "space does not exist"
         })

         let findSpacePerms = await spaceRoleModal.findOne({
            CatagoryId: req.params["id"]
         })

         if(findSpace !== null && findSpacePerms == null) return res.json({
            success: 'CONFIGURE_ROLES',
            data: null
         })

         let checkPerms = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${findUser.user}`);

         if(checkPerms.roles.cache.has(findSpacePerms.OwnerId) || checkPerms.roles.cache.has(findSpacePerms.OwnerId).roles.cache.has(findSpacePerms.Adminid)){

            let userArray = [];

            await client.guilds.cache.get(findSpace.GuildId).roles.cache.get(findSpacePerms.MemberId).members.forEach((m) => {
                if(m.user.bot) return;

                userArray.push(m);
            });

            return res.json({
                success: true,
                meessage: "Autoresponse is ready.",
                data: {
                    AutoResponseData: userArray
                }
                
            })

         } else {
            return res.json({
                success: false,
                message: "Unauthorized",
                data: null
            })
         }
            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    
    
    return router;
}