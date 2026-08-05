// Notify all subscribers when site is live
async function notifyAll(req, res) {
  try {
    const { description } = req.body;

    const { rows: subscribers } = await db.query(
      "SELECT email FROM subscribers"
    );

    for (const sub of subscribers) {
      await sendEmail(
        sub.email,
        "EMSarj is Live!",
        `<p>${description || "Our site is now open 🎉 Click here to shop!"}</p>`
      );
    }

    res.json({
      success: true,
      message: "All subscribers notified!",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to notify subscribers",
    });
  }
}