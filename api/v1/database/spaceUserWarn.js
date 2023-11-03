const { model, Schema } = require('mongoose');

const sch = new Schema({
	GuildId: String,
 WarnId: String,	
  UserId: String,
  SpaceId: String,
  WarnReason: String,
  isWarnActive: String,
  warnDuration: String	
			
})

module.exports = model('spaceuserwarn', sch)