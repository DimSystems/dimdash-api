let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const spaceUserModal = require("../../../database/spaceUser.js")
const express = require("express");
const router = express.Router();
const async = require("async")

module.exports = client => {
    router.get("/:id/punishments/ban/list", async (req, res) => {
        try {

            let findSpace = await spaceModal.findOne({
                CatagoryId: req.params["id"]
             })   
    
             let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized (Please login)", data: null });   
    
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
    
             let findSpaceBans = await spaceUserModal.find({
                SpaceBanId: req.params["id"],
                isBanned: "true"
             })

             let checkPerms = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${findUser.user}`);
    
             if(checkPerms.roles.cache.has(findSpacePerms.OwnerId) || checkPerms.roles.cache.has(findSpacePerms.AdminId)){

                let findBannedList = [];

                await async.forEach(findSpaceBans, async (b) => {

                    let findUserP = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${b.UserId}`).catch(() => {
                      if(b.UserId == null) return;

                        Object.assign(b, {
                            isInsideGuild: false
                          })
    
                    return findBannedList.push(b)
                    })

                

                    Object.assign(findUserP, {
                        banReason: b.banReason,
                        banDuration: b.banDuration,
                        isInsideGuild: true
                    })

                    findBannedList.push(findUserP)
                
                }).finally(() => {
                    return res.json({
                        success: true,
                        meessage: "Space Summary",
                        data: {
                            banList: findBannedList
                        }
                    })
                })


             } else {
                    return res.json({
                        success: false,
                        message: "Unauthorized for space",
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