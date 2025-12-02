# Secret Page App

A full-stack [Next.js 16](https://nextjs.org/) social messaging application featuring secret messages, real-time chat, friend management, and user profiles. Built with Supabase for backend services, Redux for state management, and a beautiful UI powered by Radix UI, Tailwind CSS v4, and React 19. Includes comprehensive form validation with React Hook Form + Zod, support, and full test coverage..

---

## ✨ Features

### 🔐 Authentication
- User registration and login with email/password
- Email verification support
- Secure session management with Supabase Auth
- Account deletion functionality

### 💬 Secret Messages
- Create, view, and update personal secret messages
- Upload images with messages
- View all users' public secret messages
- Real-time message updates

### 👥 Friends System
- Send and receive friend requests
- Accept or reject friend requests
- View friends list with message counts
- Real-time friend request notifications
- Recommended users discovery

### 💭 Real-time Chat
- One-on-one messaging with friends
- Real-time message synchronization using Supabase Realtime
- Auto-scrolling chat interface
- Message history persistence

### 📱 Three Secret Pages
- **Secret Page 1**: Browse all users' secret messages
- **Secret Page 2**: Create/update your secret messages + view all messages
- **Secret Page 3**: Complete social hub with friends, chat, and secret messages

### 🎨 User Interface
- Responsive design with mobile-first approach
- Modern UI components with Radix UI
- Toast notifications for user feedback
- Loading states and error handling

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm installed
- Supabase account and project

### Installation

**1. Install dependencies:**
```bash
pnpm install
```

**2. Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**3. Run the development server:**
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Backend**: [Supabase](https://supabase.com/) — Authentication, Database, Realtime, Storage
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **UI Components**: [Radix UI Primitives](https://www.radix-ui.com/docs/primitives/overview/introduction)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

---

## 📦 Project Structure

```
.
├── app/                              # Next.js app directory
│   ├── (authenticated)/              # Protected routes group
│   │   ├── secret-page-1/           # View all secret messages
│   │   ├── secret-page-2/           # Create/update + view messages
│   │   └── secret-page-3/           # Friends, chat, and messages
│   ├── api/                          # API routes
│   │   └── delete-account/          # Account deletion endpoint
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page (auth)
│   └── unauthorized.tsx              # Unauthorized access page
│
├── components/                        # React components
│   ├── forms/                        # Authentication forms
│   ├── friends/                      # Friend management components
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-chat-scroll.tsx      # Chat auto-scroll hook
│   │   ├── use-realtime-*.ts        # Supabase realtime hooks
│   ├── layout/                       # Layout components
│   │   └── header-nav-menu.tsx      # Navigation header
│   ├── messages/                     # Message components
│   │   ├── chat/                     # Real-time chat
│   │   ├── user-secret-messages.tsx # User's own messages
│   │   └── users-secret-messages.tsx # All users' messages
│   ├── ui/                           # Reusable UI components
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── error-boundary.tsx            # Error boundary component
│   ├── form-message.tsx              # Secret message form
│   └── recommended-users.tsx         # User discovery
│
├── lib/                              # Application logic
│   ├── hooks.ts                      # Redux typed hooks
│   ├── providers/                    # Context providers
│   │   └── redux-provider.tsx       # Redux store provider
│   ├── slices/                       # Redux slices
│   │   ├── auth-slice.ts            # Authentication state
│   │   ├── secret-message-silce.ts  # Secret messages state
│   │   └── user-slice.ts            # User & friends state
│   ├── store.ts                      # Redux store configuration
│   └── utils.ts                      # Utility functions
│
├── types/                            # TypeScript type definitions
│   └── index.ts                      # Shared types
│
├── utils/                            # Utility functions
│   ├── supabase/                     # Supabase clients
│   │   ├── client.ts                # Client-side Supabase
│   │   ├── server.ts                # Server-side Supabase
│   │   └── middleware.ts            # Middleware utilities
│   ├── logger.tsx                    # Logging utilities
│   └── test-utils.tsx                # Testing utilities
│
└── public/                           # Static assets
```

---

## 🧪 Running Tests

**Run tests in watch mode:**
```bash
pnpm run test
```

**Run tests once:**
```bash
pnpm run test:run
```

**Test coverage:**
```bash
pnpm run test:coverage
```

**Test UI (interactive):**
```bash
pnpm run test:ui
```

---

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **profiles**: User profile information (nickname, avatar, etc.)
- **messages**: Secret messages with content and optional images. Real-time chat messages between friends.
- **friends**: Friend relationships between users
- **friend_requests**: Pending friend request status

### Supabase Storage
- **message-images**: Bucket for storing message images

---

## 🔧 Development Tips

### Project Structure
- **Pages**: Located in `app/(authenticated)/` for protected routes
- **Components**: Reusable UI components in `components/`
- **State Management**: Redux slices in `lib/slices/`
- **API Routes**: Server actions and API endpoints in `app/api/` and `components/forms/action.ts`

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

### Real-time Features
The app uses Supabase Realtime subscriptions for:
- Live message updates
- Friend request notifications
- Chat message synchronization
- Friend list updates

Custom hooks in `components/hooks/` handle real-time subscriptions:
- `use-realtime-messages.ts`
- `use-realtime-friends.ts`
- `use-realtime-friend-requests.ts`
- `use-realtime-get-profiles.ts`

### State Management
Redux Toolkit manages:
- **Auth State**: User authentication, tokens, session
- **User State**: Friends, friend requests, profiles, selected friend
- **Secret Message State**: Messages, selected message

### Styling
- Tailwind CSS v4 with custom configuration
- Responsive design with mobile-first approach
- Custom UI components built on Radix UI primitives

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/introduction/getting-started)
- [Radix Primitives Docs](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hook Form Docs](https://react-hook-form.com/get-started)
- [Zod Docs](https://zod.dev/)
- [Vitest Docs](https://vitest.dev/guide/)

---

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for deployment options.

**Note**: Ensure all environment variables are set in your deployment platform.

---

## 🧪 Testing Coverage

The project includes comprehensive test coverage for:
- Form validation (auth forms, message forms)
- Component rendering
- User interactions
- Redux state management
- API integrations

<img width="1630" height="1167" alt="Testing Coverage" src="https://github.com/user-attachments/assets/5d7bc9fe-9218-4665-b654-ad53028cd1ed" />

---

## 📝 License

This project is private and proprietary.

