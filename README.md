# 🚀 FinAI - AI Financial Advisor

A modern, professional web application built with Next.js 15, TypeScript, and shadcn/ui components. It's an AI-powered personal finance management platform that analyzes financial documents, provides insights, and offers intelligent recommendations through a conversational AI assistant.

## ✨ Features

- **AI-Powered Analysis** - Intelligent transaction categorization and financial insights
- **Interactive Dashboard** - Real-time financial metrics and visualizations
- **File Upload** - Support for CSV, Excel, and PDF financial documents
- **Spending Analysis** - Category-wise breakdown with interactive charts
- **Transaction Management** - Detailed transaction history with confidence scores
- **AI Chat Assistant** - Conversational AI for financial advice
- **User Authentication** - Secure login/signup with Clerk
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Mobile-first approach with desktop optimization

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Charts**: Recharts
- **Theme**: next-themes
- **File Upload**: react-dropzone

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account (free)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finai-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up Clerk Authentication:
   - Go to [clerk.com](https://clerk.com) and create a free account
   - Create a new application
   - Copy your publishable key and secret key
   - Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs (for development)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/     # Protected dashboard route
│   ├── login/         # Sign in page
│   ├── signup/        # Sign up page
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── ChatBot.tsx
│   ├── Dashboard.tsx
│   ├── FileUpload.tsx
│   ├── FinancialMetrics.tsx
│   ├── Header.tsx
│   ├── SpendingChart.tsx
│   └── TransactionList.tsx
├── data/
│   └── sampleData.ts
├── types/
│   └── index.ts
├── lib/
│   └── utils.ts
└── middleware.ts      # Clerk authentication middleware
```

## 🎨 Design System

- **Color Scheme**: Professional blue gradient with clean backgrounds
- **Typography**: Inter font family
- **Components**: Consistent shadcn/ui design system
- **Authentication**: Clerk's beautiful, customizable UI
- **Responsive**: Mobile-first design with desktop optimization

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Upload Data**: Drag & drop your financial files (CSV, Excel, PDF)
3. **View Dashboard**: See financial metrics, spending analysis, and transactions
4. **Chat with AI**: Click "AI Assistant" for personalized financial advice
5. **Toggle Theme**: Use the sun/moon icon for dark/light mode
6. **Sign Out**: Use the user button in the header to sign out

## 🎯 Key Components

- **Header**: Logo, AI badge, theme toggle, user menu, and chat button
- **Authentication**: Clerk-powered sign in/sign up with social providers
- **FileUpload**: Drag & drop interface with progress indicators
- **FinancialMetrics**: 4-card grid showing income, expenses, savings, and health score
- **SpendingChart**: Interactive pie chart for category-wise spending
- **TransactionList**: Scrollable list of recent transactions
- **ChatBot**: Sliding sidebar with AI chat interface

## 🔐 Authentication Features

- **Multiple Sign-in Methods**: Email/password, Google, GitHub, etc.
- **Protected Routes**: Dashboard requires authentication
- **User Management**: Profile management and sign out
- **Session Management**: Automatic session handling
- **Customizable UI**: Matches your app's design system

## 🎓 College Project Features

- **Modern Authentication**: Shows integration with third-party services
- **Professional UI**: Demonstrates modern web development practices
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works on all devices
- **Component Architecture**: Modular, reusable components

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, TypeScript, shadcn/ui, and Clerk**
