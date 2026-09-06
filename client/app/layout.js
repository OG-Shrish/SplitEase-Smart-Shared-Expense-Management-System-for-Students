import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'SplitEase',
  description: 'Smart Shared Expense Management System for Students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
