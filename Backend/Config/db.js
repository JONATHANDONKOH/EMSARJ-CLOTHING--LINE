const { Pool } = require("pg");

// Neon requires SSL. rejectUnauthorized: false is the standard setting for
// Neon's connection strings — their certs are valid but Node's default TLS
// setup doesn't automatically trust the intermediate CA chain the way a
// browser would, so this avoids a self-signed-cert connection error.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  // Fires on idle client errors (e.g. connection dropped by Neon during
  // a scale-to-zero cycle) — log it, don't crash the whole server over
  // one bad connection in the pool.
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

module.exports = pool;