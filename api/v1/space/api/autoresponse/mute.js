let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
let spaceUserModal = require("../../../database/spaceUser")
const users = require("../../../database/users.js");
const express = require("express");
const router = express.Router();
let async = require("async");
const { PermissionsBitField } = require("discord.js");

module.exports = client => {
    router.get("/:id/api/autoresponse/mute", async (req, res) => {
        try {

         let findSpace = await spaceModal.findOne({
            CatagoryId: req.params["id"]
         })   

         let findUser = await users.findOne({token: req.query['token'] });
        if(!findUser) return res.json({ success: false, message: "Unauthorized (Please login)", data: null });   

         if(findSpace == null) return res.json({
            success: false,
            messsage: "space does not exist"
         })

         let findSpacePerms = await spaceRoleModal.findOne({
            CatagoryId: req.params["id"]
         })

         if(findSpace !== null && findSpacePerms == null) return res.json({
            success: 'CONFIGURE_ROLES',
            data: null
         })

         let findSpaceBans = await spaceUserModal.find({
            SpaceBanId: req.params["id"],
            isBanned: "true"
         })

         let checkPerms = await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${findUser.user}`);

         if(checkPerms.roles.cache.has(findSpacePerms.OwnerId) || checkPerms.roles.cache.has(findSpacePerms.OwnerId).roles.cache.has(findSpacePerms.Adminid)){

            const catagory = client.channels.cache.get(findSpace.CatagoryId);

            await client.guilds.cache.get(findSpace.GuildId).members.fetch();

            
            let findBan = await spaceUserModal.find({
               SpaceBanId: findSpace.CatagoryId
            })

            let findMembers = client.guilds.cache.get(findSpace.GuildId).roles.cache.get(findSpacePerms.MemberId).members.map(m => m);

            let autoData = [];

           await async.forEach(findMembers, async (m) => {



         let findStaff =  await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${m.user.id}`);

        if(findStaff.permissionsIn(findSpace.CatagoryId).has(PermissionsBitField.Flags.SendMessages) == false) autoData.push(findStaff);
        return;

           }).finally(() => {
            return res.json({
               success: true,
               meessage: "Space AutoResponse - Mute",
               data: {
                MuteAutoResponse: autoData
               }
           })
           })

            

         } else {
            return res.json({
                success: false,
                message: "Unauthorized (For space)",
                data: null
            })
         }
            

        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "error occured"+err, data: null });
        };
    });

    
    
    return router;
}