"use client"

import * as ScrollArea from '@radix-ui/react-scroll-area';

export function ScrollAreaRoot({ children, className = '', ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <ScrollArea.Root className={`relative overflow-hidden ${className}`} {...props}>
      <ScrollArea.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-gray-800 transition-colors duration-150 ease-out hover:bg-gray-200 dark:hover:bg-gray-700"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-gray-800 transition-colors duration-150 ease-out hover:bg-gray-200 dark:hover:bg-gray-700"
        orientation="horizontal"
      >
        <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="bg-gray-100 dark:bg-gray-800" />
    </ScrollArea.Root>
  );
} 