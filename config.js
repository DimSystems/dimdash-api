const { Intents } = require("discord.js");

module.exports = {
  mongoURL: "mongodb+srv://SkeldLife:Munashe_1978@bakumogodb.hdki7.mongodb.net/DimBotP?replicaSet=atlas-8qs97v-shard-0&readPreference=primary&srvServiceName=mongodb&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1",
  client: {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
},
authPath: "/v1/auth",
 sessionKey: "vhRYmP1A$zKdlge$#c8@@jLc!Gi5VO$yvl^nJCv2ZQba!%C",
  token: "MTE1MDQ4MjkyMDMyMzE3MDM5NQ.GWRaCD.ogTGEKJZhz3P0RCnJ2gmYb8H_ZZXu6HmCXQdi4",
  website: {
    protocol: "https",
    domain: "dash.dimbot.xyz",
    callback: "/api/auth/callback",
    invite: "/dashboard/callback"
},
  auth: {
    discord: {
        ClientSecret: "dBiJw8a83LTO5HjQv7uZa0EsCiEVyzqP",
        ClientId: "1150482920323170395",
        callbackURL: "http://192.168.1.91:575/v1/auth/callback",
        scopes: [ "identify", "guilds" ],
        prompt: "none",
        inviteURL: ""
    }
  }
}