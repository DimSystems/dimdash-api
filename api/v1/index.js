// const users = require("../../database/models/users.js");
const config = require("../../config.js");
const express = require("express");
const http = require("http");
const app = express.Router();
require("moment-duration-format");

let users = require("./database/users.js")

module.exports = client => {

    // <API INFO> //
    app.get("/", (req, res) => {
        res.json({
            VersionNumber: 1,
            VersionDetails: "The first version of DIM API",
            FeaturesContained: {
                Guilds: {
                    Index: "INCLUDED",
                    Settings: "INCLUDED"
                },
                Spaces: {
                    Total: "STILL IN DEVELOPMENT",
                    Summary: "INCLUDED",
                    Punishments: {
                        Total: "ALL INCLUDED",
                        Warn: "INCLUDED",
                        Ban: "INCLUDED",
                        Mute: "INCLUDED",
                        Kick: "INCLUDED"
                    },
                    Backup: {
                        TOTAL: "INCLUDED",
                        Create: "INCLUDED",
                        Load: "INCLUDED",
                        View: "INCLUDED",
                        Remove: "INCLUDED"
                    },
                    Roles: {
                        TOTAL: "NOT INCLUDED",
                        Add: "NOT INCLUDED",
                        Remove: "NOT INCLUDED",
                        View: "NOT INCLUDED"
                    },
                    Settings: {
                        TOTAL: "NOT INCLUDED",
                        Edit: "NOT INCLUDED",
                        Delete: "NOT INCLUDED"
                    }
                }
            }
        });
    });
    // </API INFO> //


    

    // <USER COOKIE> //
    app.use(async (req, res, next) => {
        if (!req.path.includes("/connections")) return next();
        if (!req.cookies["user_key"] && !req.query["_token"]) return next();
        const _loadUser = await users.findOne({ token: req.cookies["user_key"] || req.query["_token"] });
        if (!_loadUser || !_loadUser.profile) return next();

        const _ware = await middleware(_loadUser, req.locale);
        if (_ware) return res.json({ success: false, message: _ware, data: null });

        req.user = _loadUser.profile;
        next();
    });
    // </USER COOKIE> //

      // <AUTHORIZATION> //
      app.use(async (req, res, next) => {
        // if (req.path.includes("/auth/login")) return next();
        // if (req.path.includes("/auth/callback")) return next();


        if (!req.query["_token"]) return next();
        const _loadUser = await users.findOne({ token: req.query["_token"] }, { _id: 0, __v: 0 });
        if (!_loadUser || !_loadUser.profile) return next();

        req.userAuth = _loadUser.profile;
        req._user = _loadUser;
        next();
    });
    // </AUTHORIZATION> //

    // // <AUTHORIZATION CHECK> //
    // app.use((req, res, next) => {
    //     if (req.path.includes("/auth/login")) return next();
    //     if (req.path.includes("/auth/callback")) return next();
    //     if (req.path.includes("/connections")) return next();
    //     if (req.path.includes("/invite")) return next();
    //     if (req.path.includes("/others/stats")) return next();
    //     if (req.path.includes("/others/team")) return next();
    //     if (req.path.includes("/others/partners")) return next();
    //     if (req.path.includes("/giveaway/search")) return next();
    //     if (req.path.endsWith("/overview") && req.path.includes("/giveaway")) return next();

    //     if (!req.userAuth) {
    //         return res.json({
    //             success: false,
    //             message: "You are not authorized or logged in.",
    //             data: null
    //         });
    //     } else {
    //         req._publicProfile = {
    //             id: req.userAuth.id,
    //             username: req.userAuth.username,
    //             avatar: req.userAuth.avatar,
    //             discriminator: req.userAuth.discriminator,
    //             flags: req.userAuth.flags
    //         };

    //         req.user = req.userAuth;
    //         next();
    //     };
    // });
    // // </AUTHORIZATION CHECK> //

    app.get("/__/guilds", async (req, res) => {
        try {
            let { min, max } = req.query;
            let guilds = [];
            if(!min) min = 0;
            if(!max) max = 10000000;
            client.guilds.cache.filter(a => a.memberCount > min && a.memberCount < max).map(a => guilds.push({
                id: a.id,
                name: a.name,
                icon: a.icon,
                members: a.memberCount
            }));
            return res.status(200).json({
                success: true,
                message: null,
                data: await guilds
            });
        } catch {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong...',
                data: null
            });
        }
    });

    // <CUSTOM ROUTES> //
    app.get("/invite/callback", (req, res) => {
        res.redirect(config.website.domain + config.website.invite);
    });

    app.get("/invite/_callback", (req, res) => {
        res.redirect("https://dash.dimbot.xyz/" + config.website.invite);
    });

    app.get("/invite/bot", (req, res) => {
        if (!req.query["__w"]) return res.redirect(config.auth.discord.botInvite + (req.query["__beta"] === "true" ? ("&redirect_uri=https://dash.dimbot.xyz/dashboard/added") : "&redirect_uri=https://dash.dimbot.xyz") + (req.query["disable_select"] ? ("&disable_guild_select=true") : "") + (req.query["id"] ? ("&guild_id=" + req.query["id"]) : ""));
        res.redirect(config.auth.discord.botInvite + (req.query["__beta"] === "true" ? "&redirect_uri=https://api-production.dimbot.xyz/invite/_callback" : "&redirect_uri=https://api-production.dimbot.xyz/invite/callback") + (req.query["disable_select"] ? ("&disable_guild_select=true") : "") + (req.query["id"] ? ("&guild_id=" + req.query["id"]) : ""));
    });

    const __devMaintence = require("./developer/maintence")(client);
    app.use("/", __devMaintence);

    // <GUILD CHECK> //
    const __guildCheck = require("./guild/check.js")(client);
    app.use("/guilds", __guildCheck);
    // </GUILD CHECK> //

      // <GUILD CHECK> //
      const __guildConfig = require("./guild/configuration.js")(client);
      app.use("/guilds", __guildConfig);
      // </GUILD CHECK> //
  

    const __userProfile = require("./user/id.js")(client);
    app.use("/user", __userProfile);


    /* Space EndPoints */

    const __spaceSummary = require("./space/index.js")(client);
    app.use("/spaces", __spaceSummary);

    const __spaceBanAdd = require("./space/punishments/ban/add.js")(client);
    app.use("/spaces", __spaceBanAdd);

    const __spaceBanRemove = require("./space/punishments/ban/remove.js")(client);
    app.use("/spaces", __spaceBanRemove);

    const __spaceBanList = require("./space/punishments/ban/list.js")(client);
    app.use("/spaces", __spaceBanList);

    const __spaceMuteAdd = require("./space/punishments/mute/add.js")(client);
    app.use("/spaces", __spaceMuteAdd);

    const __spaceMuteList = require("./space/punishments/mute/list.js")(client);
    app.use("/spaces", __spaceMuteList);

    const __spaceMuteRemove = require("./space/punishments/mute/remove.js")(client);
    app.use("/spaces", __spaceMuteRemove);

    const __spaceKickAdd = require("./space/punishments/kick/add.js")(client);
    app.use("/spaces", __spaceKickAdd);

    const __spaceWarnAdd = require("./space/punishments/warn/add.js")(client);
    app.use("/spaces", __spaceWarnAdd);

    const __spaceWarnRemove = require("./space/punishments/warn/remove.js")(client);
    app.use("/spaces", __spaceWarnRemove);

    const __spaceWarnEdit = require("./space/punishments/warn/edit.js")(client);
    app.use("/spaces", __spaceWarnEdit);

    const __spaceWarnListByUser = require("./space/punishments/warn/listbyuserid.js")(client);
    app.use("/spaces", __spaceWarnListByUser);

    const __spaceWarnListByWarn = require("./space/punishments/warn/listbywarnid.js")(client);
    app.use("/spaces", __spaceWarnListByWarn);

    const __spaceWarnList = require("./space/punishments/warn/list.js")(client);
    app.use("/spaces", __spaceWarnList);

    const __spaceBackupAdd = require("./space/backups/create/index.js")(client);
    app.use("/spaces", __spaceBackupAdd);

    const __spaceBackupRemove = require("./space/backups/remove/index.js")(client);
    app.use("/spaces", __spaceBackupRemove);

    const __spaceBackupList = require("./space/backups/view/index.js")(client);
    app.use("/spaces", __spaceBackupList);

    const __spaceBackupLoad = require("./space/backups/load/index.js")(client);
    app.use("/spaces", __spaceBackupLoad);

    /* Space APIS */

    const __spaceApiResponse = require("./space/api/autoresponse/index.js")(client);
    app.use("/spaces", __spaceApiResponse);

    const __spaceApiResponseBans = require("./space/api/autoresponse/ban.js")(client);
    app.use("/spaces", __spaceApiResponseBans);

    const __spaceApiResponseMutes = require("./space/api/autoresponse/mute.js")(client);
    app.use("/spaces", __spaceApiResponseMutes);

    const __spaceApiFindMySpace = require("./space/api/autoresponse/myspaces.js")(client);
    app.use("/spaces", __spaceApiFindMySpace);

    

     // <AUTH & CONNECTIONS> //
     const __auths = require("./auth/index.js")({ router: app, path: config.authPath, connectionsPath: config.connectionsPath, client });
     Object.keys(__auths).forEach(__auth => app.use(__auths[__auth]));
     // </AUTH & CONNECTIONS> //

     return app;
 
}