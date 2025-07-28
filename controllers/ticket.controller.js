import { inngest } from '../inngest/client.js'
import Ticket from '../models/ticket.js'

export const createTicket = async(req, res) =>{
    try {
        const{title, description} = req.body
        if(!title || !description){
            return res
            .status(400)
            .json({
                message:"Title and description are required"
            })
        }
        const newTicket = await Ticket.create({
            title, 
            description,
            createdBy: req.user._id.toString()
        })

        await inngest.send({
            name: "ticket/created",
            data:{
                ticketId: newTicket._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()
            }
        });
        return res
        .status(201)
        .json({
            message: "Ticket creating and processing started",
            ticket: newTicket
        })
    } catch (error) {
        console.error("Error creating ticket:", error.message)
        return res
        .status(500)
        .json({
            message: "Internal server error while creating the ticket",
            error: error.message
        })
    }   
}

export const getTickets = async(req, res) =>{
    try {
        const user = req.user
        let tickets =[]
        if(user.role !== 'user'){
            tickets = await Ticket.find({})
            .populate("assignedTo", ["email", "_id"])
            .sort({createdAt: -1})
        }else{
           tickets = await Ticket.find({createdBy: user._id})
            .select("title description status createdAt")
            .sort({createdAt: -1})
        }
        return res
        .status(200)
        .json(tickets)
    } catch (error) {
        console.error("Error fetching tickets:", error.message)
        return res
        .status(500)
        .json({
            message: "Internal server error while fetching the tickets",
            error: error.message
        })
    }
}

export const getTicket = async(req, res) =>{
    try {
        const user = req.user
        let ticket;

        if(user.role !== 'user'){
            ticket = await Ticket.findById(req.params.id)
            .populate("assignedTo", ["email", "_id"])
        }else{
            ticket = await Ticket.findOne({
                createdBy: user._id,
                _id: req.params.id
            }).select("title description status createdAt")
        }
        if(!ticket){
            return res 
            .status(404)
            .json({
                message: "Ticket not found"
            })
        }
        return res.status(200).json({ticket})
    } catch (error) {
        console.error("Error fetching ticket:", error.message)
        return res
        .status(500)
        .json({
            message: "Internal server error while fetching the ticket",
            error: error.message
        })
    }
}

export const updateTicket = async(req, res) => {
    const {title, description} = req.body
    try {
        if(req.user.role !== 'user' && req.user.role !== 'admin'){
            return res.status(403).json({error: "Forbidden"})
        }
        const ticket = await Ticket.findById(req.params.id)
        if(!ticket){
            return res.status(404).json({error:"Ticket not found"})
        }
       const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            {
                title: title || ticket.title,
                description: description || ticket.description
              },
            {new : true}
        )
        return res.json({
            message: "Ticket updated successfully"
        , ticket: updatedTicket
        })
    } catch (error) {
        res.status(500).json({
            error: "Update failed",
            details: error.message
    })
    }
}