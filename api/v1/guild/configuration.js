const modelConfig = require("../database/configureServer.js");
const modelAgree = require("../database/agreement.js");
const users = require("../database/users.js");
const config = require("../../../config.js");
const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.post("/:id/settings", async (req, res) => {
        try {
            let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });     
            const guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!guild) return res.json({ success: false, message: "Bot isn't in guild", data: null });
            const member = await guild.members.fetch(findUser.profile.id).catch(() => {});
            if (!member) return res.json({ success: false, message: "Not in guild", data: null });
            if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.json({ success: false, message: "No permission", data: null });

          

		let checkConfig = await modelConfig.findOne({ GuildId: guild.id });

        
            let reportGlobalCH = req.body["data"].reportGlobalCH;
            let reportSpaceCH = req.body["data"].reportSpaceCH
            let appRecieveCH = req.body["data"].appRecieveCH
            let appCH = req.body["data"].appCH
            let spaceAdCH = req.body["data"].spaceAdCH
            let HostCH = req.body["data"].HostCH
            let reportGlobalRL = req.body["data"].reportGlobalRL
            let reportSpaceRL = req.body["data"].reportSpaceRL

            if(guild.channels.cache.get(reportGlobalCH) == null || guild.channels.cache.get(reportSpaceCH) == null || guild.channels.cache.get(appRecieveCH) == null || guild.channels.cache.get(appCH) == null || guild.channels.cache.get(spaceAdCH) == null || guild.channels.cache.get(HostCH) == null || guild.roles.cache.get(reportSpaceRL) == null || guild.roles.cache.get(reportGlobalRL) == null) return res.json({ success: false, message: "Invalid", data: null });

            if(checkConfig == null){

                new modelConfig({
                    GuildId: guild.id,
                 reportGlobalCH: reportGlobalCH,
                 reportSpaceCH: reportSpaceCH,
                 spaceAdCH: spaceAdCH,
                 appRecieveCH: appRecieveCH,
                 appCH: appCH,
                 HostCH: HostCH,
                 reportGlobalRL: reportGlobalRL,
                 reportSpaceRL: reportSpaceRL
             }).save()

             let ch0 = guild.channels.cache.get(HostCH);

             let thread1 = await ch0.threads.create({
                name: 'Space Creation',
                autoArchiveDuration: 60,
                reason: 'Creating Spaces inside Guild',
            });
    
            let thread2 = await ch0.threads.create({
                name: 'Space removal',
                autoArchiveDuration: 60,
                reason: 'Removing Spaces inside Guild',
            });
            
            await modelConfig.findOneAndUpdate({ GuildId: guild.id }, { HostCH: HostCH, HostCHTH1: thread1.id, HostCHTH2: thread2.id });
    
            let threadChannel1 = client.channels.cache.get(thread1.id);
            let threadChannel2 = client.channels.cache.get(thread2.id);
    
                threadChannel1.send({ embeds: [
                                        new EmbedBuilder()
                                        .setTitle("Create a space/Edit a space")
                                         .setDescription("Edit or create a space using the creation process.")
    
                                        .setColor("Random")
    
                                    ] , components: [new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                    .setCustomId('create')
                                    .setLabel('Create!')
                                    .setStyle(ButtonStyle.Primary)
    
                                        )
                                    ]
                                })
    
                threadChannel2.send({ embeds: [
                                        new EmbedBuilder()
                                        .setTitle("Delete a space")
                                         .setDescription("This is a very dangerous move! Do the procedure if its necesscary!")
                                        .setColor("Random")
    
                                    ] , components: [new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                    .setCustomId('delete')
                                    .setLabel('Yes, delete!')
                                    .setStyle(ButtonStyle.Danger)
    
                                        )
                                    ]
                                })

                                const channel = client.channels.cache.get(appCH);

		channel.send({
				 embeds: [
					new EmbedBuilder()
					.setTitle("Apply to create a space")
					 .setDescription("You will be given a model of what you need to get started!")
					.setColor("Random")

				] , components: [new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
				.setCustomId('createApplication')
				.setLabel('Start!')
				.setStyle(ButtonStyle.Primary)

					)
				]
			}).then(async (msg) => {
			await modelConfig.findOneAndUpdate({ GuildId: guild.id }, { appCHID: msg.id });
			})

            return res.json({ success: true, message: "Settings configured for first time." });           


            }   else {
                let ch0_old = await client.channels.cache.get(checkConfig.HostCH)
			const thread1_old = ch0_old.threads.cache.find(x => x.id === checkConfig.HostCHTH1);
			if(thread1_old !== null ) thread1_old.delete()
			const thread2_old = ch0_old.threads.cache.find(x => x.id === checkConfig.HostCHTH2);
			if(thread2_old !== null) thread2_old.delete()
			let ch1_old = await client.channels.cache.get(checkConfig.appCH);
			ch1_old.messages.fetch(checkConfig.appCHID).then(msg =>  msg.delete());


                await modelConfig.findOneAndUpdate({ GuildId: guild.id }, {
                 reportGlobalCH: reportGlobalCH,
                 reportSpaceCH: reportSpaceCH,
                 spaceAdCH: spaceAdCH,
                 appRecieveCH: appRecieveCH,
                 appCH: appCH,
                 HostCH: HostCH,
                 reportGlobalRL: reportGlobalRL,
                 reportSpaceRL: reportSpaceRL
             })


             let ch0 = guild.channels.cache.get(HostCH);

             let thread1 = await ch0.threads.create({
                name: 'Space Creation',
                autoArchiveDuration: 60,
                reason: 'Creating Spaces inside Guild',
            });
    
            let thread2 = await ch0.threads.create({
                name: 'Space removal',
                autoArchiveDuration: 60,
                reason: 'Removing Spaces inside Guild',
            });
            
            await modelConfig.findOneAndUpdate({ GuildId: guild.id }, { HostCH: HostCH, HostCHTH1: thread1.id, HostCHTH2: thread2.id });
    
            let threadChannel1 = client.channels.cache.get(thread1.id);
            let threadChannel2 = client.channels.cache.get(thread2.id);
    
                threadChannel1.send({ embeds: [
                                        new EmbedBuilder()
                                        .setTitle("Create a space/Edit a space")
                                         .setDescription("Edit or create a space using the creation process.")
    
                                        .setColor("Random")
    
                                    ] , components: [new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                    .setCustomId('create')
                                    .setLabel('Create!')
                                    .setStyle(ButtonStyle.Primary)
    
                                        )
                                    ]
                                })
    
                threadChannel2.send({ embeds: [
                                        new EmbedBuilder()
                                        .setTitle("Delete a space")
                                         .setDescription("This is a very dangerous move! Do the procedure if its necesscary!")
                                        .setColor("Random")
    
                                    ] , components: [new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                    .setCustomId('delete')
                                    .setLabel('Yes, delete!')
                                    .setStyle(ButtonStyle.Danger)
    
                                        )
                                    ]
                                })

                                const channel = client.channels.cache.get(appCH);

		channel.send({
				 embeds: [
					new EmbedBuilder()
					.setTitle("Apply to create a space")
					 .setDescription("You will be given a model of what you need to get started!")
					.setColor("Random")

				] , components: [new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
				.setCustomId('createApplication')
				.setLabel('Start!')
				.setStyle(ButtonStyle.Primary)

					)
				]
			}).then(async (msg) => {
			await modelConfig.findOneAndUpdate({ GuildId: guild.id }, { appCHID: msg.id });
			})

            return res.json({ success: true, message: "Settings configured (Updated)" });  

            }
          
            

    } catch (e){

        return res.json({ success: false, message: "Error: "+e, data: null });

    }
    })

    router.post("/:id/agree", async (req, res) => {
        try {
            let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });     
            const guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!guild) return res.json({ success: false, message: "Bot isn't in guild", data: null });
            const member = await guild.members.fetch(findUser.profile.id).catch(() => {});
            if (!member) return res.json({ success: false, message: "Not in guild", data: null });
            if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.json({ success: false, message: "No permission", data: null });

          
            let checkAgree = await modelAgree.findOne({
                GuildId: guild.id
            })
		
            if(checkAgree == null){
                new modelAgree({
                    GuildId: guild.id,
                    Agreement: true
                }).save()

                return res.json({ success: true, message: "Agreed!" });
            } else {
                await modelConfig.findOneAndUpdate({ GuildId: guild.id }, {  Agreement: true });
                return res.json({ success: true, message: "Agreed!" });
            }
            

    } catch (e){

        return res.json({ success: false, message: "Error: "+e, data: null });

    }
    })

    router.post("/:id/reset", async (req, res) => {
        try {
            let findUser = await users.findOne({token: req.query['token'] });
            if(!findUser) return res.json({ success: false, message: "Unauthorized", data: null });     
            const guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!guild) return res.json({ success: false, message: "Bot isn't in guild", data: null });
            const member = await guild.members.fetch(findUser.profile.id).catch(() => {});
            if (!member) return res.json({ success: false, message: "Not in guild", data: null });
            if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return res.json({ success: false, message: "No permission", data: null });

          
            let checkConfig = await modelConfig.findOne({ GuildId: guild.id });

            if(checkConfig){
                let ch0 = await client.channels.cache.get(checkConfig.HostCH)
                const thread1 = ch0.threads.cache.find(x => x.id === checkConfig.HostCHTH1);
                if(thread1 !== null ) thread1.delete()
                const thread2 = ch0.threads.cache.find(x => x.id === checkConfig.HostCHTH2);
                if(thread2 !== null) thread2.delete()
                let ch1 = await client.channels.cache.get(checkConfig.appCH);
              ch1.messages.fetch(checkConfig.appCHID).then((msg) => {
                    if(msg == null) return;
                    msg.delete()
                 })

                await modelConfig.findOne({ GuildId: guild.id }).deleteOne().exec();

                res.json({
                    success: true,
                    message: "Reset complete"
                })
            } else {
                res.json({
                    success: false,
                    message: "Reset already complete"
                })
            }
            

    } catch (e){

        return res.json({ success: false, message: "Error: "+e, data: null });

    }
    })
    
    return router;
}