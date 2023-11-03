// const users = require("../../database/models/users.js");
const config = require("../../config.js");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const moment = require("moment");
require("moment-duration-format");
const server = http.createServer(app);

module.exports = client => {

    // <SESSION & CORS> //
    app.use(
        session({
            secret: config.sessionKey,
            resave: false,
            saveUninitialized: false
        })
    );

    app.set("trust proxy", 1);
    app.use(cookieParser())
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors(
        {
            origin: "*"
        }
    ));

    app.use((req, res, next) => {
        res.setHeader('x-powered-by', 'Dim API');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    // </SESSION & CORS> //

    // <RATELIMIT> //
    let rlSettings = [10, 1000 * 60 * 60];
    let rateLimits = {};
    app.use("/v1/code/use", (req, res, next) => {
        const token = req.query["_token"];
        if (!token) return next();
        const [maxRequests, resetMs] = rlSettings;
        res.setHeader("x-award-ratelimit-limit", maxRequests);

        const rlResponse = () => {
            return res.json({
                success: false,
                message: "You are being rate limited. (" + Math.round((rateLimits[token].rate_limited - Date.now()) / 1000 / 60) + "mins)",
                data: {
                    resets_in: rateLimits[token].rate_limited - Date.now()
                }
            });
        };

        if (!rateLimits[token]) rateLimits[token] = {
            requests: [],
            rate_limited: false
        };

        if (rateLimits[token].rate_limited) {
            if (Date.now() < rateLimits[token].rate_limited) {
                res.setHeader("x-award-ratelimit-remaining", 0);
                res.setHeader("x-award-ratelimit-reset", rateLimits[token].rate_limited - Date.now());
                return rlResponse();
            } else {
                res.setHeader("x-award-ratelimit-remaining", maxRequests - 1);
                rateLimits[token].rate_limited = false;
            };
        };

        if (rateLimits[token].requests.filter(_r => (
            (Date.now() - _r) < resetMs
        )).length >= maxRequests) {
            rateLimits[token] = {
                requests: [],
                rate_limited: Date.now() + resetMs
            };

            res.setHeader("x-award-ratelimit-remaining", 0);
            res.setHeader("x-award-ratelimit-reset", resetMs);
            return rlResponse();
        } else {
            rateLimits[token].requests = [...rateLimits[token].requests, Date.now()];
            res.setHeader("x-award-ratelimit-remaining", maxRequests - rateLimits[token].requests.filter(_r => (Date.now() - _r) < resetMs).length);
            next();
        };
    });
    // </RATELIMIT> //

    // <API INFO> //
    app.get("/", (req, res) => {
        res.json({
            responseCode: 200,
            Version: 1,
        });
    });
    // </API INFO> //


    // <USER COOKIE> //
    app.use(async (req, res, next) => {
        if (!req.path.includes("/v1/connections")) return next();
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
        if (req.path.includes("/v1/auth/login")) return next();
        if (req.path.includes("/v1/auth/callback")) return next();

        if (!req.query["_token"]) return next();
        const _loadUser = await users.findOne({ token: req.query["_token"] }, { _id: 0, __v: 0 });
        if (!_loadUser || !_loadUser.profile) return next();

        const _ware = await middleware(_loadUser, req.locale);
        if (_ware) return res.json({ success: false, message: _ware, data: null });

        req.userAuth = _loadUser.profile;
        req._user = _loadUser;
        next();
    });
    // </AUTHORIZATION> //

    // // <AUTHORIZATION CHECK> //
    // app.use((req, res, next) => {
    //     if (req.path.includes("/v1/auth/login")) return next();
    //     if (req.path.includes("/v1/auth/callback")) return next();
    //     if (req.path.includes("/v1/connections")) return next();
    //     if (req.path.includes("/v1/invite")) return next();
    //     if (req.path.includes("/v1/others/stats")) return next();
    //     if (req.path.includes("/v1/others/team")) return next();
    //     if (req.path.includes("/v1/others/partners")) return next();
    //     if (req.path.includes("/v1/giveaway/search")) return next();
    //     if (req.path.endsWith("/overview") && req.path.includes("/v1/giveaway")) return next();

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
        if (!req._user || !(req._user.permissions || []).some(_p => _p == "**")) return res.status(404).end();
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



     // <AUTH & CONNECTIONS> //
     const __auths = require("./auth/index.js")({ router: app, path: config.authPath, connectionsPath: config.connectionsPath, client });
     Object.keys(__auths).forEach(__auth => app.use(__auths[__auth]));
     // </AUTH & CONNECTIONS> //
 

    app.use((req, res) => {
        try {
            res.json({
                success: false,
                message: "Page was not found...",
                data: null
            });
        } catch {};
    });
    // </404> //

    // <LISTEN SERVER> //
    server.listen(process.env.PORT || 575, () => {
        console.log("(!) Server listening at ::" + (process.env.PORT || 575) + " port!");
    });
    // </LISTE
}