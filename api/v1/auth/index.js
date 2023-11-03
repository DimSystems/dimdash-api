const DiscordStrategy = require("passport-discord").Strategy;
const users = require("../database/users");
const config = require("../../../config.js");
const Discord = require("discord.js");
const passport = require("passport");
const fetch = require("node-superfetch");
const express = require("express");

module.exports = settings => {
    const {
        router,
        path,
        client
    } = settings;

    // <DISCORD STRATEGY> //
    passport.use(
        new DiscordStrategy({
            clientID: config.auth.discord.ClientId, 
            clientSecret: config.auth.discord.ClientSecret, 
            callbackURL: config.auth.discord.callbackURL, 
            scope: config.auth.discord.scopes 
        }, (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        })
    );
    // </DISCORD STRATEGY> //

    
    passport.serializeUser((user, done) => { done(null, user) });
    passport.deserializeUser((obj, done) => { done(null, obj) });
    router.use(passport.initialize());
    router.use(passport.session());
  
    return {
        discord: require("./discord/index.js")(express.Router(), path, users, passport, config, fetch, Discord, client),
    };


};