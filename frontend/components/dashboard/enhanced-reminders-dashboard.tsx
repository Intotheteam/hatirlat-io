"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  AlertCircle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CustomProgressBar } from "@/components/ui/custom-progress-bar";
import { apiManager } from "@/services/api/apiManager";
import { useToast } from "@/hooks/use-toast";
import type { View, Reminder } from "@/types";
import EditReminderModal from "../edit-reminder-modal";
import { StatCard } from "./stat-card";
import { ReminderList } from "./reminder-list";
import { WelcomeCard } from "./welcome-card";
import { ActivityTimeline } from "./activity-timeline";

interface RemindersDashboardProps {
  onNavigate: (view: View, groupId?: string) => void;
}

export default function EnhancedRemindersDashboard({ onNavigate }: RemindersDashboardProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    groups: 0
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
        const total = fetchedReminders.length;
        const active = fetchedReminders.filter(r => r.status === "scheduled").length;
        const completed = fetchedReminders.filter(r => r.status === "sent").length;
        const groups = new Set(fetchedReminders.map(r => r.group.id)).size;
        
        setStats({ total, active, completed, groups });
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
        const total = updatedReminders.length;
        const active = updatedReminders.filter(r => r.status === "scheduled").length;
        const completed = updatedReminders.filter(r => r.status === "sent").length;
        const groups = new Set(updatedReminders.map(r => r.group.id)).size;
        
        setStats({ total, active, completed, groups });
        
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

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <WelcomeCard />
        <Button onClick={() => onNavigate("schedule")}>
          <Plus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reminders"
          value={stats.total.toString()}
          icon={Bell}
          color="bg-blue-500"
          onClick={() => onNavigate("schedules")}
        />
        <StatCard
          title="Active"
          value={stats.active.toString()}
          icon={Clock}
          color="bg-teal-500"
          onClick={() => onNavigate("schedules")}
        />
        <StatCard
          title="Completed"
          value={stats.completed.toString()}
          icon={CheckCircle}
          color="bg-teal-500"
          onClick={() => onNavigate("schedules")}
        />
        <StatCard
          title="Groups"
          value={stats.groups.toString()}
          icon={Users}
          color="bg-orange-500"
          onClick={() => onNavigate("groups")}
        />
      </div>

      {/* Completion Progress */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Completion Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium font-bold">{completionPercentage}%</span>
          </div>
          <CustomProgressBar value={completionPercentage} max={100} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Reminders */}
        <div className="lg:col-span-2">
          <ReminderList 
            reminders={reminders} 
            onAction={handleReminderAction} 
            title="Upcoming Reminders"
          />
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-1">
          <ActivityTimeline 
            activities={activityData}
            onNavigate={onNavigate}
          />
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