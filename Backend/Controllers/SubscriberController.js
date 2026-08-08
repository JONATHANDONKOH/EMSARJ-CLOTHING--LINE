const { Resend } = require("resend");
const SubscriberModel = require("../Models/SubscriberModule");

const resend = new Resend(process.env.RESEND_API_KEY);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /messages/subscribe (public)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }

    const saved = await SubscriberModel.subscribe(email.toLowerCase().trim());

    if (!saved) {
      return res.status(200).json({ message: "You're already subscribed" });
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
    const emails = await SubscriberModel.getAllEmails();

    if (emails.length === 0) {
      return res.status(200).json({ message: "No subscribers to notify", sent: 0, total: 0 });
    }

    const subject = "We're live!";
    const html = `<p>Hey there — Emsarj is officially live. Come check us out!</p>`;

    // Resend batch endpoint caps at 100 per call — chunk it
    const chunks = [];
    for (let i = 0; i < emails.length; i += 100) {
      chunks.push(emails.slice(i, i + 100));
    }

    let sentCount = 0;
    for (const chunk of chunks) {
      const batchPayload = chunk.map((to) => ({
        from: process.env.RESEND_FROM_EMAIL, // e.g. "Emsarj <hello@yourdomain.com>"
        to,
        subject,
        html,
      }));

      const { error } = await resend.batch.send(batchPayload);
      if (error) {
        console.error("resend batch error:", error);
        continue;
      }
      sentCount += chunk.length;
    }

    return res.status(200).json({ message: "Notifications sent", sent: sentCount, total: emails.length });
  } catch (err) {
    console.error("notifyAll error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};