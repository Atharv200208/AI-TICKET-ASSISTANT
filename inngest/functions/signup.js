import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { User } from "../../models/user";
import { sendEmail } from "../../utils/mailer.js";

export const signup = inngest.createFunction(
    { id: "activation-email", retries: 2 },
    { event: "user/signup" },
    async ({ event, step }) => {
        try {
            const { email } = event.data
            await step.run("get-user-email", async () => {
                const userObject = User.findOne({ email })
                if (!userObject) {
                    throw new NonRetriableError("User not found")
                }
                return userObject
            })
            await step.run("send-welcome-email", async () => {
                const subject = "Welcome to AI Ticket Assistant"
                const message = `Hi there! 
                \n\n 
                Welcome to AI Ticket Assistant. We are excited to have you on board. If you have any questions, feel free to reach out.`
                await sendEmail(user.email, subject, message)
            })
            return { status: "success" }
        } catch (error) {
            console.error("Error running this step:", error.message)
            return {
                success: false
            }
        }
    }
)