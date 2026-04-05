const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const financeSchema = new Schema({
    amount: {
        type: Number,
        require: true,
        default: null
    },
    type: {
        type: String,
        require: true,
        default: null
    },
    category: {
        type: String,
        require: true,
        default: null
    },
    note: {
        type: String,
        require: true,
        default: null
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    updatedOn:{
        type: Date,
        default: ""
    }
});

module.exports = mongoose.model("finance",financeSchema);