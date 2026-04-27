const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: [true,"Account already exists with this email address"],
        required: true
    },
    picture:{
        type: String,
        required: true
    }
});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;