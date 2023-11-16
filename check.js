
let config = require("./config");
let Discord = require("discord.js")
const client = new Discord.Client(config.client);
const colors = require("colors")
const { connect } = require("mongoose");
const { red, green, blue, magenta, cyan, white, gray, black } = require("chalk");

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


/*           ANTI CRASHING            ¦¦           ANTI CRASHING           */ 
  process.on('unhandledRejection', (reason, p) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] unhandled Rejection:'.toUpperCase().red.dim);
    console.log(reason.stack ? String(reason.stack) : String(reason).yellow.dim);
    console.log('=== unhandled Rejection ===\n\n\n\n\n'.toUpperCase().red.dim);
  });
  process.on("uncaughtException", (err, origin) => {
    console.log('\n\n\n\n\n\n[🚩 Anti-Crash] uncaught Exception'.toUpperCase().red.dim);
    console.log(err.stack)
    console.log('=== uncaught Exception ===\n\n\n\n\n'.toUpperCase().red.dim);
  })
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('[🚩 Anti-Crash] uncaught Exception Monitor'.toUpperCase().red.dim);
  });
  process.on('beforeExit', (code) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] before Exit'.toUpperCase().red.dim);
    console.log(code);
    console.log('=== before Exit ===\n\n\n\n\n'.toUpperCase().red.dim);
  });
  process.on('exit', (code) => {
    console.log('\n\n\n\n\n[🚩 Anti-Crash] exit'.toUpperCase().red.dim);
    console.log(`${code}`);
    console.log('=== exit ===\n\n\n\n\n'.toUpperCase().red.dim);
  });
// Console




}

startSystem();

setTimeout(() => {
  code = 0; 
  process.exit(code);
}, 5000)
