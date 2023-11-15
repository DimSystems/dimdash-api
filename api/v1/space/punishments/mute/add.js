let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUser = require("../../../database/spaceUser.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/mute/add", async (req, res) => {

        try {
            let userId = req.body["data"].userId
            let reason = req.body["data"].muteDateReason || "Not specified"
            let muteDate = req.body["data"].muteDate
            let muteDate2 = req.body["data"].muteDate2
            
    
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

				const catagory = client.channels.cache.get(findSpace.CatagoryId);

                const dataUserFind = await modelUser.findOne({
                    GuildId: findSpace.GuildId,
                    UserId: userId,
                    SpaceBanId: findSpace.CatagoryId,
                })

				catagory.permissionOverwrites.edit(userId, { SendMessages: false, SendMessagesInThreads: false, CreatePublicThreads: false, CreatePrivateThreads: false, Connect: false, AddReactions: false });

				if (muteDate) {

					


					if (!dataUserFind) {
						new modelUser({
							GuildId: findSpace.GuildId,
							UserId: userId,
							muteDuration: muteDate,
							SpaceBanId: findSpace.CatagoryId,
                            isMuted: true
						}).save()

                        client.users.send(userId, `Oh! Unlucky, You are now muted! You will be able to interact in ${findSpace.spaceName} <t:${muteDate2}:R>. Reason is ${reason}!`);

                        res.json({
                            success: true,
                            message: `${member.user.username} has been muted for some time.`
                        })

					} else {

                        client.users.send(userId, `Oh! Unlucky, your mute time has been editted and now you will be able to interact in ${findSpace.spaceName} <t:${muteDate2}:R>. Reason is ${reason}!`);

						let x = await modelUser.findOneAndUpdate({GuildId: findSpace.GuildId, UserId: userId, SpaceBanId: findSpace.CatagoryId }, { muteDuration: muteDate })

                        res.json({
                            success: true,
                            message: `${member.user.username} has been muted for some time. [EDITTED]`
                        })
					
					}
				}

				if (!muteDate) {

                    if(!dataUserFind){
                        new modelUser({
							GuildId: findSpace.GuildId,
							UserId: userId,
							SpaceBanId: findSpace.CatagoryId,
                            isMuted: true
						}).save()

                        client.users.send(userId, `Oh! Unlucky, You are now muted! You wont be able to interact in ${findSpace.spaceName} until an admin unmutes you. Reason is ${reason}!`);

                        res.json({
                            success: true,
                            message: `${member.user.username} has been muted permanantly`
                        })
                    } else {
                        client.users.send(userId, `Oh! Unlucky, your mute time has been editted and now You wont be able to interact in ${findSpace.spaceName} until an admin unmutes you. Reason is ${reason}!`);

						let x = await modelUser.findOneAndUpdate({GuildId: findSpace.GuildId, UserId: userId, SpaceBanId: findSpace.CatagoryId }, { isMuted: true, muteDuration: null })

                        res.json({
                            success: true,
                            message: `${member.user.username} has been muted for some time. [EDITTED]`
                        })
                    }
					
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