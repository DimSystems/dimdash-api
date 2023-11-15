const { model, Schema } = require("mongoose");

module.exports = model("users", new Schema({
    user: { type: String, required: true },
    banned: { type: Boolean, required: true, default: false },
    token: { type: String, required: true },
    profile: { type: Object, required: true },
    spaces: { type: Array, required: true, default: [] }
}));