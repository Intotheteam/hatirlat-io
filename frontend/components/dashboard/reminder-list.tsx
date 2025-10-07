"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock, 
  Mail, 
  MessageSquare, 
  Phone,
  Play,
  Pause
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Reminder } from "@/types";

interface ReminderListProps {
  reminders: Reminder[];
  onAction: (action: "edit" | "delete" | "toggle", reminder: Reminder) => void;
  title?: string;
}

const channelIcons: { [key: string]: React.ElementType } = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
};

export function ReminderList({ reminders, onAction, title = "Reminders" }: ReminderListProps) {
  const upcomingReminders = reminders
    .filter(r => new Date(r.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {upcomingReminders.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder, index) => {
                const Icon = reminder.type === "group" ? MessageSquare : Clock;
                const isActionable = reminder.status === "scheduled" || reminder.status === "paused";
                
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-2 rounded-full bg-secondary/20">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="font-semibold truncate">{reminder.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {new Date(reminder.dateTime).toLocaleString()} - {reminder.type}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {reminder.channels.map((channel) => {
                            const ChannelIcon = channelIcons[channel];
                            return ChannelIcon ? (
                              <ChannelIcon key={channel} className="h-4 w-4 text-muted-foreground" />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                      <Badge 
                        variant={reminder.status === "scheduled" ? "default" : 
                               reminder.status === "sent" ? "secondary" : 
                               reminder.status === "paused" ? "outline" : "destructive"}
                      >
                        {reminder.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAction("toggle", reminder)}
                        disabled={!isActionable}
                        title={reminder.status === "paused" ? "Resume" : "Pause"}
                      >
                        {reminder.status === "paused" ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onAction("edit", reminder)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onSelect={() => onAction("delete", reminder)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming reminders</p>
                <p className="text-sm mt-1">Create a new reminder to get started</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}