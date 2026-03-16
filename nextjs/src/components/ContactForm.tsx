"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
    name: z.string().min(2, "Please enter at least 2 characters.").max(100),
    email: z.string().email("Please enter a valid email address.").max(200),
    phone: z
        .string()
        .max(50, "Phone number is too long.")
        .optional()
        .or(z.literal("")),
    subject: z.string().max(150).optional(),
    message: z
        .string()
        .min(10, "Please include at least 10 characters.")
        .max(2000, "Message is too long."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (values: ContactFormValues) => {
        setStatus("submitting");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                setStatus("error");
                return;
            }

            setStatus("success");
            reset();
        } catch {
            setStatus("error");
        } finally {
            setTimeout(() => {
                setStatus("idle");
            }, 4000);
        }
    };

    const isSubmitting = status === "submitting";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Name
                    </label>
                    <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Your full name"
                        disabled={isSubmitting}
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone (optional)
                    </label>
                    <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(555) 123-4567"
                        disabled={isSubmitting}
                        {...register("phone")}
                    />
                    {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Subject (optional)
                    </label>
                    <Input
                        id="subject"
                        placeholder="How can we help?"
                        disabled={isSubmitting}
                        {...register("subject")}
                    />
                    {errors.subject && (
                        <p className="text-xs text-destructive">{errors.subject.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message
                </label>
                <Textarea
                    id="message"
                    rows={5}
                    placeholder="Share a bit about what you're looking for, and we'll get back to you shortly."
                    disabled={isSubmitting}
                    {...register("message")}
                />
                {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? "Sending..." : "Send message"}
                </Button>
                {status === "success" && (
                    <p className="text-xs text-emerald-400">
                        Message sent. We&apos;ll be in touch soon.
                    </p>
                )}
                {status === "error" && (
                    <p className="text-xs text-destructive">
                        Something went wrong while sending your message. Please try again.
                    </p>
                )}
            </div>
        </form>
    );
}

