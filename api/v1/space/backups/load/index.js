let backup = require("dim-backup");
const express = require("express");

const router = express.Router();
let modal = require("../../../database/space");
let modalBackup = require("../../../database/Backup");
const modelRole = require("../../../models/spaceRole")
const modelUser = require("../../../models/spaceUser")
const modelUserWarn = require("../../../models/spaceUserWarn")
const {ChannelType} = require("discord.js")

module.exports = client => {
    router.post("/:id/load", async (req, res) => {
        try {
            const _check = {
                backupId: "string", 
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

            let dataBackupM = await modalBackup.findOne({
                CatagoryId: req.params.id
            })

            let fetchGuild = client.guilds.cache.get(dataModel.GuildId)

            await backup.loadSpace(dataBackupM.BackupData, fetchGuild, {
                maxMessagesPerChannel: 100
            }).then(async () => {

                let catagory1 = await fetchGuild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.id == data.CatagoryId) 

                catagory1.setName("[TEMPORARY]").then(async  () => {
                    let catagory2 = await fetchGuild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == data.spaceName) 

                    let findWelcomeName = catagory1.children.cache.find(channel => channel.id == data.WelcomeChannel).name;

                    console.log(findWelcomeName);

                        let welcomeName = catagory2.children.cache.find(channel => channel.name == findWelcomeName).id;

                        const dataBackup2 = await modalBackup.find({ CatagoryId: data.CatagoryId });	
                  
                 dataBackup2.forEach(async (db) => {
                       await modalBackup.findOneAndUpdate({ CatagoryId: data.CatagoryId }, { CatagoryId: catagory2.id });
                 });
                  
                        await modal.findOneAndUpdate({ CatagoryId: data.CatagoryId }, { CatagoryId: catagory2.id, WelcomeChannel: welcomeName  })	

                    await modelUser.findOneAndUpdate({ SpaceBanId: data.CatagoryId }, { SpaceBanId: catagory2.id })	

                    await modelUserWarn.findOneAndUpdate({ SpaceId: data.CatagoryId }, { SpaceId: catagory2.id })	

                    await modelRole.findOneAndUpdate({ CatagoryId: data.CatagoryId }, { CatagoryId: catagory2.id })	
                    
                        catagory1.children.cache.forEach(channel => channel.delete());

                        catagory1.delete();
                  
                  
                        catagory2.children.cache.find(channel => channel.name == findWelcomeName).send(`Backup ${db.BackupName} (${db.BackupId}) has been loaded. No worries, everything has been moved so that it's seemless. Hope thats all you need. [Loaded by the cloud]`)

                    return res.json({
                        success: true,
                        message: "Backup has been loaded inside guild."
                    })

                })
            })
    
        } catch {
            return res.json({
                success: false,
                message: "An error occured"
            })
        }
    })
}