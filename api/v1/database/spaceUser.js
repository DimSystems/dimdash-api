const { model, Schema } = require('mongoose');

const sch = new Schema({
	GuildId: String,
  UserId: String,
	muteDuration: String,
	isBanned: String,
	banReason: String,
	SpaceBanId: String,
	banDuration: String
			
})

module.exports = model('spaceuser', sch)