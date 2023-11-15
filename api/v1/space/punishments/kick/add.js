let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUser = require("../../../database/spaceUser.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/kick/add", async (req, res) => {

        try {
            let userId = req.body["data"].userId
            let reason = req.body["data"].kickReason || "Not specified"
    
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
				const member = await guild.members.fetch(userId);

				if (member.roles.cache.has(findSpacePerms.MemberId)) {
					member.roles.remove(findSpacePerms.MemberId);

                    client.users.send(userId, `You have been kicked from ${findSpace.spaceName} for ${reason}!`);

                    res.json({
                        success: true,
                        message: `${member.user.username} has been kicked and should be notified!`
                    })
			
				} else {
					return  res.json({
                        success: false,
                        message: `${member.user.username} isn't in your space.`
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