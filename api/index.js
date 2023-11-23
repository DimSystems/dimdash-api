const config = require("../config.js");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
var https = require('https');
const fs = require("fs")

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
            LatestVersion: 1,
            VersionList: [
                1
            ],
            Info: "To check whats new in each version, just write /v and the version number to check it out."
        });
    });
    // </API INFO> //

    // GET VERSIONS
    const __Version1 = require("./v1/index")(client);
    app.use("/v1", __Version1);

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

      
  let path = require("path")
  
  var options = {
	key: fs.readFileSync(path.join(__dirname, './privkey.pem')),
	cert: fs.readFileSync(path.join(__dirname, './fullchain.pem'))
  }; 

    // <LISTEN SERVER> //
    server.listen(process.env.PORT || 424, () => {
        console.log("(!) Server listening at ::" + (process.env.PORT || 424) + " port!");
    });

    https.createServer(options, app).listen(443, () => {
        console.log('server is running on port 443');
        });
    // </LISTEN SERVER> //
}