# QuickPay 💸

Welcome to **QuickPay**, a cutting-edge payment solution designed to simplify transactions for both users and merchants. With intuitive interfaces and robust backend systems, QuickPay ensures seamless money transfers, balance management, and transaction tracking.

![QuickPay Dashboard](Quickpay_dashboard.png)

## 🚀 Features

- **User App**: A dedicated application for users to manage their finances, including:
  - **Dashboard**: Get an overview of your balance and recent activities.
  - **P2P Transactions**: Send money to peers effortlessly.
  - **Transfer**: Quick and secure money transfers.
  - **Transaction History**: Keep track of all your transactions.

- **Merchant App**: Tailored for merchants to handle payments and manage their accounts with ease.

- **Bank Webhook**: Integration for real-time banking updates and notifications.

- **Secure Authentication**: Powered by NextAuth for safe and reliable user authentication.

## 🛠️ Technology Stack

- **Frontend**: Built with Next.js, React, and Tailwind CSS for a modern, responsive UI.
- **Backend**: TypeScript for type-safe, scalable code.
- **Database**: Prisma ORM for efficient database management.
- **Monorepo**: Managed with Turbo for optimized builds and dependency management.
- **Linting**: ESLint for maintaining code quality across the project.

## 📦 Project Structure

QuickPay is organized as a monorepo with distinct packages and apps:

- `apps/user-app`: The user-facing application for personal finance management.
- `apps/merchant-app`: A specialized app for merchant payment processing.
- `apps/bank-webhook`: Backend service for bank integration.
- `packages/db`: Database schema and migrations using Prisma.
- `packages/ui`: Reusable UI components for consistent design.
- `packages/store`: State management utilities.

## 🔧 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quickpay.git
   cd quickpay
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the relevant directories and fill in the required values.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to see the app in action.

## 🤝 Contributing

We welcome contributions to QuickPay! Here's how you can help:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any inquiries or support, reach out to us at fazlul0127@gmail.com.

---

**QuickPay** - Simplifying payments, one transaction at a time. 💰
