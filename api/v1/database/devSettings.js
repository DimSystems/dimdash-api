const { model, Schema } = require('mongoose');

const sch = new Schema({
	isMaintence: Boolean,
    maintenceMsg: String,
    maintenceDate: String
})

module.exports = model('devsettings', sch)