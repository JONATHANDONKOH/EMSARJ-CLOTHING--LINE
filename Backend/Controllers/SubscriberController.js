const { Resend } = require("resend");
const SubscriberModel = require("../Models/subscriberModule");

const resend = new Resend(process.env.RESEND_API_KEY);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /messages/subscribe (public)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const saved = await SubscriberModel.subscribe(normalizedEmail);

    if (!saved) {
      return res.status(200).json({ message: "You're already subscribed" });
    }

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL, // e.g. "EMSarj <hello@emsarj.net>"
        to: normalizedEmail,
        subject: "Welcome to EMSarj!",
        html: "<p>Thanks for subscribing. We’ll notify you when we’re live 🎉</p>",
      });

      if (error) {
        console.error("resend welcome email error:", error);
      }
    } catch (emailErr) {
      console.error("resend welcome email exception:", emailErr);
    }

    return res.status(201).json({ message: "Subscribed successfully", subscriber: saved });
  } catch (err) {
    console.error("subscribe error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};