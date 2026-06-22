'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  return <div className={cn('', className)}>{children}</div>;
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return <h2 className={cn('text-xl font-semibold text-foreground', className)}>{children}</h2>;
};

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
};

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return <div className={cn('mt-6 flex justify-end gap-2', className)}>{children}</div>;
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};