const { GatewayIntentBits } = require("discord.js");

module.exports = {
  developers: [
    "1174366663362224149", "1076512386078474240"
  ],
  mongoURL: "mongodb+srv://SkeldLife:Munashe_1978@bakumogodb.hdki7.mongodb.net/DimBotP",
  client: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
},
 authPath: "/v1/auth",
 sessionKey: "vhRYmP1A$zKdlge$#c8@@jLc!Gi5VO$yvl^nJCv2ZQba!%C",
  token: "MTE1MDQ4MjkyMDMyMzE3MDM5NQ.GWRaCD.ogTGEKJZhz3P0RCnJ2gmYb8H_ZZXu6HmCXQdi4",
  website: {
    protocol: "https",
    domain: "https://dash.dimbot.xyz",
    callback: "/api/v1/auth/callback",
    invite: "/dashboard/callback"
},
  auth: {
    discord: {
        ClientSecret: "dBiJw8a83LTO5HjQv7uZa0EsCiEVyzqP",
        ClientId: "1150482920323170395",
        callbackURL: "https://api-production.dimbot.xyz/v1/auth/callback",
        scopes: [ "identify", "guilds" ],
        prompt: "none",
        botInvite: "https://discord.com/api/oauth2/authorize?client_id=1150482920323170395&permissions=380909923504&scope=bot"
    }
  }
}