import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, FileText, Wrench, ClipboardCheck, Building2, Award } from 'lucide-react';

export type ProjectStatus =
  | 'registration'
  | 'upload_agreement'
  | 'installation'
  | 'project_commissioning'
  | 'discom_approval'
  | 'completed';

interface ProjectStatusBarProps {
  currentStatus: ProjectStatus;
  onChange?: (status: ProjectStatus) => void;
  readonly?: boolean;
  className?: string;
}

const statusStages: { value: ProjectStatus; label: string; icon: React.ElementType }[] = [
  { value: 'registration', label: 'Registration', icon: FileText },
  { value: 'upload_agreement', label: 'Upload Agreement', icon: FileText },
  { value: 'installation', label: 'Installation', icon: Wrench },
  { value: 'project_commissioning', label: 'Project Commissioning', icon: ClipboardCheck },
  { value: 'discom_approval', label: 'Discom Approval', icon: Building2 },
  { value: 'completed', label: 'Completed', icon: Award },
];

export function ProjectStatusBar({ 
  currentStatus, 
  onChange, 
  readonly = false,
  className 
}: ProjectStatusBarProps) {
  const currentIndex = statusStages.findIndex(s => s.value === currentStatus);

  const getStatusColor = (index: number) => {
    if (index < currentIndex) return 'text-green-600 bg-green-50 border-green-600';
    if (index === currentIndex) return 'text-blue-600 bg-blue-50 border-blue-600';
    return 'text-gray-400 bg-gray-50 border-gray-300';
  };

  const getIconColor = (index: number) => {
    if (index < currentIndex) return 'text-green-600';
    if (index === currentIndex) return 'text-blue-600';
    return 'text-gray-400';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {statusStages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = !readonly && !!onChange;

          return (
            <div key={stage.value} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onChange(stage.value)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                    getStatusColor(index),
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default'
                  )}
                  title={stage.label}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} className={getIconColor(index)} />
                  ) : (
                    <Icon size={24} className={getIconColor(index)} />
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p className={cn(
                    'text-xs font-medium whitespace-pre-line',
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  )}>
                    {stage.label}
                  </p>
                </div>
              </div>
              {index < statusStages.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 bg-gray-200">
                  <div
                    className={cn(
                      'h-full bg-green-600 transition-all',
                      isCompleted ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}