# EMSarj Clothing Line (Front + Back)

A web application for browsing and purchasing clothing. The frontend is built with **React + Vite** and uses **Supabase** for authentication and data storage. A small **Node/Express** backend is used for protected image uploads to **Cloudinary**.

---

## Features

### Storefront (Frontend)
- Browse categories and products
- Search and filter products (via search bar components)
- User authentication (Sign up / Sign in)
- Password reset flow (Supabase email link)
- Shopping cart and wishlist (context providers)
- Order history view
- Responsive UI and shared navigation/footer components

### Admin / Dashboard (Frontend)
- Admin access is based on the user role stored in Supabase (`users.role`)
- Admin routes are protected by role checks (e.g., redirecting admins to `/dashboard`)

### Payments
- Payment UI exists under the payments pages (Paystack/Supabase integration is part of the project structure).

### Backend (Image Uploads)
- Protected `/upload` endpoint
- Uploads product images using **multer** and stores them in **Cloudinary**
- Authenticated using Supabase JWT validation middleware

---

## Tech Stack

- **Frontend**: React, React Router, Vite, Supabase JS
- **Backend**: Node.js, Express, CORS, Multer, Cloudinary
- **Auth**: Supabase Auth (JWT)
- **Data/Storage**: Supabase tables + Supabase Storage (for product images)

---

## Project Structure

- `Frontend/`
  - `src/App.jsx` – main router and layout
  - `src/context/authContext.jsx` – Supabase auth provider + user profile loader
  - `src/cartContext/` – cart state management
  - `src/wishlistContext/` – wishlist state management
  - `src/pages/*` – pages like `shop`, `cart`, `accounts`, `ordder`(orders), `resetpassword`, etc.
  - `src/pages/payment/*` – payment-related pages
  - `src/supabasefol/supabaseClient.js` – Supabase client configuration

- `Backend/`
  - `index.js` – Express server, Cloudinary config, protected upload route
  - `Middleware/Authmiddleware.js` – verifies Supabase JWT and attaches `req.user`

---

## Local Development

### 1) Frontend

From `Frontend/`:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` (in `Frontend/`) with Supabase values used by the Supabase client:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. Run dev server:
   ```bash
   npm run dev
   ```

### 2) Backend (Upload service)

From `Backend/`:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` (in `Backend/`) containing:
   - `PORT` (optional; defaults to `5000`)
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_KEY`
   - `CLOUDINARY_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. Run server:
   ```bash
   npm start
   ```

The backend is configured to allow CORS requests from:
- `https://emsarj-clothing-line.vercel.app`

If you run locally, update CORS `origin` in `Backend/index.js` to your frontend URL.

---

## Backend API

### `POST /upload`
Protected by Supabase JWT validation.
- **Headers**: `Authorization: Bearer <supabase_access_token>`
- **Body** (multipart/form-data): `image` (file field)

**Response**:
```json
{
  "url": "<cloudinary_secure_url>",
  "public_id": "<cloudinary_public_id>"
}
```

---

## Supabase Database Expectations (high level)

The frontend and auth context expect these tables/fields:
- `users`
  - `id`, `name`, `email`, `number`, `location`, `role`
- `categories`
  - `id`, `name`
- `products`
  - `id`, `name`, `price`, `original_price`, `image_url`, `sizes`, `stock_quantity`, `category_id`, etc.
- `orders`
  - `user_id`, `status`, `total`, `created_at`, and nested `orderItems`

(Exact schema may vary; check your Supabase project for current column names.)

---

## Notes / Deployment

- Frontend uses React Router; deep links should be handled by your hosting provider (SPA fallback).
- Reset password redirect URL is currently configured in `Frontend/src/pages/resetpassword.jsx`:
  - `https://emsarj.net/reset-password`
  - Update this if your deployed domain changes.

---

## License

Add your license information here (MIT, Apache-2.0, etc.).

