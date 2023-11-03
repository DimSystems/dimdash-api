let config = require("./config");
let Discord = require("discord.js")
const client = new Discord.Client(config.client);
const { connect } = require("mongoose");

async function startSystem() {
    console.log("DIM API \n Loading API Module - Server")
    client.login(config.token).then(() => {
        console.log("(!) Connected to Discord as " + client.user.username + "!");
        console.log("[Create Server] Creating server...")
        require('./api/v1/index')(client);
      }).catch(err => {
        console.error(err+"Error occured while logging in");
      });
      console.log("DIM API \n Loading API Module - Database")
    await connect(config.mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false
    }).then(() => {
        console.log("(!) Connected to database!");
    }).catch(err => {
        console.log(err);
        console.log("(!) Failed connecting to database!");
        process.exit(1);
    });

}

startSystem()