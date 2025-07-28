import mongoose from 'mongoose';


const ticketSchema = new monngoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        default: "open",
        enum:["open", "in-progress", "closed"]
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    priority:{
        type: String,
        default: "medium",
        enum:["low", "medium", "high"]
    },
    deadline:{
        type: Date,
    },
    helpfulNotes:{
        type: [String],
        default: [],
    },
    relatedSkills:{
        type: [String],
        default: [],
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
})

export const Ticket = mongoose.model('Ticket', ticketSchema);