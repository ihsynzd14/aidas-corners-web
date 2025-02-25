"use client"

import * as Collapsible from '@radix-ui/react-collapsible';

export function CollapsibleRoot({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Collapsible.Root className={className} {...props}>
      {children}
    </Collapsible.Root>
  );
}

export function CollapsibleTrigger({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  asChild?: boolean;
}) {
  return (
    <Collapsible.Trigger className={className} {...props}>
      {children}
    </Collapsible.Trigger>
  );
}

export function CollapsibleContent({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <Collapsible.Content className={className} {...props}>
      {children}
    </Collapsible.Content>
  );
} 