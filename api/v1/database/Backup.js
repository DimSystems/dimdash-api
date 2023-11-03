const { model, Schema } = require('mongoose');

const sch = new Schema({
	GuildId: String,
	CatagoryId: String,
	SpaceId: String,
	BackupName: String,
	BackupId: String,
	BackupData: String

})

module.exports = model('backup', sch)