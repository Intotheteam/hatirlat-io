"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Bell, 
  Users, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  Target,
  MessageSquare,
  PieChart
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CustomProgressBar } from "@/components/ui/custom-progress-bar";
import { apiManager } from "@/services/api/apiManager";
import { useToast } from "@/hooks/use-toast";
import type { View, Reminder } from "@/types";
import EditReminderModal from "../edit-reminder-modal";

interface PremiumDashboardProps {
  onNavigate: (view: View, groupId?: string) => void;
}

interface StatsData {
  total: number;
  active: number;
  completed: number;
  groups: number;
  overdue: number;
  today: number;
}

export default function PremiumDashboard({ onNavigate }: PremiumDashboardProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    active: 0,
    completed: 0,
    groups: 0,
    overdue: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const { toast } = useToast();

  // Fetch reminders and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedReminders = await apiManager.getReminders();
        setReminders(fetchedReminders);
        
        // Calculate stats
        const now = new Date();
        const total = fetchedReminders.length;
        const active = fetchedReminders.filter(r => r.status === "scheduled").length;
        const completed = fetchedReminders.filter(r => r.status === "sent").length;
        const groups = new Set(fetchedReminders.map(r => r.group.id)).size;
        const overdue = fetchedReminders.filter(r => 
          new Date(r.dateTime) < now && r.status === "scheduled"
        ).length;
        const today = fetchedReminders.filter(r => {
          const reminderDate = new Date(r.dateTime);
          const todayDate = new Date();
          return reminderDate.toDateString() === todayDate.toDateString() && r.status === "scheduled";
        }).length;
        
        setStats({ total, active, completed, groups, overdue, today });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReminderAction = async (action: "edit" | "delete" | "toggle", reminder: Reminder) => {
    if (action === "edit") {
      setSelectedReminder(reminder);
      setEditModalOpen(true);
    } 
    else if (action === "delete") {
      try {
        await apiManager.deleteReminder(reminder.id);
        const updatedReminders = reminders.filter(r => r.id !== reminder.id);
        setReminders(updatedReminders);
        // Recalculate stats
        const now = new Date();
        const total = updatedReminders.length;
        const active = updatedReminders.filter(r => r.status === "scheduled").length;
        const completed = updatedReminders.filter(r => r.status === "sent").length;
        const groups = new Set(updatedReminders.map(r => r.group.id)).size;
        const overdue = updatedReminders.filter(r => 
          new Date(r.dateTime) < now && r.status === "scheduled"
        ).length;
        const today = updatedReminders.filter(r => {
          const reminderDate = new Date(r.dateTime);
          const todayDate = new Date();
          return reminderDate.toDateString() === todayDate.toDateString() && r.status === "scheduled";
        }).length;
        
        setStats({ total, active, completed, groups, overdue, today });
        
        toast({
          title: "Success",
          description: "Reminder deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete reminder",
          variant: "destructive"
        });
      }
    }
    else if (action === "toggle") {
      try {
        const newStatus = reminder.status === "scheduled" ? "paused" : "scheduled";
        const updatedReminder = await apiManager.updateReminder(reminder.id, { ...reminder, status: newStatus });
        setReminders(reminders.map(r => r.id === reminder.id ? updatedReminder : r));
        
        // Recalculate stats after toggle
        const now = new Date();
        const active = reminders.map(r => r.id === reminder.id ? {...r, status: newStatus} : r)
          .filter(r => r.status === "scheduled").length;
        const overdue = reminders.map(r => r.id === reminder.id ? {...r, status: newStatus} : r)
          .filter(r => new Date(r.dateTime) < now && r.status === "scheduled").length;
        const today = reminders.map(r => r.id === reminder.id ? {...r, status: newStatus} : r)
          .filter(r => {
            const reminderDate = new Date(r.dateTime);
            const todayDate = new Date();
            return reminderDate.toDateString() === todayDate.toDateString() && r.status === "scheduled";
          }).length;
        
        setStats(prev => ({
          ...prev,
          active,
          overdue,
          today
        }));
        
        toast({
          title: "Success",
          description: `Reminder ${newStatus}`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update reminder status",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveReminder = async (updatedReminder: Reminder) => {
    try {
      const savedReminder = await apiManager.updateReminder(updatedReminder.id, updatedReminder);
      setReminders(reminders.map(r => r.id === updatedReminder.id ? savedReminder : r));
      setEditModalOpen(false);
      toast({
        title: "Success",
        description: "Reminder updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    }
  };

  // Prepare data for activity timeline
  const activityData = reminders
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  // Calculate completion percentage
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Get upcoming reminders
  const upcomingReminders = reminders
    .filter(r => new Date(r.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Welcome section skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>

        {/* Quick Tips skeleton */}
        <Skeleton className="h-40 rounded-2xl" />

        {/* Upcoming Reminders and Channel Distribution side-by-side skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <Skeleton className="lg:col-span-7 h-80 rounded-2xl" />
          <Skeleton className="lg:col-span-3 h-80 rounded-2xl" />
        </div>

        {/* Compact Stats and Progress Section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Compact Stats Grid skeleton */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>

          {/* Combined Progress and Activity skeleton */}
          <div className="lg:col-span-2">
            <Skeleton className="h-60 rounded-2xl" />
          </div>
        </div>

        {/* Action Cards Row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Compact Welcome and Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        {/* Welcome Card */}
        <Card className="lg:w-2/5 rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20 shadow-md dark:shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <Button
                onClick={() => onNavigate("schedules")}
                size="sm"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-md rounded-full"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="lg:w-3/5 grid grid-cols-3 gap-3">
          <Card className="rounded-2xl border-2 border-indigo-200/60 dark:border-border/40 bg-gradient-to-br from-background to-indigo-50/30 dark:to-indigo-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                  <Activity className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Active</p>
                  <p className="text-lg font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-purple-200/60 dark:border-border/40 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                  <Calendar className="h-3.5 w-3.5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Today</p>
                  <p className="text-lg font-bold">{stats.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-pink-200/60 dark:border-border/40 bg-gradient-to-br from-background to-pink-50/30 dark:to-pink-950/10 shadow-md dark:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-200/50 dark:border-pink-500/20">
                  <Clock className="h-3.5 w-3.5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Overdue</p>
                  <p className="text-lg font-bold">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Stats & Performance */}
        <div className="lg:col-span-4 space-y-4">
          {/* Detailed Stats */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4 border-b border-border/30 dark:border-border/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Statistics Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/20">
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-medium">Total Reminders</span>
                </div>
                <Badge variant="secondary" className="text-xs">{stats.total}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-border/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-xs font-medium">Completed</span>
                </div>
                <Badge variant="secondary" className="text-xs">{stats.completed}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200/50 dark:border-border/20">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-pink-500" />
                  <span className="text-xs font-medium">Groups</span>
                </div>
                <Badge variant="secondary" className="text-xs">{stats.groups}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">Completion Rate</span>
                  <span className="text-xs font-bold">{completionPercentage}%</span>
                </div>
                <CustomProgressBar value={completionPercentage} max={100} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="text-center p-2 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/20">
                  <div className="text-sm font-bold">{stats.completed}</div>
                  <div className="text-[10px] text-muted-foreground">Done</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-border/20">
                  <div className="text-sm font-bold">{stats.active}</div>
                  <div className="text-[10px] text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Button
                onClick={() => onNavigate("schedules")}
                variant="outline"
                className="w-full justify-start rounded-xl text-xs h-9 border-border/40"
              >
                <Calendar className="mr-2 h-3.5 w-3.5" />
                View All Schedules
              </Button>
              <Button
                onClick={() => onNavigate("groups")}
                variant="outline"
                className="w-full justify-start rounded-xl text-xs h-9 border-border/40"
              >
                <Users className="mr-2 h-3.5 w-3.5" />
                Manage Groups
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Upcoming Reminders & Tips */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upcoming Reminders */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                    <Bell className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span>Upcoming Reminders</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("schedules")}
                  className="text-xs h-7 rounded-full"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                <AnimatePresence>
                  {upcomingReminders.length > 0 ? (
                    upcomingReminders.map((reminder, index) => (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-200/50 dark:border-border/40 bg-gradient-to-br from-background to-accent/10 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200/40 dark:border-indigo-500/20 shrink-0">
                            <Bell className="h-3.5 w-3.5 text-indigo-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-xs">{reminder.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[10px] text-muted-foreground truncate">
                                {new Date(reminder.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="flex gap-0.5">
                                {reminder.channels.slice(0, 2).map((channel) => {
                                  let icon = "📤";
                                  if (channel === 'email') icon = "✉️";
                                  else if (channel === 'sms') icon = "📱";
                                  else if (channel === 'whatsapp') icon = "💬";
                                  return (
                                    <span key={channel} className="text-[10px]" title={channel}>
                                      {icon}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleReminderAction("edit", reminder)}>
                              <Edit className="mr-2 h-3.5 w-3.5" />
                              <span className="text-xs">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => handleReminderAction("delete", reminder)}
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span className="text-xs">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <div className="mx-auto p-2.5 rounded-full bg-muted/30 w-10 h-10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="mt-3 text-sm font-medium">No upcoming reminders</h3>
                      <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/20">
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded bg-indigo-500/10 border border-indigo-200/40 dark:border-indigo-500/20 shrink-0">
                    <Bell className="h-3 w-3 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">Optimal Timing</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Schedule 1-2 hours before events</p>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-border/20">
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded bg-purple-500/10 border border-purple-200/40 dark:border-purple-500/20 shrink-0">
                    <MessageSquare className="h-3 w-3 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">Channel Selection</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">WhatsApp for urgent, Email for details</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Channels & Recent Activity */}
        <div className="lg:col-span-3 space-y-4">
          {/* Channel Distribution */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-200/50 dark:border-pink-500/20">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                </div>
                Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/50 dark:border-border/20 text-center">
                  <div className="text-base mb-0.5">✉️</div>
                  <div className="text-sm font-bold">{reminders.filter(r => r.channels.includes('email')).length}</div>
                  <p className="text-[10px] text-muted-foreground">Email</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-border/20 text-center">
                  <div className="text-base mb-0.5">📱</div>
                  <div className="text-sm font-bold">{reminders.filter(r => r.channels.includes('sms')).length}</div>
                  <p className="text-[10px] text-muted-foreground">SMS</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200/50 dark:border-border/20 text-center">
                  <div className="text-base mb-0.5">💬</div>
                  <div className="text-sm font-bold">{reminders.filter(r => r.channels.includes('whatsapp')).length}</div>
                  <p className="text-[10px] text-muted-foreground">WhatsApp</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-200/50 dark:border-border/20 text-center">
                  <div className="text-base mb-0.5">🔔</div>
                  <div className="text-sm font-bold">{reminders.filter(r => r.channels.includes('push')).length}</div>
                  <p className="text-[10px] text-muted-foreground">Push</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-2xl border-2 border-border/60 dark:border-border/40 bg-gradient-to-br from-background to-accent/5 shadow-md dark:shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                  <Activity className="h-4 w-4 text-indigo-500" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {activityData.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-background to-accent/10 border border-purple-200/50 dark:border-border/20"
                  >
                    <div className="p-1 rounded bg-purple-500/10 border border-purple-200/40 dark:border-purple-500/20 shrink-0">
                      <Clock className="h-3 w-3 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.status === "sent" ? "Completed" : "Scheduled"}
                      </p>
                    </div>
                  </div>
                ))}
                {activityData.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Edit Reminder Modal */}
      {selectedReminder && (
        <EditReminderModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          reminder={selectedReminder}
          onSave={handleSaveReminder}
        />
      )}
    </motion.div>
  );
}