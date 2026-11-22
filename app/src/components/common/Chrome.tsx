import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Inbox, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader({ title, subtitle, actions, className }: { title: string; subtitle?: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="hazard-stripes mb-2 h-1.5 w-16 rounded-[1px]" />
          <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-border via-border to-transparent" />
    </div>
  );
}

export function SectionHeader({ title, subtitle, actions, className }: { title: string; subtitle?: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
          <span className="inline-block h-3.5 w-1 bg-primary" />
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className, blueprint = false }: { children: ReactNode; className?: string; blueprint?: boolean }) {
  return (
    <div className={cn('panel-steel rounded-md', blueprint && 'blueprint-grid', className)}>
      {children}
    </div>
  );
}

export function LoadingState({ message = 'Loading operational data...', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground', className)}>
      <div className="relative">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
}

export function EmptyState({ title, message, action, className }: { title: string; message?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-md py-14 text-center', className)}>
      <Inbox className="h-8 w-8 text-muted-foreground/60" />
      <p className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">{title}</p>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }: { title?: string; message?: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 border border-red-500/30 bg-red-500/5 rounded-md py-12 text-center', className)}>
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <p className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">{title}</p>
      {message && <p className="max-w-md text-sm text-muted-foreground">{message}</p>}
      {onRetry && <Button variant="outline" onClick={onRetry} className="mt-1 border-border">Retry</Button>}
    </div>
  );
}

/** Construction-themed animated indicator used while the AI is thinking. */
export function AnalyzingIndicator({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  return (
    <div className="space-y-2">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="hazard-stripes absolute inset-y-0 w-1/4" style={{ animation: 'scanline 1.4s linear infinite' }} />
      </div>
      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <div key={s} className={cn(
            'flex items-center gap-2 text-xs font-mono-tech transition-opacity',
            i < activeStep ? 'text-emerald-400' : i === activeStep ? 'text-primary' : 'text-muted-foreground/50',
          )}>
            {i < activeStep ? (
              <span className="text-emerald-400">✓</span>
            ) : i === activeStep ? (
              <Wrench className="h-3 w-3 animate-spin" style={{ animationDuration: '2.5s' }} />
            ) : (
              <span className="inline-block h-3 w-3 text-center">·</span>
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
