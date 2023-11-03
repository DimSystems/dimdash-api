const { model, Schema } = require('mongoose');

const sch = new Schema({
OwnerId: String,
AdminId: String,
MemberId: String,	
CatagoryId: String,
GuildId: String,
			
})

module.exports = model('spacerole', sch)