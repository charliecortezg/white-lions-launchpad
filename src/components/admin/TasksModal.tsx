import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, Clock, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Task {
  id: string;
  prospect_id: string;
  type: string;
  due_at: string;
  status: string;
  assigned_to: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  prospect?: {
    player_name: string;
    tutor_name: string;
    contact_phone: string;
    category: string;
    preferred_location: string;
  };
}

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProspect?: (prospectId: string) => void;
}

const formatWhatsAppLink = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCode = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
  return `https://wa.me/${phoneWithCode}`;
};

export const TasksModal = ({
  isOpen,
  onClose,
  onViewProspect,
}: TasksModalProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Get today's end in Tijuana time
      const now = new Date();
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('follow_up_tasks')
        .select(`
          *,
          trial_class_registrations (
            player_name,
            tutor_name,
            contact_phone,
            category,
            preferred_location
          )
        `)
        .eq('status', 'open')
        .lte('due_at', endOfToday.toISOString())
        .order('due_at', { ascending: true });

      if (error) throw error;

      // Transform data to include prospect info
      const tasksWithProspects = (data || []).map(task => ({
        ...task,
        prospect: task.trial_class_registrations
      }));

      setTasks(tasksWithProspects);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Tarea completada",
        description: "La tarea se marcó como realizada",
      });

      // Remove from list
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la tarea",
        variant: "destructive",
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'call_no_show':
        return 'Llamar - No asistió';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tareas de Hoy
            {tasks.length > 0 && (
              <Badge variant="secondary">{tasks.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">
                ¡No hay tareas pendientes para hoy!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {getTaskTypeLabel(task.type)}
                    </Badge>
                    <h4 className="font-semibold text-foreground">
                      {task.prospect?.player_name || "Sin nombre"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {task.prospect?.category}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_at), "d MMM", { locale: es })}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {task.assigned_to}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Tutor: {task.prospect?.tutor_name}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <a
                    href={`tel:${task.prospect?.contact_phone}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      Llamar
                    </Button>
                  </a>
                  <a
                    href={formatWhatsAppLink(task.prospect?.contact_phone || "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 text-emerald-600 hover:text-emerald-700">
                      💬 WhatsApp
                    </Button>
                  </a>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={completingTaskId === task.id}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {completingTaskId === task.id ? "..." : "Done"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
