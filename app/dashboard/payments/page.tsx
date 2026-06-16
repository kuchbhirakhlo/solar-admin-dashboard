import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, Download, Filter } from 'lucide-react';

const PAYMENTS_DATA = [
  {
    id: 'INV-001',
    customer: 'John Smith',
    amount: '$2,450',
    date: '2024-01-15',
    status: 'completed',
    method: 'Credit Card',
  },
  {
    id: 'INV-002',
    customer: 'Sarah Johnson',
    amount: '$3,150',
    date: '2024-01-14',
    status: 'completed',
    method: 'Bank Transfer',
  },
  {
    id: 'INV-003',
    customer: 'Michael Chen',
    amount: '$1,890',
    date: '2024-01-13',
    status: 'pending',
    method: 'ACH',
  },
  {
    id: 'INV-004',
    customer: 'Emma Davis',
    amount: '$2,750',
    date: '2024-01-12',
    status: 'completed',
    method: 'Credit Card',
  },
  {
    id: 'INV-005',
    customer: 'Robert Wilson',
    amount: '$1,600',
    date: '2024-01-11',
    status: 'failed',
    method: 'Credit Card',
  },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payments & Invoices"
        description="Manage payments and generate invoices"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter size={20} className="mr-2" />
              Filters
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              New Invoice
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="px-6 py-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Collected', value: '$45,230', color: 'text-green-600' },
            { label: 'Pending', value: '$3,450', color: 'text-yellow-600' },
            { label: 'Failed', value: '$1,200', color: 'text-red-600' },
            {
              label: 'This Month',
              value: '$12,890',
              color: 'text-blue-600',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="px-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PAYMENTS_DATA.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {payment.customer}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status as any} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted">
                      <Download size={18} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
