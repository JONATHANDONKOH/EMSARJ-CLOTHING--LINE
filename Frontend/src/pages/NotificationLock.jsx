import { useState } from "react";
const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Subscribing...");

    try {
     const response = await fetch(`${API_URL}/api/email/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("Subscribed successfully!");
        setEmail("");
      } else {
        setStatus(data.error || "Failed to subscribe");
      }
    } catch (err) {
      setStatus("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email"
      />
      <button type="submit">Subscribe</button>
      <p>{status}</p>
    </form>
  );
}
