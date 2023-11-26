let backup = require("dim-backup");
const express = require("express");
const router = express.Router();
let modal = require("../../../database/space");
let modalBackup = require("../../../database/Backup");
const modelRole = require("../../../database/spaceRole")
const modelUser = require("../../../database/spaceUser")
const modelUserWarn = require("../../../database/spaceUserWarn")
let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const {ChannelType} = require("discord.js")

module.exports = client => {
    router.post("/:id/backup/load", async (req, res) => {
        try {
            let backupId = req.body["data"].backupId;

            if(backupId == null){
                return res.json({success: false, message: "A proper id is required!"});
            }

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
                let dataModel = await modal.findOne({
                    CatagoryId: req.params.id
                })
    
                let dataBackupM = await modalBackup.findOne({
                    BackupId: backupId
                })

                if(dataBackupM == null) return res.json({success: false, message: "Backup was not found. Possibly deleted?"});
    
                let fetchGuild = client.guilds.cache.get(dataModel.GuildId);
    
                await backup.loadSpace(dataBackupM.BackupData, fetchGuild, {
                    maxMessagesPerChannel: 100
                }).then(async () => {
    
                    let catagory1 = await fetchGuild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.id == dataModel.CatagoryId) 
    
                    catagory1.setName("[TEMPORARY]").then(async  () => {
                        let catagory2 = await fetchGuild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == dataModel.spaceName) 
    
                        let findWelcomeName = catagory1.children.cache.find(channel => channel.id == dataModel.WelcomeChannel).name;
    
                        console.log(findWelcomeName);
    
                            let welcomeName = catagory2.children.cache.find(channel => channel.name == findWelcomeName).id;
    
                            const dataBackup2 = await modalBackup.find({ CatagoryId: dataModel.CatagoryId });	
                      
                     dataBackup2.forEach(async (db) => {
                           await modalBackup.findOneAndUpdate({ CatagoryId: dataModel.CatagoryId }, { CatagoryId: catagory2.id });
                     });
                      
                            await modal.findOneAndUpdate({ CatagoryId: dataModel.CatagoryId }, { CatagoryId: catagory2.id, WelcomeChannel: welcomeName  })	
    
                        await modelUser.findOneAndUpdate({ SpaceBanId: dataModel.CatagoryId }, { SpaceBanId: catagory2.id })	
    
                        await modelUserWarn.findOneAndUpdate({ SpaceId: dataModel.CatagoryId }, { SpaceId: catagory2.id })	
    
                        await modelRole.findOneAndUpdate({ CatagoryId: dataModel.CatagoryId }, { CatagoryId: catagory2.id })	
                        
                            catagory1.children.cache.forEach(channel => channel.delete());
    
                            catagory1.delete();
                      
                            catagory2.children.cache.find(channel => channel.name == findWelcomeName).send(`Backup ${dataBackupM.BackupName} (${dataBackupM.BackupId}) has been loaded. No worries, everything has been moved so that it's seemless. Hope thats all you need. [Loaded via dashboard]`)
    
                        return res.json({
                            success: true,
                            message: "Backup has been loaded inside guild."
                        })
    
                    })
                })
             } else {

               return res.json({
                    success: true,
                    message: "Unauthorized (for space)"
                })
            }
            
            
    
        } catch (e) {
            return res.json({
                success: false,
                message: "An error occured"+e
            })
        }
    })

    return router;
}