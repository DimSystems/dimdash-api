module.exports = (router, path, users, passport, config, fetch, Discord, client) => {
    router.get(path + "/login", (req, res, next) => {
        if (req.query["extension"]) req.session._extension = req.query["extension"];
        if (req.query["__b"]) req.session._beta = req.query["__b"] === 'true' ? true : false;
        if (req.query["url"]) req.session._redir = req.query["url"];
        next();
    }, passport.authenticate("discord", {
        scope: config.auth.discord.scopes,
        prompt: config.auth.discord.prompt
    }));

    router.get(path + "/callback", (req, res, next) => {
        passport.authenticate("discord", {
            failureRedirect: path + "/login"
        }, (err, user) => {
            req.user = user;
            next();
        })(req, res, next);
    }, async (req, res) => {
        if (req.user) {

            const _userToken = await users.findOne({ user: req.user.id });
      
            let tokenGen = require("../../utils/tokenGen")
            const _token = `${await tokenGen(50)}`;

            if (!_userToken) {
                await users.updateOne({ user: req.user.id }, {
                    profile: req.user,
                    token: _token
                }, { upsert: true });
            } else {
                await users.updateOne({ user: req.user.id }, {
                    profile: req.user
                }, { upsert: true });
            };

            res.cookie("user_key", _userToken ? _userToken.token : _token, {
                maxAge: 365 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });

            //  res.redirect(
            //             (config.website.protocol + "://" + config.website.domain + config.website.callback) +
            //             ("?_code=" + (_userToken ? _userToken.token : _token)) +
            //             ("&url=" + (req.session["_redir"] || "/"))
            //         );

            res.redirect(
                ('http://192.168.1.91:575/' + config.website.callback) +
                             ("?_code=" + (_userToken ? _userToken.token : _token)) +
                            ("&url=" + (req.session["_redir"] || "/"))
            )



        } else {
            res.redirect(path + "/login");
        };
    });

    router.get(path + "/me", async (req, res) => {
        try {
            let _user = req.user;
            if(_user ==  null) return res.json({
                success: false,
                message: "You aren't logged in."
            })
            let _dbUser = req._user;
            let _guilds = _user.guilds || [];

            await _guilds.forEach((guild, index) => {
                const _perms = guild.permissions_new;
                const _checkBot = client.guilds.cache.get(guild.id);
                _guilds[index].bot_added = _checkBot ? true : false;
                _guilds[index].permissions = new Discord.Permissions(_perms).toArray();
            });

            delete _user.accessToken;
            _user.guilds = _guilds;

            res.json({
                success: true,
                message: "Worked successfully",
                data: _user
            });
        } catch (err) {
            console.log(err);
            res.json({ success: false, message: "Unexpected error occured while working.", data: null });
        };
    });

    return router;
};
