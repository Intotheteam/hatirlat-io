"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showPercentageInside?: boolean;
  className?: string;
}

const CustomProgressBar = React.forwardRef<HTMLDivElement, CustomProgressBarProps>(
  ({ value = 0, max = 100, label, showPercentageInside = true, className, ...props }, ref) => {
    const percentage = Math.round((value / max) * 100);

    return (
      <div 
        ref={ref} 
        className={cn("relative w-full overflow-hidden rounded-full bg-secondary", className)} 
        style={{ height: '28px' }}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
          {showPercentageInside && percentage > 15 && (
            <span className="text-xs font-medium text-white drop-shadow">
              {percentage}%
            </span>
          )}
        </div>
        {!showPercentageInside && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-foreground">
              {percentage}%
            </span>
          </div>
        )}
        {showPercentageInside && percentage <= 15 && (
          <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground">
            {percentage}%
          </span>
        )}
      </div>
    );
  }
);

CustomProgressBar.displayName = "CustomProgressBar";

export { CustomProgressBar };