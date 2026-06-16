import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-1 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight size={16} className="text-muted-foreground" />}
              <a
                href={breadcrumb.href || '#'}
                className="text-muted-foreground hover:text-foreground"
              >
                {breadcrumb.label}
              </a>
            </div>
          ))}
        </nav>
      )}

      {/* Title & Description */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Action Button */}
        {action && <div className="flex gap-2">{action}</div>}
      </div>
    </div>
  );
}
