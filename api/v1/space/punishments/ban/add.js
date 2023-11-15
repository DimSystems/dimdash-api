let spaceModal = require("../../../database/space")
let spaceRoleModal = require("../../../database/spaceRole")
const users = require("../../../database/users.js");
const modelUser = require("../../../database/spaceUser.js")
const express = require("express");
const router = express.Router();
const { ChannelType } = require("discord.js");

module.exports = client => {
    router.post("/:id/punishments/ban/add", async (req, res) => {

        try {
            let userId = req.body["data"].userId
            let reason = req.body["data"].banReason || "Not specified"
            let banDate = req.body["data"].banDate
            let banDate2 = req.body["data"].banDate2
            let CM = req.body["data"].clearMessages || "1"
    
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
             
                if(NaN==Number(CM)){if("ALL"===CM){const{limit:e}=-1;client.channels.cache.find((e=>e.type==ChannelType.GuildCategory&&e.name==findSpace.spaceName)).children.cache.forEach((async e=>{const t=setInterval((async()=>{const t={limit:100,filter:e=>e.author.id===userId};await e.messages.fetch(t).then((t=>{e.bulkDelete(t,!0)}))}),500);setInterval((async()=>{const a={limit:100,filter:e=>e.author.id===userId};await e.messages.fetch(a).then((e=>{null!=e&&e.length||clearInterval(t)}))}),500)}))}}else{const{limit:e}=CM;client.channels.cache.find((e=>e.type==ChannelType.GuildCategory&&e.name==findSpace.spaceName)).children.cache.forEach((async t=>{if(-1==e){const e=setInterval((async()=>{const e={limit:100,filter:e=>e.author.id===userId};await t.messages.fetch(e).then((e=>{t.bulkDelete(e,!0)}))}),500);setInterval((async()=>{const a={limit:100,filter:e=>e.author.id===userId};await t.messages.fetch(a).then((t=>{null!=t&&t.length||clearInterval(e)}))}),500)}else{const e={limit:CM,filter:e=>e.author.id===userId};await t.messages.fetch(e).then((e=>{t.bulkDelete(e,!0)}))}}))};
    
                const guild = client.guilds.cache.get(findSpace.GuildId); 
            const member = await guild.members.fetch(userId);
    
            if(member.roles.cache.has(findSpacePerms.MemberId)){
                member.roles.remove(findSpacePerms.MemberId); 
            
                const dataUserFind = await modelUser.findOne({
                    UserId: userId,
                    SpaceBanId: findSpace.CatagoryId,
                })
    
              
    if(dataUserFind && !dataUserFind.isBanned && !dataUserFind.BanReason){
        if(banDate) {
            
                         let x = await modelUser.findOneAndUpdate({ UserId: userId, SpaceBanId: findSpace.CatagoryId }, { isBanned: "true", banReason: reason, banDuration: banDate })
    
                         client.users.send(userId, `You have been banned from ${findSpace.spaceName} for ${reason}! Luckily this ban will expire <t:${banDate2}:R>`);
    
                    res.json({
                        success: true,
                        message: "Ban went through",
                        banDetails: `${member.user.username} has been banned for a specific set of time and should be notified! Note: If you have you choosen to clear messages, due to API Limits, all of the banned users messages must be send under 14 days. You can delete those messages manually though`
                    })
        } else {
            let x = await modelUser.findOneAndUpdate({ UserId: userId, SpaceBanId: findSpace.CatagoryId }, { isBanned: "true", banReason: reason })
    
    
            client.users.send(userId, `You have been banned from ${findSpace.spaceName} for ${reason}! It is permanant and it will stay that way unless you get really really lucky...`);
    
            res.json({
                success: true,
                message: "Ban went through",
                banDetails: `${member.user.username} has been banned and should be notified! Note: If you have you choosen to clear messages, due to API Limits, all of the banned users messages must be send under 14 days. You can delete those messages manually though`
            })
    
        }
    } else if(!dataUserFind){
    
        if(banDate){
    
            new modelUser({
                GuildId: findSpace.GuildId,
                UserId: userId,
             isBanned: "true",
             banReason: reason,
             SpaceBanId: findSpace.CatagoryId,
             banDuration: banDate
         }).save()
        
                 client.users.send(userId, `You have been banned from ${findSpace.spaceName} for ${reason}! Luckily this ban will expire <t:${banDate2}:R>`);
        
        res.json({
            success: true,
            message: `${member.user.username} has been banned for some time and should be notified!.`
        })
    
        } else {
          
            new modelUser({
                GuildId: findSpace.GuildId,
                UserId: userId,
             isBanned: "true",
             banReason: reason,
             SpaceBanId: findSpace.CatagoryId,
         }).save()
        
                 client.users.send(userId, `You have been permanantly banned from ${findSpace.spaceName} for ${reason}!`);
        
        res.json({
            success: true,
            message: `${member.user.username} has been banned permanantly and should be notified!.`
        })
    
        }
    
       
    
    } else if(dataUserFind && dataUserFind.isBanned && dataUserFind.BanReason){
        if(banDate){
            let x = await modelUser.findOneAndUpdate({ UserId: userId, SpaceBanId: findSpace.CatagoryId }, { isBanned: "true", banReason: reason, banDuration: banDate })
    
            client.users.send(userId, `Your ban has been editted from ${findSpace.spaceName}. Heres whats been editted \n Reason: Reason: ${reason} \n Expiration date: <t:${banDate2}:R>.`);
    
            res.json({
                success: true,
                message: `${member.user.username}'s banishment has been editted and should be notified!`
            })
    
        } else {
    
            let x = await modelUser.findOneAndUpdate({ UserId: userId, SpaceBanId: findSpace.CatagoryId }, { isBanned: "true", banReason: reason })
    
            client.users.send(userId, `Your ban has been editted from ${findSpace.spaceName}. Heres whats been editted \n Reason: Reason: ${reason}`);
    
            res.json({
                success: true,
                message: `${member.user.username}'s banishment has been editted and should be notified!`
            })
    
    
        }
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