import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Plus, Check } from 'lucide-react';
import Link from 'next/link';

const SUBSCRIPTION_PLANS = [
  {
    id: '1',
    name: 'Starter',
    price: '$99',
    period: 'per month',
    customers: 234,
    features: [
      'Up to 5 kW system',
      'Basic monitoring',
      'Monthly reports',
      'Email support',
    ],
  },
  {
    id: '2',
    name: 'Professional',
    price: '$249',
    period: 'per month',
    customers: 456,
    features: [
      'Up to 10 kW system',
      'Advanced monitoring',
      'Weekly reports',
      'Priority support',
      'Performance analytics',
    ],
  },
  {
    id: '3',
    name: 'Enterprise',
    price: '$499',
    period: 'per month',
    customers: 124,
    features: [
      'Unlimited system size',
      'Real-time monitoring',
      'Daily reports',
      '24/7 support',
      'Custom analytics',
      'Dedicated manager',
    ],
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Subscription Plans"
        description="Manage subscription tiers and customer subscriptions"
        action={
          <Link href="/dashboard/subscriptions/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              New Plan
            </Button>
          </Link>
        }
      />

      {/* Subscription Plans Grid */}
      <div className="px-6 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              {/* Header */}
              <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-primary">
                  {plan.price}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Subscribers */}
              <div className="my-4 rounded-lg bg-muted/50 px-4 py-2">
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold text-foreground">
                  {plan.customers}
                </p>
              </div>

              {/* Features */}
              <div className="border-t border-border pt-4">
                <h4 className="mb-3 font-semibold text-foreground">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={18} className="mt-0.5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <Button variant="outline" className="mt-6 w-full">
                Edit Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
