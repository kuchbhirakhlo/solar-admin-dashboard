'use client';

import { useState } from 'react';
import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Plus, Check, Edit2, Trash2, X } from 'lucide-react';
import { Subscription } from '@/lib/services/subscriptions';
import { SubscriptionPlan } from '@/lib/services/subscriptionPlans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/lib/services/subscriptionPlans';

export default function SubscriptionsPage() {
  const { data: subscriptions, loading: subscriptionsLoading, error: subscriptionsError } =
    useFirestoreCollectionRealtime<Subscription>('subscriptions');
  const { data: plans, loading: plansLoading, error: plansError } =
    useFirestoreCollectionRealtime<SubscriptionPlan>('subscriptionPlans');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'monthly' as 'monthly' | 'yearly',
    features: '',
    isActive: true,
  });

  const loading = subscriptionsLoading || plansLoading;
  const error = subscriptionsError || plansError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Failed to load subscriptions: {error}</p>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter((s) => s.status === 'active') ?? [];
  const subscriptionPlans = plans || [];

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        period: plan.period,
        features: plan.features.join('\n'),
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: '',
        period: 'monthly',
        features: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      period: 'monthly',
      features: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = formData.features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const planData = {
      name: formData.name,
      price: parseFloat(formData.price),
      period: formData.period,
      features: featuresArray,
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id!, planData);
      } else {
        await addSubscriptionPlan(planData);
      }
      handleCloseDialog();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save plan');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSubscriptionPlan(planId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete plan');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Subscription Plans"
        description="Manage subscription tiers and customer subscriptions"
        action={
          <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            New Plan
          </Button>
        }
      />

      {/* Subscription Plans Grid */}
      <div className="px-6 py-6">
        {subscriptionPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No subscription plans found</p>
            <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Create First Plan
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              const planSubscribers = activeSubscriptions.filter((s) => s.planId === plan.id).length;
              return (
                <div
                  key={plan.id}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      {!plan.isActive && (
                        <span className="inline-block mt-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(plan)}
                        className="h-8 w-8"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id!)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold text-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      per {plan.period}
                    </span>
                  </div>

                  {/* Subscribers */}
                  <div className="my-4 rounded-lg bg-muted/50 px-4 py-2">
                    <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    <p className="text-2xl font-bold text-foreground">
                      {planSubscribers}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update subscription plan details' : 'Add a new subscription plan to your offerings'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Plan Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter, Professional, Enterprise"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 8000"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Billing Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Up to 5 kW system&#10;Basic monitoring&#10;Monthly reports"
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Active (available for new subscriptions)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}