let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUserWarn = require("../../../database/spaceUserWarn.js")
const express = require("express");
const router = express.Router();
const async = require("async")

module.exports = client => {
    router.get("/:id/punishments/warn/listbyuser", async (req, res) => {

        try {
            let findSpace = await spaceModal.findOne({
                CatagoryId: req.params["id"]
             })   
    
             let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized (Not logged in)", data: null });   
    
             if(findSpace == null) return res.json({
                success: false,
                messsage: "space does not exist"
             })
    
             let findSpacePerms = await spaceRoleModal.findOne({
                CatagoryId: req.params["id"]
             })
    
             if(findSpacePerms == null) return res.json({
                success: 'CONFIGURE_ROLES',
                data: null
             })
    
             let checkPerms = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${findUser.user}`);
    
             if(checkPerms.roles.cache.has(findSpacePerms.OwnerId) || checkPerms.roles.cache.has(findSpacePerms.AdminId)){


                let findWarn = await modelUserWarn.find();
            
                const guild = client.guilds.cache.get(findSpace.GuildId);
				const member = await guild.members.fetch(findWarn.UserId);

                if(member.roles.cache.has(findSpacePerms.MemberId)) {

                    let warnArray = [];

                async.forEach(findWarn, async (wrn) => {
                    
                    let findUserP = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${wrn.UserId}`);

                    Object.assign(wrn, findUserP);

                    warnArray.push(wrn)

                }).finally(() => {
                
                return res.json({
                
                success: true,
                message: "Found all warns by user id",
                data: {
                    warnList: warnArray
                }
                
                })

                })


				} else {
                    return res.json({
                        success: false,
                        message: "User is not in the space."
                    })
				}


            
            } else {
                return res.json({
                    success: false,
                    message: "Unauthorized for space",
                    data: null
                })
            }
    
        } catch (e){

            res.json({
                error: e
            })

            console.log(e)

        }

        
        


    })

    return router;

}