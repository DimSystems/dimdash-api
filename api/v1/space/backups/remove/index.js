let backup = require("dim-backup");
const express = require("express");
const router = express.Router();
let modal = require("../../../database/space");
let modelBackup = require("../../../database/Backup");
const modelRole = require("../../../database/spaceRole")
const modelUser = require("../../../database/spaceUser")
const modelUserWarn = require("../../../database/spaceUserWarn")
const {ChannelType} = require("discord.js")
let spaceModal = require("../../../database/space")
const users = require("../../../database/users.js");

module.exports = client => {
    router.post("/:id/backup/remove", async (req, res) => {
        try {

            let backupId = req.body["data"].backupId;
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
            
                await modelBackup.findOne({ BackupId: backupId }).deleteOne().exec();

                 res.json({
                    success: true,
                    message: "Backup removed."
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