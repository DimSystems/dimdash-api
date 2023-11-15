let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUser = require("../../../database/spaceUser.js")
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id/punishments/ban/remove", async (req, res) => {

        try {
            let userId = req.body["data"].userId
            let reason = req.body["data"].reason || "Not specified.";
            
    
            if(userId == null) return res.json({
                success: false,
                message: "User Id is null"
            })
     
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
             
                const guild = client.guilds.cache.get(findSpace.GuildId);
				const member = await guild.members.fetch(userId).catch(async () => {
                    const dataUserFind = await modelUser.findOne({
                        GuildId: findSpace.GuildId,
                        UserId: userId,
                        SpaceBanId: findSpace.CatagoryId,
                        isBanned: true
                    })
    
    
    
                    if (!dataUserFind) {
    
                    res.json({
                        success: false,
                        message: "The user is no longer banned"
                    })
    
    
                    } else {
                        await modelUser.findOneAndUpdate({GuildId: findSpace.GuildId, UserId: userId, SpaceBanId: findSpace.CatagoryId }, { $unset: { banDuration: 1, banReason: 1, isBanned: 1} })
    
                        client.users.send(userId, `You have been unbanned from ${findSpace.spaceName} for ${reason}!`).catch(() => {
                            res.json({
                                success: true,
                                message: `${userId} has been unbanned but not notified.`
                            })
                        })
    
                        res.json({
                            success: true,
                            message: `${userId} has been unbanned.`
                        })
    
                    
                    }
                })

				const dataUserFind = await modelUser.findOne({
					GuildId: findSpace.GuildId,
					UserId: userId,
					SpaceBanId: findSpace.CatagoryId,
                    isBanned: true
				})



				if (!dataUserFind) {

				res.json({
                    success: false,
                    message: "The user is no longer banned"
                })


				} else {
					await modelUser.findOneAndUpdate({GuildId: findSpace.GuildId, UserId: userId, SpaceBanId: findSpace.CatagoryId }, { $unset: { banDuration: 1, banReason: 1, isBanned: 1} })

                    client.users.send(userId, `You have been unbanned from ${findSpace.spaceName} for ${reason}!`);

					res.json({
                        success: true,
                        message: `${member.user.username} has been unbanned.`
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