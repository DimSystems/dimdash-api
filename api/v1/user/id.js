const users = require("../database/users.js");
const express = require("express");
const router = express.Router();

module.exports = client => {
    router.get("/:id/profile", async (req, res) => {
        try {
            const _user = await users.findOne({ user: req.params.id });
            delete _user.profile.token;
            delete _user.profile.accessToken;
            
            if(!_user) return res.json({ success: false, message: "Failure", data: null });
            res.json({ success: true, message: "Success", data: _user })
        } catch(err) {
            console.log(err);
            res.json({ success: false, message: "Failure", data: null });
        };
    });

    return router;
}