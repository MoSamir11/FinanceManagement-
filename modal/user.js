const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        default: null
    },
    email: {
        type: String,
        require: true,
        default: null
    },
    password: {
        type: String,
        require: true,
        default: null
    },
    status: {
        type: String,
        require: true,
        default: 'Active'
    },
    userType: {
        type: String,
        require: true,
        default: null
    },
    createdOn: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("user",userSchema);