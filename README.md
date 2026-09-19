# solar-admin-dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_1LqlBxjHFFm8G8wTPluqHz4iseha)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Partner phone authentication

Admin-created partners are provisioned through `POST /api/partners`. The route verifies
an administrator's Firebase ID token and active admin profile before creating a phone
Auth account and the linked `users/{uid}` and `Partner` records. Indian mobile numbers
accept 10 digits or a +91 prefix; Firebase Auth receives E.164 format. Partners do not
need a password. Existing partner accounts are not migrated automatically.

Configure these **server-only** environment variables in the Next.js hosting environment:

- `FIREBASE_ADMIN_PROJECT_ID`: same project as the public Firebase configuration.
- `FIREBASE_ADMIN_CLIENT_EMAIL`: service account email.
- `FIREBASE_ADMIN_PRIVATE_KEY`: service account private key (escaped newlines supported).

On Google infrastructure, Application Default Credentials can be used instead. Never
prefix credentials with `NEXT_PUBLIC_` or commit a service-account key. The app must
run with a Next.js server; the API route cannot run on static-only hosting.

For Vercel deployments, use Node.js 24.x (declared in `package.json`; the installed
Firebase Admin SDK requires Node.js 22 or newer). Add all three Admin variables in
Project Settings → Environment Variables with **Production** selected, then redeploy.
Your local `.env` does not configure the Vercel environment. Paste the private key
without surrounding quotes; actual newlines and literal `\n` are supported. Use a
service account from the same Firebase project as the public client configuration.

If partner creation fails, inspect Vercel runtime logs for `POST /api/partners`.
`admin/missing-credentials` means the service-account configuration is incomplete;
other Firebase error codes identify credential, permission, or database failures.
An HTML 500 response may indicate a function startup failure before the route can
return JSON, so inspect the runtime exception as well as the browser console.

Enable Phone under Firebase Authentication sign-in providers and configure SMS regions
and the mobile app's Firebase phone authentication prerequisites. The mobile app must
complete Firebase's OTP verification and read `users/{authenticated uid}`. Account
creation does not send an OTP. Use Firebase test phone numbers for verification without
sending real SMS. The mobile app source is maintained separately from this repository.
