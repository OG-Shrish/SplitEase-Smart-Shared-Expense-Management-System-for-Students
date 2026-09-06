import Link from 'next/link';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-text mb-4">
          Split Expenses With <span className="text-primary">Ease</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The smart way for students, roommates, and small groups to manage shared expenses, automatically calculate balances, and simplify debts.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-4 bg-cards rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Track Everything</h3>
            <p className="text-gray-600 text-sm">Keep all your group expenses in one place. Never lose track of who paid for what.</p>
          </div>
          <div className="p-4 bg-cards rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Smart Splits</h3>
            <p className="text-gray-600 text-sm">Split equally, by exact amounts, or percentages. We handle the math.</p>
          </div>
          <div className="p-4 bg-cards rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Simplify Debts</h3>
            <p className="text-gray-600 text-sm">Our algorithm minimizes transactions so you can settle up quickly and easily.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
