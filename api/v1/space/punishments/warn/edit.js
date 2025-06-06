let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUserWarn = require("../../../database/spaceUserWarn.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/warn/edit", async (req, res) => {

        try {
            let warnId = req.body["data"].warnId;
            let reason = req.body["data"].warnReason || "Not specified"
            let warnDate = req.body["data"].warnDate
            let warnDate2 = req.body["data"].warnDate2
    
            if(warnId == null) return res.json({
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


                let findWarn = await modelUserWarn.findOne({
                    WarnId: warnId
                })
             
                const guild = client.guilds.cache.get(findSpace.GuildId);
				const member = await guild.members.fetch(findWarn.UserId);

                if(member.roles.cache.has(findSpacePerms.MemberId)) {


                    if(findWarn == null) return res.json({
                        success: false,
                        message: "Warning does not exist anymore."
                    })

					if (warnDate) {

                       await modelUserWarn.findOneAndUpdate({ WarnId: warnId, SpaceId: findSpace.CatagoryId }, { WarnReason: reason, warnDuration: warnDate })

						client.users.send(userId, `Your warn from ${findSpace.spaceName} [${warnId}] has been editted. Both the date and reason have been updated [${reason}] <t:${warnDate2}:R>`);

                        res.json({
                            success: true,
                            message: `Warning to ${member.user.username} has been editted successfully [TEMPORARY]`,
                            id: warnId
                        })

					} else {
                        await modelUserWarn.findOneAndUpdate({ WarnId: warnId, SpaceId: findSpace.CatagoryId }, { WarnReason: reason })

						client.users.send(userId, `Your warn from ${findSpace.spaceName} [${warnId}] has been editted.The reason have been updated [${reason}]`);

                        res.json({
                            success: true,
                            message: `Warning to ${member.user.username} has been added successfully [PERMANANTLY]`,
                            data: warnId
                        })
					}

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