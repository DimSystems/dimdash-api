const { model, Schema } = require('mongoose');

const sch = new Schema({
	Agreement: Boolean,
	GuildId: String
})

module.exports = model('agreement', sch)