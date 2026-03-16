import { NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(5).max(50).optional().or(z.literal("")),
    subject: z.string().min(3).max(150).optional(),
    message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = contactSchema.safeParse(body);

        if (!parseResult.success) {
            return Response.json(
                { error: "Invalid data", issues: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        const to =
            process.env.CONTACT_TO_EMAIL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "";
        const from = process.env.CONTACT_FROM_EMAIL || "no-reply@example.com";

        if (!process.env.RESEND_API_KEY || !to || !from) {
            return Response.json(
                { error: "Contact form is not configured correctly on the server." },
                { status: 500 }
            );
        }
        const resend = new Resend(process.env.RESEND_API_KEY);

        const subject = data.subject || `New contact form message from ${data.name}`;

        await resend.emails.send({
            from,
            to,
            subject,
            text: [
                `Name: ${data.name}`,
                `Email: ${data.email}`,
                data.phone ? `Phone: ${data.phone}` : null,
                "",
                "Message:",
                data.message,
            ]
                .filter(Boolean)
                .join("\n"),
        });

        return Response.json({ success: true });
    } catch (err) {
        console.error("Contact form error:", err);
        return Response.json(
            { error: "Failed to send message. Please try again later." },
            { status: 500 }
        );
    }
}

