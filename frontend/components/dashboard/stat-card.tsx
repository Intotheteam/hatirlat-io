"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon: Icon, color, onClick }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={cn(
          "h-32 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg",
          onClick && "hover:bg-accent"
        )}
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className={`${color} p-3 rounded-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}