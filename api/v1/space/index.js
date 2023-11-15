let spaceModal = require("../database/space")
let spaceRoleModal = require("../database/spaceRole")
const users = require("../database/users.js");
const findBanned = require("../database/spaceUser.js")
const express = require("express");
const router = express.Router();
const async = require("async")

module.exports = client => {
    router.get("/:id/summary", async (req, res) => {
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

            let autoData = [];

            await client.guilds.cache.get(findSpace.GuildId).members.fetch();

            
            let findBan = await findBanned.find({
                
               SpaceBanId: findSpace.CatagoryId
            })

            let findMembers = client.guilds.cache.get(findSpace.GuildId).roles.cache.get(findSpacePerms.MemberId).members.map(m => m);

           await async.forEach(findMembers, async (m) => {
           
            let isBanBool = false;

            let isStaff = false;

            let isMuted = false;

         let findStaff =  await client.guilds.cache.get(findSpace.GuildId).members.fetch(`${m.user.id}`);

            if(findStaff.roles.cache.has(findSpacePerms.OwnerId) || findStaff.roles.cache.has(findSpacePerms.AdminId)){
             isStaff = true
            }

            const dataUserFind = await findBanned.findOne({
               GuildId: findSpace.GuildId,
               UserId: m.user.id,
               SpaceBanId: findSpace.CatagoryId,
               isMuted: true
            })

               
            findBan.forEach((ban) => {
             if(ban.UserId == m.userId && ban.isBanned == true){
                isBanBool = true
             } 
          })

          if(dataUserFind !== null){
            isMuted = true
          }

            Object.assign(m, {isBanned: isBanBool, isStaff: isStaff, isMuted: isMuted});

             autoData.push(m);

           }).finally(() => {
            return res.json({
               success: true,
               meessage: "Space Summary",
               data: {
                spaceData: findSpace,
                spacePerms: findSpacePerms,
                AutoResponseData: autoData
               }
           })
           })

         } else {
            return res.json({
                success: false,
                message: "Unauthorized for space",
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