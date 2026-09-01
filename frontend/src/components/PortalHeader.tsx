import React from "react";

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  badgeText?: string;
}

export function PortalHeader({
  title,
  subtitle,
  actions,
  icon,
  className = "",
  badgeText = "Smart Command Center",
}: PortalHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 w-full shrink-0 border-b border-border-warm/80 bg-background/95 backdrop-blur-md px-6 py-2.5 shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[56px]">
        <div className="min-w-0 flex items-center gap-4">
          {icon && (
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold-muted text-gold shadow-xs">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight uppercase truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 max-w-3xl text-xs font-medium text-foreground/60 leading-snug truncate md:whitespace-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="shrink-0 flex items-center gap-3 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

