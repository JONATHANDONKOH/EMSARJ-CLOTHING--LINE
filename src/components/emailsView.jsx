// src/emails/EmailView.jsx
import { useEffect, useState } from "react";
import supabase from "../supabasefol/supabaseClient";

export function EmailView() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("id, user_id, message, created_at");

      if (error) {
        console.error("Error fetching emails:", error);
      } else {
        setEmails(data);
      }
    };

    fetchEmails();
  }, []);

  return (
    <div>
      <h2>Emails</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr key={email.id}>
              <td>{email.user_id}</td>
              <td>{email.message}</td>
              <td>{new Date(email.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
