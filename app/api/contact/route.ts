import { NextResponse } from "next/server";
import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    // Validation des données
    const { email, name, subject, message } = await request.json();

    if (!email || !name || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Envoi des emails (à l'admin et confirmation à l'utilisateur)
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      subject: `Nouveau message: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De:</strong> ${name} (${email})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Email de confirmation à l'utilisateur
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Nous avons bien reçu votre message",
      html: `
        <h2>Merci de nous avoir contacté</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre message concernant "${subject}".</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Cordialement,<br>L'équipe CamperWash</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
