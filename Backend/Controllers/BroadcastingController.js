const { Resend } = require("resend");
const SubscriberModel = require("../Models/BroadcastingModule");

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

// GET /messages/subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await SubscriberModel.getAll();
    return res.status(200).json({ subscribers });
  } catch (err) {
    console.error("getAllSubscribers error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// POST /messages/notify-all (admin only)
exports.notifyAll = async (req, res) => {
  try {
    const { subject, html } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ error: "subject and html are required" });
    }

    const emails = await SubscriberModel.getAllEmails();

    if (!emails.length) {
      return res.status(200).json({ message: "No subscribers to notify" });
    }

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.RESEND_FROM_EMAIL, // send to self, subscribers go in bcc
        bcc: emails,
        subject,
        html,
      });

      if (error) {
        console.error("resend notify-all error:", error);
        return res.status(502).json({ error: "Failed to send notification" });
      }
    } catch (emailErr) {
      console.error("resend notify-all exception:", emailErr);
      return res.status(502).json({ error: "Failed to send notification" });
    }

    return res.status(200).json({ message: `Notified ${emails.length} subscriber(s)` });
  } catch (err) {
    console.error("notifyAll error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};