const { model, Schema } = require('mongoose');

const sch = new Schema({
	GuildId: String,
  roleId: String,
	spaceName: String,
		SpaceDescription: String,
	MessageId: String,
	ImageURL: String,
	WelcomeChannel: String,
	CatagoryId: String, // To be able to change global permissions. [Channels have to be in sync though!]
	showSpace: Boolean
})

module.exports = model('space', sch)