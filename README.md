# Secret Page App

This is a full-stack [Next.js 16](https://nextjs.org/) application featuring a secret message board with Supabase, Redux, Radix UI, Tailwind CSS, and form validation using React Hook Form and Zod.  
Bootstrapped with `create-next-app`.

---

## 🚀 Getting Started

**Install dependencies:**
```bash
pnpm install
```

**Run the development server:**
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) — for authentication and data storage
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form validation
- [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/) for testing
- [Lucide Icons](https://lucide.dev/)

---

## 📦 Project Structure

```
.
├── app/                  # Next.js app directory & routing
├── components/           # UI components
├── lib/                  # Util functions
├── utils/                # Helpers for Supabase client, tests
├── types/                # TypeScript types
└── ...
```

---

## 🧪 Running Tests

**Unit and integration tests:**
```bash
pnpm run test
```

**Test coverage:**
```bash
pnpm run run test:coverage
```

**Test ui:**
```bash
pnpm run run test:ui
```

---

## 🖥️ Development Tips

- Edit pages and components under `app/` and `components/`
- Environment variables:  
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Built-in support for [Geist](https://vercel.com/font) via `next/font`

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/introduction/getting-started)
- [Radix Primitives Docs](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev/guide/)

---

## 🚀 Deploy

Easiest deployment:  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

---
