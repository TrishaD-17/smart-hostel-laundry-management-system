# Washday

Washday is a React/Vite hostel laundry prototype. It stores student profiles, laundry records, registered-account password verifiers, and the current session in this browser's `localStorage`.

## Run locally

```sh
npm install
npm run dev
npm run build
```

Registration is available from **Create Account** on the sign-in screen. New student passwords must be at least eight characters and include an uppercase letter, a lowercase letter, a number, and a symbol. Passwords are processed with PBKDF2 and a random salt; only the derived verifier is persisted, never the entered password.

Existing demo accounts remain available: use one of the seeded student emails or `laundry@campus.edu` with any non-empty password.

## Authentication limitation

This localStorage-based authentication is for demos and prototypes only. The browser controls its own code and storage, so users can inspect or alter the records, impersonate sessions, and attempt offline attacks against stored password verifiers. Client-side role checks are not an authorization boundary. Do not use this implementation to protect real student data or staff operations. A production deployment needs server-verified authentication (for example, Supabase Auth), server-side authorization, and row-level policies so students can only access their own records.

The authentication operations are isolated in `src/services/authService.js` to make replacement with a hosted authentication provider more straightforward.
