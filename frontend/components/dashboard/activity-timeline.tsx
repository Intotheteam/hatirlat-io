"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Reminder } from "@/types";
import type { View } from "@/app/page";

interface ActivityTimelineProps {
  activities: Reminder[];
  onNavigate: (view: View) => void;
}

export function ActivityTimeline({ activities, onNavigate }: ActivityTimelineProps) {
  const getIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle className="h-4 w-4 text-teal-500 dark:text-teal-400" />;
      case "scheduled": return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case "paused": return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-teal-500 dark:bg-teal-400";
      case "scheduled": return "bg-blue-500 dark:bg-blue-400";
      case "paused": return "bg-yellow-500 dark:bg-yellow-400";
      default: return "bg-gray-500 dark:bg-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 py-2 border-b border-border last:border-0 last:pb-0"
                  onClick={() => onNavigate("schedules")}
                >
                  <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${getStatusColor(activity.status)}`}>
                    {getIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activities</p>
                <p className="text-sm mt-1">Your activities will appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}