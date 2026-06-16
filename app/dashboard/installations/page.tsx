import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KANBAN_BOARD = {
  'to-do': [
    {
      id: '1',
      customer: 'Robert Wilson',
      system: '5.0 kW',
      date: 'Jan 25, 2024',
    },
    {
      id: '2',
      customer: 'Linda Garcia',
      system: '7.5 kW',
      date: 'Feb 1, 2024',
    },
  ],
  'in-progress': [
    {
      id: '3',
      customer: 'John Smith',
      system: '6.5 kW',
      date: 'Jan 15, 2024',
      progress: 75,
    },
    {
      id: '4',
      customer: 'Michael Chen',
      system: '5.0 kW',
      date: 'Jan 20, 2024',
      progress: 45,
    },
  ],
  'review': [
    {
      id: '5',
      customer: 'Sarah Johnson',
      system: '8.2 kW',
      date: 'Jan 10, 2024',
    },
  ],
  'completed': [
    {
      id: '6',
      customer: 'Emma Davis',
      system: '7.5 kW',
      date: 'Jan 5, 2024',
    },
    {
      id: '7',
      customer: 'David Martinez',
      system: '6.0 kW',
      date: 'Dec 28, 2023',
    },
  ],
};

const COLUMN_TITLES: Record<string, string> = {
  'to-do': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'completed': 'Completed',
};

export default function InstallationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Installation Workflow"
        description="Track installation progress across all projects"
      />

      {/* Kanban Board */}
      <div className="overflow-x-auto px-6 pb-6">
        <div className="inline-flex gap-6 min-w-full">
          {Object.entries(KANBAN_BOARD).map(([column, cards]) => (
            <div key={column} className="flex-shrink-0 w-96">
              {/* Column Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">
                  {COLUMN_TITLES[column]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cards.length} items
                </p>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 min-h-96">
                {cards.map((card: any) => (
                  <div
                    key={card.id}
                    className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all cursor-move"
                  >
                    {/* Card Header */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-foreground">
                        {card.customer}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {card.system}
                      </p>
                    </div>

                    {/* Progress */}
                    {card.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {card.progress}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${card.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {card.date}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        ID: {card.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
