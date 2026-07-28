import { cn } from '@/lib/utils';

type Status =
  | 'active'
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'inactive';

const statusStyles: Record<
  Status,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  'in-progress': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  },
};

const statusLabels: Record<Status, string> = {
  active: 'Active',
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
  inactive: 'Inactive',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = statusStyles[status] || statusStyles.active;
  const label = statusLabels[status] || status;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        styles.bg,
        styles.text,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
      {label}
    </span>
  );
}
