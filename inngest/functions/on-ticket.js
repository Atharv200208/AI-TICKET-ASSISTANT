import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { Ticket } from "../../models/ticket.js"
import { sendEmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai-talker.js";
import { User } from "../../models/user.js";
export const onTicketCreated = inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async (event, step) => {
        try {
            const { ticketId } = event.data

            //fetch ticket from db
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId)
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found")
                }
                return ticketObject
            })

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id,
                    {
                        status: "TODO"
                    }
                )
            })

            const aiResponse = await analyzeTicket(ticket)

            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = []
                if (aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].
                            includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes,
                        relatedSkills: aiResponse.relatedSkills,
                    })
                    skills = aiResponse.relatedSkills
                }
                return skills
            })

            const moderator = await step.run("assign-moderator",
                async () => {
                    let user = await User.findOne({
                        role: "moderator",
                        skills: {
                            $elemMatch: {
                                $regex: relatedSkills.join("|"),
                                $options: "i"
                            },
                        },
                    });
                    if (!user) {
                        user = await User.findOne({
                            role: "admin"
                        })
                    }
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        assignedTo: user ? user._id : null,
                    })
                    return user
                });

            await step.run("send-email-noification", async () => {
                if (moderator) {
                    const finalTicket = await Ticket.findById(ticket._id)
                    await sendEmail(
                        moderator.email,
                        "Ticket Assigned",
                        `A new ticket titled "${finalTicket.title}" has been assigned to you. Please review it.`
                    )
                }
            })
            return { success: true }
        } catch (error) {
            console.error("Error running the step:", error.message)
            return { success: false }
        }
    }
)