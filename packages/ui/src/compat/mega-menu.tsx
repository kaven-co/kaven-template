'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface MegaMenuSection {
  title: string;
  items: { label: string; href?: string; description?: string; icon?: React.ReactNode }[];
}

export interface MegaMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  sections?: MegaMenuSection[];
  columns?: number;
  trigger?: React.ReactNode;
}

const MegaMenu = React.forwardRef<HTMLDivElement, MegaMenuProps>(
  ({ className, open: controlledOpen, onClose, sections = [], columns = 3, trigger, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isOpen = controlledOpen ?? internalOpen;

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          onClose?.();
          setInternalOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    return (
      <div ref={ref} data-slot="mega-menu" className={cn('relative', className)} {...props}>
        <div ref={containerRef}>
          {trigger && (
            <div
              onClick={() => {
                if (controlledOpen === undefined) setInternalOpen(!internalOpen);
              }}
              className="cursor-pointer"
            >
              {trigger}
            </div>
          )}

          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-max min-w-[600px] max-w-[900px] rounded-xl border border-divider bg-background-paper p-6 shadow-xl">
              {sections.length > 0 ? (
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                  {sections.map((section, i) => (
                    <div key={i}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-disabled">
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item, j) => (
                          <li key={j}>
                            <a
                              href={item.href ?? '#'}
                              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
                            >
                              {item.icon && (
                                <span className="mt-0.5 shrink-0 [&_svg]:size-5 text-primary-main">
                                  {item.icon}
                                </span>
                              )}
                              <div>
                                <div className="text-sm font-medium text-text-primary">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-text-secondary mt-0.5">{item.description}</div>
                                )}
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                children
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
MegaMenu.displayName = 'MegaMenu';

export { MegaMenu };
