# FILE_CONNECTIONS.md

Documentation for how the main files in this project connect to each other.

> Project: **EMSarj Clothing Line** (React/Vite frontend + Node/Express backend + Supabase + Paystack)

---

## 1) High-level architecture (who talks to who)

### Frontend (React)
- `Frontend/src/main.tsx` mounts the app and wraps it with global providers:
  - `AuthProvider` (`Frontend/src/context/authContext.jsx`)
  - `CartProvider` (`Frontend/src/cartContext/cartprovider.jsx`)
  - `App` (`Frontend/src/App.jsx`) further wraps:
    - `WishlistProvider` (`Frontend/src/wishlistContext/wishlistprovider.jsx`)

- `Frontend/src/App.jsx`:
  - configures the router (`react-router-dom`)
  - defines which **page component** renders for each URL
  - places shared layout components:
    - `TopNav` (top navigation)
    - `EmsarjFooter` (footer)

- Many components/pages use **context hooks**:
  - `useAuth()` from `authContext.jsx`
  - `useCart()` from `cartprovider.jsx`
  - `useWishlist()` from `wishlistprovider.jsx`

### Backend (Express)
- `Backend/index.js` runs the Express server and exposes:
  - `POST /upload` protected by:
    - `Backend/Middleware/Authmiddleware.js`

- `Backend/index.js` uses Cloudinary to upload images.

### Supabase
- `Frontend/src/context/authContext.jsx` uses Supabase auth and user profile loading.
- Many pages query Supabase tables:
  - `categories`
  - `products`
  - `orders`
  - `orderItems`
  - `emails`

### Paystack + Edge Function
- `Frontend/src/pages/cart.jsx` opens Paystack checkout.
- On Paystack success, the browser calls a Supabase **Edge Function**:
  - `verifyAndMarkPaid`

---

## 2) App bootstrap & routing

### `Frontend/src/main.tsx`
**Connection role:** root entry point.

- Wraps the app in:
  - `BrowserRouter` (routing)
  - `AuthProvider` (auth state)
  - `CartProvider` (cart state)
  - `App`

### `Frontend/src/App.jsx`
**Connection role:** global layout + router.

- Wraps `AppContent` in `WishlistProvider`.
- Defines routes:
  - `/` → `CategoryFront`
  - `/signin` → `SignIn`
  - `/signup` → `register`
  - `/dashboard` → `Dashboard`
  - `/cart` → `Cart`
  - `/category/:id` → `CategoryPage`
  - `/account` → `accounts`
  - `/orders` → `ordder`
  - `/resetpassword` → `resetpassword`
  - `/wishlist` → `WishlistPage`
  - `/shop` → `Shop`
  - `/messages` → `UserMessages`

- Layout components:
  - `TopNav` and `EmsarjFooter` are shown/hidden depending on route.

---

## 3) Auth flow & role-based behavior

### `Frontend/src/context/authContext.jsx`
**Connection role:** single source of truth for:
- current `session`
- current `user` profile (including `role`)

Connections:
- Imports Supabase client:
  - `../supabasefol/supabaseClient`
- Exposes `signUp`, `signIn`, `signOut`, `user`, `session`, and `supabase`.

Supabase queries/logic:
- On mount:
  - `supabase.auth.getSession()`
  - subscribes to `supabase.auth.onAuthStateChange()`
- `loadUser(authUser)`:
  - fetches profile from `users` table:
    - `select(name, email, number, location, role).eq(id, authUser.id).single()`
- `signUp(...)`:
  - creates auth user via `supabase.auth.signUp`
  - inserts a row into `users` with `role: "user"`
- `signIn(email, password)`:
  - uses `supabase.auth.signInWithPassword`
  - loads `role` immediately from `users` table so pages can redirect correctly.

### `Frontend/src/pages/SignIn.jsx`
**Connection role:** UI for login.

- Imports:
  - `useAuth` from `../context/authContext`
- Uses:
  - `const { signIn } = useAuth()`
- Redirect behavior:
  - if `result.role === "admin"` → `/dashboard`
  - else → `/`

### `Frontend/src/pages/register.jsx`
**Connection role:** UI for signup.

- Imports:
  - `useAuth` from `../context/authContext`
- Uses:
  - `signUp(formData)`
- Performs client-side validation with `zod`.

### `Frontend/src/pages/resetpassword.jsx`
**Connection role:** password reset request + password update.

- Imports:
  - `useAuth` to access `supabase`
- Two modes:
  - `request` mode:
    - calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
  - `update` mode:
    - listens to auth event:
      - if event is `PASSWORD_RECOVERY` → switches to `update`
    - calls `supabase.auth.updateUser({ password: newPassword })`

---

## 4) Cart & Wishlist state management

### `Frontend/src/cartContext/cartprovider.jsx`
**Connection role:** global cart store for the entire app.

- Exposes via React context:
  - `cartItems`
  - `addToCart(product)`
  - `removeFromCart(id, selectedSize)`
  - `increaseQuantity/decreaseQuantity/updateQuantity`
  - computed:
    - `cartCount`
    - `cartTotal`

### `Frontend/src/wishlistContext/wishlistprovider.jsx`
**Connection role:** global wishlist store.

- Persists wishlist to `localStorage`.
- Exposes:
  - `wishlist`, `wishlistCount`
  - `addToWishlist`, `removeFromWishlist`, `toggleWishlist`, `isInWishlist`, `clearWishlist`

### `Frontend/src/components/common/TopNav.jsx`
**Connection role:** consumes cart/wishlist counts.

- Imports:
  - `useCart()` and `useWishlist()`
- Uses:
  - `cartCount` for cart badge
  - `wishlistCount` for wishlist badge

Also:
- fetches `categories` from Supabase for the category marquee/mobile menu.
- uses `useAuth().user` to show profile menu items and to decide admin vs user links.

### `Frontend/src/pages/WishlistPage.jsx`
**Connection role:** wishlist UI.

- Imports:
  - `useWishlist()` and `useCart()`
- Allows:
  - add items from wishlist into cart via `addToCart(...)`.

### `Frontend/src/pages/cart.jsx`
**Connection role:** cart UI + checkout/payments.

- Imports:
  - `useCart()`
  - `supabase` client
- Uses local state for:
  - selecting sizes per cart item
  - qty per selected size
  - opening/closes `PaymentModal`

Key connection inside checkout:
- on Paystack callback success, it calls Edge Function `verifyAndMarkPaid` (see section 7).

---

## 5) Storefront browsing pages (Shop, categories)

### `Frontend/src/pages/shop.jsx`
**Connection role:** product detail + “Add to wardrobe” flow.

- Imports:
  - `useCart()` for adding items
  - `supabase` for fetching related products in same category
  - `supabase.storage.getPublicUrl(...)` to resolve image URLs
  - uses `navigate("/shop", { state: { product } })` pattern

Connections:
- Reads passed product from router state:
  - `location.state.product`
- Fetches other products from Supabase:
  - `products` where `category_id = passedProduct.category_id`
  - excludes current product id via `.neq("id", currentProductId)`

When user adds to cart:
- calls `addToCart({... product fields, selectedSize, quantity ...})`

---

## 6) Email/messages

### `Frontend/src/context/emailfunction.jsx`
**Connection role:** Supabase “insert a message” function.

- Exposes:
  - `insertEmail(message)`

Supabase connections:
- checks auth session:
  - `supabase.auth.getSession()`
- inserts into `emails` table with fields used by RLS policy:
  - `user_id: session.user.id`
  - `sender_role: "user"`
  - `message: trimmed`

### `Frontend/src/components/Emsarjfooter.jsx`
**Connection role:** footer message box.

- Imports `insertEmail` from `../context/emailfunction`.
- Calls `insertEmail(trimmed)` on button click / Enter.

---

## 7) Payments & Orders (Supabase + Paystack + Edge Function)

### `Frontend/src/pages/cart.jsx`
**Connection role:** checkout UI orchestration.

Payment pipeline implemented in `PaymentModal` (same file):
1. Insert order row into Supabase `orders`
   - `insertOrder({ first_name, last_name, phone_number, email, subtotal, total })`
2. Insert order line items into `orderItems`
   - `insertOrderItems(orderItems)`
3. Open Paystack popup
   - Paystack `callback` calls:
     - `verifyAndMarkPaid(orderId, reference)`
4. `verifyAndMarkPaid` calls Supabase Edge Function:
   - `EDGE_FUNCTION_URL = https://.../functions/v1/verifyAndMarkPaid`
   - sends `{ orderId, reference }`
   - includes `Authorization: Bearer <session.access_token>`

### `Frontend/src/pages/ordder.jsx`
**Connection role:** order history UI.

- Uses auth:
  - `const { user } = useAuth()` and redirects to `/signin` if no user.
- Fetches `orders` with nested `orderItems`:
  - `.from("orders").select(..., orderItems(...))`
  - `.eq("user_id", session.user.id)`

It then renders:
- order status badge
- collapsible receipt showing customer info and each `orderItems` row.

---

## 8) Admin: Products CRUD & image upload

### `Frontend/src/components/products/ProductsView.jsx`
**Connection role:** admin dashboard products list.

- Loads products from Supabase `products` table joined with `categories`.
- Renders each product using `ProductCard`.
- Opens modals using `Modal` and `ProductForm`:
  - `ProductForm` in add mode
  - `ProductForm` in edit mode (passes `initial={editProduct}`)

Delete flow:
- removes stored image from Supabase Storage (legacy cleanup)
- deletes product row from Supabase `products`.

### `Frontend/src/components/products/ProductCard.jsx`
**Connection role:** admin product tile UI.

- Consumes props:
  - `product`
  - `onEdit`
  - `onDelete`

Does not call external services; it’s mainly presentation.

### `Frontend/src/components/products/ProductForm.jsx`
**Connection role:** create/update a product and upload product image.

Connections:
- Imports:
  - `useAuth()` to get `session` (needed for backend JWT auth)
  - Supabase client for reading categories and writing products
- Fetches categories from Supabase:
  - `categories.select("id, name")`

Image upload path (important cross-system connection):
- Upload destination is **Express backend**:
  - `UPLOAD_API_URL` from `import.meta.env.VITE_UPLOAD_API_URL`
  - default in code points to deployed backend

- When user selects a file, `uploadImage(file)`:
  1. creates `FormData` with field name `image`
  2. POSTs to `${UPLOAD_API_URL}/upload`
  3. includes header:
     - `Authorization: Bearer ${session.access_token}`
  4. expects response:
     - `{ url: <cloudinary secure url>, public_id: <cloudinary id> }`

- The returned `url` is stored in Supabase `products.image_url`.

Then product save:
- if editing:
  - updates `products` where `id = initial.id`
- if creating:
  - inserts new row into `products`
- finally re-fetches product with category join so UI has consistent fields.

---

## 9) Backend upload protection (Express + Supabase JWT)

### `Backend/Middleware/Authmiddleware.js`
**Connection role:** verifies incoming Supabase access tokens for protected backend endpoints.

- Creates server-side Supabase client from backend env:
  - `process.env.SUPABASE_URL`
  - `process.env.SUPABASE_ANON_KEY`

- Validates:
  - `Authorization` header must start with `Bearer`
  - extracts token
  - calls:
    - `supabase.auth.getUser(token)`
- On success:
  - attaches authenticated user to `req.user`
  - calls `next()`

### `Backend/index.js`
**Connection role:** Express app wiring + Cloudinary upload.

- Configures:
  - CORS allowed origin (currently set to deployed frontend domain)
  - Cloudinary credentials from env
  - multer storage (writes to `uploads/` temporarily)

- Defines:
  - `app.post("/upload", authMiddleware, upload.single("image"), uploadController)`

Upload pipeline:
1. `authMiddleware` verifies JWT
2. `multer` reads multipart file field `image`
3. `uploadController` uploads `req.file.path` to Cloudinary under folder `products`
4. deletes temporary local file via `fs.unlinkSync`
5. returns JSON:
   - `url: result.secure_url`
   - `public_id: result.public_id`

---

## 10) Summary diagram (conceptual)

```text
Frontend
  main.tsx
    -> AuthProvider (authContext.jsx)
    -> CartProvider (cartprovider.jsx)
    -> App.jsx
        -> WishlistProvider (wishlistprovider.jsx)
        -> Router pages

Cart flow
  cart.jsx
    -> (Supabase) insert orders + orderItems
    -> (Paystack) checkout
    -> (Edge Function verifyAndMarkPaid)

Admin product upload
  ProductForm.jsx
    -> Express POST /upload (JWT Authorization header)
        Backend/index.js
          -> Authmiddleware.js validates JWT with Supabase
          -> multer parses image
          -> Cloudinary upload
    -> ProductForm stores Cloudinary url in Supabase products.image_url
```

---

## Notes / conventions used across the codebase
- Context providers are the primary way non-parent components share state:
  - `useAuth`, `useCart`, `useWishlist`.
- Image rendering differs by system:
  - storefront uses `supabase.storage.getPublicUrl(...)` (in `Shop.jsx`) for product images.
  - admin upload stores image URL returned by backend/Cloudinary.
- Password reset uses Supabase auth events:
  - `PASSWORD_RECOVERY` toggles `resetpassword.jsx` into update mode.

