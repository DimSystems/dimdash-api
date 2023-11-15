let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUserWarn = require("../../../database/spaceUserWarn.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/warn/add", async (req, res) => {

        try {
            let userId = req.body["data"].userId
            let reason = req.body["data"].warnReason || "Not specified"
            let warnDate = req.body["data"].warnDate
            let warnDate2 = req.body["data"].warnDate2
    
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

				function makeid(length) {
					let result = '';
					const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
					const charactersLength = characters.length;
					let counter = 0;
					while (counter < length) {
						result += characters.charAt(Math.floor(Math.random() * charactersLength));
						counter += 1;
					}
					return result;
				}

                if(member.roles.cache.has(findSpacePerms.MemberId)) {

					const warnid = makeid(8);

					if (warnDate) {

						new modelUserWarn({
							GuildId: findSpace.GuildId,
							WarnId: warnid,
							UserId: userId,
							isWarnActive: "true",
							WarnReason: reason,
							SpaceId: findSpace.CatagoryId,
							warnDuration: warnDate,

						}).save()

						client.users.send(userId, `You have been warned from ${findSpace.spaceName} for ${reason}! [${warnid}]. Luckily this warn will expire <t:${warnDate2}:R>`);

						
                        res.json({
                            success: true,
                            message: `Warning to ${member.user.username} has been added successfully [TEMPORARY]`,
                            id: warnid
                        })

					} else {
						new modelUserWarn({
							GuildId: findSpace.GuildId,
							WarnId: warnid,
							UserId: userId,
							isWarnActive: "true",
							WarnReason: reason,
							SpaceId: findSpace.CatagoryId

						}).save()


						client.users.send(userId, `You have been warned from ${findSpace.spaceName} for ${reason}! [${warnid}]`);

                        res.json({
                            success: true,
                            message: `Warning to ${member.user.username} has been added successfully [PERMANANTLY]`,
                            data: warnid
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