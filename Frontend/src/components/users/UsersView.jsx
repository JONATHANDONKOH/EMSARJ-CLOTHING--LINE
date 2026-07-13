import { useState, useEffect } from "react";
import { IconUsers } from "../common/Icons";
import { Modal } from "../common/Modal";
import supabase from "../../supabasefol/supabaseClient";

export function UsersView() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      setUsers(users.filter((user) => user.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    return search === ""
      ? true
      : user.name?.toLowerCase().includes(search.toLowerCase()) ||
          user.number?.toString().includes(search);
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <div style={{ color: "#94a3b8" }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "1rem",
          color: "#ef4444",
        }}>
          Error: {error}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
            Users
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            {users.length} total users
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 12px 8px 36px",
              color: "#f1f5f9",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <svg
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#475569" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{
          background: "#1e293b", borderRadius: "12px", padding: "1rem",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#475569", fontWeight: 500 }}>Total Users</p>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#3b82f6" }}>{users.length}</p>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
          <IconUsers size={40} />
          <p style={{ marginTop: "12px", color: "#475569" }}>No users found</p>
        </div>
      ) : (
        <div style={{
          background: "#1e293b",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Name", "Email", "Number", "Actions"].map((col, i) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      textAlign: i === 3 ? "right" : "left",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#475569",
                      textTransform: "uppercase",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Name */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#fff",
                      }}>
                        {user.name?.charAt(0) || "?"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#e2e8f0" }}>
                        {user.name}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>
                    {user.email}
                  </td>

                  {/* Number */}
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>
                    {user.number}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedUser(user)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent",
                        color: "#ef4444",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <Modal title="Delete User" onClose={() => setSelectedUser(null)}>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: 0 }}>
            Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteUser(selectedUser.id)}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete User
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}