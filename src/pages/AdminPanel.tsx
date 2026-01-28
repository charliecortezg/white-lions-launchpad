import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { ProspectFilters } from "@/components/admin/ProspectFilters";
import { NotesModal } from "@/components/admin/NotesModal";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

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

  const handleSaveNotes = (notes: string) => {
    if (selectedProspect) {
      updateNotesMutation.mutate({ id: selectedProspect.id, notes });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
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
        />

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <KanbanBoard
            prospects={filteredProspects}
            onStatusChange={handleStatusChange}
            onOpenNotes={handleOpenNotes}
          />
        )}

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
      </div>
    </div>
  );
};

export default AdminPanel;
