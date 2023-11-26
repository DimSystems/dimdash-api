const express = require("express");
const router = express.Router();
let modal = require("../../../database/space");
let modalBackup = require("../../../database/Backup");
const {ChannelType} = require("discord.js")
let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
let async = require("async")

module.exports = client => {
    router.get("/:id/backup/list", async (req, res) => {
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
                let dataModel = await modal.findOne({
                    CatagoryId: req.params.id
                })
    
                let dataBackupM = await modalBackup.find({
                    CatagoryId: dataModel.CatagoryId
                })

                let backuPArray = []

                async.map(dataBackupM, async (b) => {
                   
                backuPArray.push(b);                    

                }).finally(() => {

                    res.json({
                        success: true,
                        message: "All backups",
                        data: {
                            backupData: backuPArray
                        }
                    })

                })
    
            
             } else {

               return res.json({
                    success: true,
                    message: "Unauthorized (for space)"
                })
            }
            
            
    
        } catch {
            return res.json({
                success: false,
                message: "An error occured"
            })
        }
    })

    router.post("/:id/backup/view", async (req, res) => {
        try {
            let findSpace = await spaceModal.findOne({
                CatagoryId: req.params["id"]
             })   

             let backupId = req.body["data"].backupId;
    
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

    
                let dataBackupM = await modalBackup.find({
                    BackupId: backupId
                })

                if(dataBackupM !== null){
                    res.json({
                        success: true,
                        message: "Backup found",
                        data: {
                            dataBackupM
                        }
                    })

                } else return res.json({
                    success: true,
                    message: "Backup is null"
                })
                
                 
            
    
            
             } else {

               return res.json({
                    success: true,
                    message: "Unauthorized (for space)"
                })
            }
            
            
    
        } catch {
            return res.json({
                success: false,
                message: "An error occured"
            })
        }
    })

    return router;
}