let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
let backup = require("dim-backup");
const express = require("express");
const router = express.Router();
let modal = require("../../../database/space");
let modalBackup = require("../../../database/Backup.js");

module.exports = client => {
    router.post("/:id/backup/create", async (req, res) => {
        try {
            let backupLabel = req.body["data"]?.backupLabel || "Unspecified Label.";

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
    
                let fetchGuild = client.guilds.cache.get(dataModel.GuildId)
    
                backup.createSpace(fetchGuild, req.params.id).then((bc) => {
        
                              let parsedBC = JSON.parse(bc);
                    
                              new modalBackup({
                                  GuildId: fetchGuild.id,
                                  CatagoryId: findSpace.CatagoryId,
                                  BackupName: backupLabel || "Unknown",
                                  BackupId: parsedBC.id,
                                  BackupData: bc
                      }).save();
    
                      res.json({
                        success: true,
                        message: "Backup has been created",
                        data: bc
                      });
                  })
    


             } else {

res.json({
    success: true,
    message: "Unauthorized (for space)"
})

             }
       
        } catch (e) {
            console.log(e);
            res.json({
                success: false,
                error: `${e}`
              });
        }
    })

    return router;
}