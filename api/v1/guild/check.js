const settings = require("../database/configureServer");
const tosCheck = require("../database/agreement")
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/check", async (req, res) => {
        try {
            let _guild = await client.guilds.fetch(req.params["id"]).catch(() => {});
            if (!_guild) return res.json({ success: false, message: "I am not in the server or the ID is invalid.", data: false });
            const _settings = await settings.findOne({ GuildId: _guild.id });
            const _tosCheck = await tosCheck.findOne({GuildId: _guild.id });
            res.json({ success: true, message: "Server found.", data: { ..._guild.toJSON(), settings: _settings, isAgreed: _tosCheck?.Agreement || false },  });
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: req.locale["global"]["something_went_wrong"], data: null });
        };
    });

    
    
    return router;
}