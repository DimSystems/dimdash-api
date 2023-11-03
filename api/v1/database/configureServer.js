const { model, Schema } = require('mongoose');

const sch = new Schema({
GuildId: String,
reportGlobalCH: String,
reportSpaceCH: String,
spaceAdCH: String,
appRecieveCH: String,
appCH: String,
reportGlobalRL: String,	
reportSpaceRL: String,	
HostCH: String,	
HostCHTH1: String,
HostCHTH2: String,
appCHID: String	
	
})

module.exports = model('serverconfig', sch)