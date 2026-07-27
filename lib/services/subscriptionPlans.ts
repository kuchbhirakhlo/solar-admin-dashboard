export interface SubscriptionPlan {
  id?: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function addSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const { addFirestoreDoc } = await import('@/lib/hooks/useFirestore');
    const planId = await addFirestoreDoc('subscriptionPlans', {
      ...plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return planId;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add subscription plan');
  }
}

export async function updateSubscriptionPlan(planId: string, data: Partial<SubscriptionPlan>) {
  try {
    const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
    await updateFirestoreDoc('subscriptionPlans', planId, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update subscription plan');
  }
}

export async function deleteSubscriptionPlan(planId: string) {
  try {
    const { deleteFirestoreDoc } = await import('@/lib/hooks/useFirestore');
    await deleteFirestoreDoc('subscriptionPlans', planId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete subscription plan');
  }
}