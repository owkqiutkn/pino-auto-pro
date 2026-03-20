import { NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getCachedSiteSettings } from "@/lib/supabase/cached";

const contactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(5).max(50).optional().or(z.literal("")),
    /** Shown in email body only (general contact form). */
    subject: z.string().max(150).optional(),
    message: z.string().min(10).max(2000),
    /** Page where the form was submitted (client should send window.location.href). */
    pageUrl: z.string().max(2048).optional(),
    /** When set (vehicle detail inquiry), subject is "{vehicleDisplayName} - More Information". */
    vehicleDisplayName: z.string().max(200).optional(),
});

const CONTACT_FORM_SUFFIX = " - Contact Form";
const MORE_INFO_SUFFIX = " - More Information";
/** Keep total subject within typical header limits. */
const MAX_URL_IN_SUBJECT = 900 - CONTACT_FORM_SUFFIX.length;
const MAX_VEHICLE_NAME_IN_SUBJECT = 900 - MORE_INFO_SUFFIX.length;

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

        const settings = await getCachedSiteSettings();
        const contactFormRecipient = settings?.contact_form_email?.trim() || "";
        const businessEmail = settings?.email?.trim() || "";
        const envRecipient = process.env.CONTACT_TO_EMAIL?.trim() || "";
        // To = Contact form inbox in admin (site_settings.contact_form_email), then env, then public email.
        const to =
            contactFormRecipient || envRecipient || businessEmail;
        // From = CONTACT_FROM_EMAIL (Resend-verified), e.g. info@reactfuel.com.
        const from =
            process.env.CONTACT_FROM_EMAIL?.trim() || "no-reply@example.com";

        if (!process.env.RESEND_API_KEY || !to || !from) {
            return Response.json(
                { error: "Contact form is not configured correctly on the server." },
                { status: 500 }
            );
        }
        const resend = new Resend(process.env.RESEND_API_KEY);

        const resolvedUrl =
            data.pageUrl?.trim() ||
            request.headers.get("referer")?.trim() ||
            process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
            "—";
        const vehicleName = data.vehicleDisplayName?.trim() ?? "";
        let subject: string;
        if (vehicleName) {
            const namePart =
                vehicleName.length > MAX_VEHICLE_NAME_IN_SUBJECT
                    ? `${vehicleName.slice(0, MAX_VEHICLE_NAME_IN_SUBJECT - 1)}…`
                    : vehicleName;
            subject = `${namePart}${MORE_INFO_SUFFIX}`;
        } else {
            const urlForSubject =
                resolvedUrl.length > MAX_URL_IN_SUBJECT
                    ? `${resolvedUrl.slice(0, MAX_URL_IN_SUBJECT - 1)}…`
                    : resolvedUrl;
            subject = `${urlForSubject}${CONTACT_FORM_SUFFIX}`;
        }

        await resend.emails.send({
            from,
            to,
            subject,
            text: [
                `Page: ${resolvedUrl}`,
                vehicleName ? `Vehicle: ${vehicleName}` : null,
                data.subject?.trim() ? `Topic: ${data.subject.trim()}` : null,
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

