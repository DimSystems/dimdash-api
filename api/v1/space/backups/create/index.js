let backup = require("dim-backup");
const express = require("express");
const router = express.Router();
let modal = require("../../../database/space");
let modalBackup = require("../../../database/Backup");

module.exports = client => {
    router.post("/:id/create", async (req, res) => {
        try {

            const _check = {
                backupName: "string", 
            };

            const _types = await Promise.all([
                Object.keys(req.body).filter(_item => _check[_item]).map(_item => {
                    switch(_check[_item]) {
                        case "string":
                            return typeof req.body[_item] == "string";
                            break;
                        case "number":
                            return !isNaN(req.body[_item]);
                            break;
                        default:
                            return false;
                            break;
                    };
                })
            ]);

            if (_types[0].filter(_valid => _valid !== true).length > 0) {
                const _notValid = Object.keys(req.body).filter(_item => _check[_item])[_types[0].indexOf(false)];
                return res.json({
                    success: false, 
                    message: "'" + _notValid + "' is must be a " + _check[_notValid] + "!", 
                    data: null
                });
            };
    
            let dataModel = await modal.findOne({
                CatagoryId: req.params.id
            })

            let fetchGuild = client.guilds.cache.get(dataModel.GuildId)

            backup.createSpace(fetchGuild, req.params.id).then((bc) => {
    
                 let parsedBC = JSON.parse(bc);
                
                          new modalBackup({
                              GuildId: fetchGuild.id,
                              CatagoryId: data.CatagoryId,
                              BackupName: req.body["backupName"],
                              BackupId: parsedBC.id,
                              BackupData: bc
                  }).save();

                  res.json({
                    success: true,
                    message: "Backup has been created",
                    data: true
                  });
              })

        } catch {
            res.json({
                success: false,
              });
        }
    })
}