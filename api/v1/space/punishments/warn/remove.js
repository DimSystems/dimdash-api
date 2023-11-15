let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUserWarn = require("../../../database/spaceUserWarn.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/warn/remove", async (req, res) => {

        try {
            let warnId = req.body["data"].warnId
            
    
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
             
                const guild = client.guilds.cache.get(interaction.guild.id);
				const member = await guild.members.fetch(userId);

                const dataUserFind = await modelUserWarn.findOne({
					GuildId: interaction.guild.id,
					SpaceId: data.CatagoryId,
					WarnId: warnId
				})

                if (member.roles.cache.has(dataRole.MemberId)) {


					if (!dataUserFind) {


						return interaction.reply({ content: `Warn not found!`, ephemeral: true });

					} else {

						let x = await modelUserWarn.findOneAndUpdate({ SpaceId: findSpace.CatagoryId, WarnId: dataUserFind.WarnId }, { isWarnActive: "false" })

						client.users.send(dataUserFind.UserId, `Your warn has been removed from ${findSpace.spaceName}!`);

						res.json({
                            success: true,
                            message: "Warn removed successfully"
                        })


					}
				} else {
					return 	res.json({
                        success: false,
                        message: "User is not in space."
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