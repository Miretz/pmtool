const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId



function buildModel(name, schemaInput) {
    let schema = new Schema(schemaInput, { timestamps: true });
    if (name === 'Folder') {
        schema.index({ name: 'text', description: 'text' });
    } else {
        schema.index({ name: 'text' });
    }
    return mongoose.model(name, schema);
}

const Folder = buildModel('Folder', {
    name: String,
    description: String,
    shareWith: [{
        kind: String,
        item: { type: ObjectId, refPath: 'shareWith.kind' }
    }],
    parent: { type: ObjectId, ref: 'Folder' },
    startDate: Date,
    endDate: Date,
    createdBy: String,
    status: {}
})

module.exports.Folder = Folder

module.exports.Team = Folder.discriminator('Team', new Schema({
}, { timestamps: true }))

module.exports.User = buildModel('User', {
    name: {
        type: String,
        default: ''
    },
    firstname: String,
    lastname: String,
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    jobTitle: {
        type: String,
        default: ''
    },
    avatarColor: String,
    team: { type: ObjectId, ref: 'Team' },
    role: String,
    status: String
})

module.exports.Group = buildModel('Group', {
    team: { type: ObjectId, ref: 'Team' },
    name: String,
    initials: String,
    avatarColor: String,
    users: [{ type: ObjectId, ref: 'User' }],
})