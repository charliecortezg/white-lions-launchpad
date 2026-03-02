import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { ProspectFilters } from "@/components/admin/ProspectFilters";
import { NotesModal } from "@/components/admin/NotesModal";
import { ProspectDetailsModal } from "@/components/admin/ProspectDetailsModal";
import { CalendarModal } from "@/components/admin/CalendarModal";
import { RescheduleModal } from "@/components/admin/RescheduleModal";
import { TasksModal } from "@/components/admin/TasksModal";
import { WaitlistTable } from "@/components/admin/WaitlistTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;
type WaitlistRegistration = Tables<"waitlist_registrations">;

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [taskCount, setTaskCount] = useState(0);

  // Fetch task count for badge
  useEffect(() => {
    const fetchTaskCount = async () => {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      
      const { count } = await supabase
        .from('follow_up_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .lte('due_at', endOfToday.toISOString());
      
      setTaskCount(count || 0);
    };
    
    fetchTaskCount();
  }, []);

  // Fetch prospects via Edge Function
  const { data: prospects = [], isLoading, error } = useQuery({
    queryKey: ["admin-prospects"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "GET",
      });
      if (error) throw error;
      return data.data as Prospect[];
    },
  });

  // Fetch waitlist registrations
  const { data: waitlistRegistrations = [] } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "GET",
        headers: { "x-type": "waitlist" },
      });
      if (error) throw error;
      return data.data as WaitlistRegistration[];
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, status },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "Estado actualizado",
        description: "El prospecto se movió correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  // Mark attended mutation
  const markAttendedMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "mark_attended" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "¡Asistencia registrada!",
        description: "El prospecto asistió a su clase muestra.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar la asistencia.",
        variant: "destructive",
      });
      console.error("Mark attended error:", error);
    },
  });

  // Mark no-show mutation
  const markNoShowMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "mark_no_show" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "No asistió",
        description: "Se registró la inasistencia y se programó seguimiento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar la inasistencia.",
        variant: "destructive",
      });
      console.error("Mark no-show error:", error);
    },
  });

  // Mark enrolled mutation
  const markEnrolledMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "mark_enrolled" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "🏆 ¡Inscrito!",
        description: "¡Felicidades! El prospecto se convirtió en alumno.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo marcar como inscrito.",
        variant: "destructive",
      });
      console.error("Mark enrolled error:", error);
    },
  });

  // Mark lost mutation
  const markLostMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "mark_lost" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "Prospecto perdido",
        description: "El prospecto se marcó como perdido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo marcar como perdido.",
        variant: "destructive",
      });
      console.error("Mark lost error:", error);
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, newSchedule, trialStartAt }: { id: string; newSchedule: string; trialStartAt: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "reschedule", newSchedule, trialStartAt },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      setRescheduleModalOpen(false);
      setSelectedProspect(null);
      toast({
        title: "Reprogramado",
        description: "La clase muestra se reprogramó correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo reprogramar la clase.",
        variant: "destructive",
      });
      console.error("Reschedule error:", error);
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, notes },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      setNotesModalOpen(false);
      setSelectedProspect(null);
      toast({
        title: "Notas guardadas",
        description: "Las notas se actualizaron correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar las notas.",
        variant: "destructive",
      });
      console.error("Notes error:", error);
    },
  });

  // Delete prospect mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id, action: "delete" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prospects"] });
      toast({
        title: "Prospecto eliminado",
        description: "El registro fue eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el prospecto.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  // Filter prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = prospect.player_name.toLowerCase().includes(search);
        const matchesTutor = prospect.tutor_name.toLowerCase().includes(search);
        if (!matchesName && !matchesTutor) return false;
      }

      // Sport filter
      if (sportFilter !== "all") {
        const category = prospect.category.toLowerCase();
        if (sportFilter === "basketball") {
          if (!category.includes("basket") && !category.includes("baloncesto")) {
            return false;
          }
        } else if (sportFilter === "futbol") {
          if (category.includes("basket") || category.includes("baloncesto")) {
            return false;
          }
        }
      }

      // Category filter
      if (categoryFilter !== "all") {
        const category = prospect.category.toLowerCase();
        if (!category.includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [prospects, searchTerm, sportFilter, categoryFilter]);

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleOpenNotes = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setNotesModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este prospecto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDetailsModalOpen(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedProspect) {
      updateNotesMutation.mutate({ id: selectedProspect.id, notes });
    }
  };

  const handleMarkAttended = (prospect: Prospect) => {
    markAttendedMutation.mutate({ id: prospect.id });
  };

  const handleMarkNoShow = (prospect: Prospect) => {
    markNoShowMutation.mutate({ id: prospect.id });
  };

  const handleMarkEnrolled = (prospect: Prospect) => {
    markEnrolledMutation.mutate({ id: prospect.id });
  };

  const handleMarkLost = (prospect: Prospect) => {
    markLostMutation.mutate({ id: prospect.id });
  };

  const handleOpenReschedule = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setRescheduleModalOpen(true);
  };

  const handleReschedule = (prospectId: string, newDate: Date, newScheduleText: string) => {
    // Determine hour based on sport
    const isBasketball = selectedProspect?.category?.toLowerCase().includes("basket");
    const hour = isBasketball ? 18 : 18;
    const minute = isBasketball ? 30 : 0;
    
    // Create trial_start_at timestamp
    const trialStartAt = new Date(newDate);
    trialStartAt.setHours(hour, minute, 0, 0);
    
    rescheduleMutation.mutate({
      id: prospectId,
      newSchedule: newScheduleText,
      trialStartAt: trialStartAt.toISOString(),
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">No se pudieron cargar los datos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🦁</span>
            <h1 className="text-2xl font-bold text-foreground">
              WHITE LIONS - Panel de Seguimiento
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona el pipeline de clases muestra
          </p>
        </div>

        {/* Filters */}
        <ProspectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sportFilter={sportFilter}
          onSportChange={setSportFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onOpenCalendar={() => setCalendarModalOpen(true)}
          onOpenTasks={() => setTasksModalOpen(true)}
          taskCount={taskCount}
        />

        {/* Tabs: Prospectos / Lista de Espera */}
        <Tabs defaultValue="prospects" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="prospects">
              ⚽ Prospectos ({prospects.length})
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              🍼 Lista de Espera ({waitlistRegistrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prospects">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <KanbanBoard
                prospects={filteredProspects}
                onStatusChange={handleStatusChange}
                onOpenNotes={handleOpenNotes}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                onMarkAttended={handleMarkAttended}
                onMarkNoShow={handleMarkNoShow}
                onReschedule={handleOpenReschedule}
                onMarkEnrolled={handleMarkEnrolled}
                onMarkLost={handleMarkLost}
              />
            )}
          </TabsContent>

          <TabsContent value="waitlist">
            <WaitlistTable
              registrations={waitlistRegistrations}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </Tabs>

        {/* Details Modal */}
        <ProspectDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
        />

        {/* Calendar Modal */}
        <CalendarModal
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          prospects={prospects}
          waitlistRegistrations={waitlistRegistrations}
          onStatusChange={handleStatusChange}
          onViewDetails={handleViewDetails}
        />

        {/* Notes Modal */}
        <NotesModal
          isOpen={notesModalOpen}
          onClose={() => {
            setNotesModalOpen(false);
            setSelectedProspect(null);
          }}
          playerName={selectedProspect?.player_name || ""}
          currentNotes={selectedProspect?.notes || null}
          onSave={handleSaveNotes}
          isSaving={updateNotesMutation.isPending}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          isOpen={rescheduleModalOpen}
          onClose={() => {
            setRescheduleModalOpen(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
          onReschedule={handleReschedule}
          isLoading={rescheduleMutation.isPending}
        />

        {/* Tasks Modal */}
        <TasksModal
          isOpen={tasksModalOpen}
          onClose={() => setTasksModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
