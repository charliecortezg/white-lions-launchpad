import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const REASONS = [
  "Mi hijo no se divirtió",
  "No se adaptó al grupo",
  "Problemas de horario",
  "Razones económicas",
  "Encontramos otra actividad",
  "Otra razón",
];

const Offboarding = () => {
  const { prospectId } = useParams<{ prospectId: string }>();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !prospectId) return;
    setIsSubmitting(true);
    try {
      // Insert offboarding form
      const { error: insertError } = await supabase
        .from("offboarding_forms" as any)
        .insert([{
          prospect_id: prospectId,
          reason,
          feedback: feedback || null,
        }]);

      if (insertError) throw insertError;

      // Update prospect status via edge function
      await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id: prospectId, action: "mark_refund_requested" },
      });

      setIsSubmitted(true);
      toast({
        title: "Formulario enviado",
        description: "Tu solicitud de reembolso ha sido registrada.",
      });
    } catch (error: any) {
      console.error("Offboarding error:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el formulario. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display uppercase">
            Solicitud Registrada
          </h1>
          <p className="text-muted-foreground font-body">
            Hemos recibido tu formulario de retroalimentación. Te contactaremos para procesar tu reembolso en los próximos días hábiles.
          </p>
          <p className="text-sm text-muted-foreground/70 font-body">
            Gracias por darnos la oportunidad. 🦁
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-4xl">🦁</span>
          <h1 className="text-2xl font-bold text-foreground font-display uppercase">
            Formulario de Retroalimentación
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            Lamentamos que la experiencia no haya sido la esperada. Tu retroalimentación nos ayuda a mejorar.
          </p>
        </div>

        <div className="bento-card p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-body">
              Al completar este formulario, tu solicitud de reembolso quedará registrada y nuestro equipo se pondrá en contacto contigo.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">¿Cuál es la razón principal?</label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ¿Algo más que quieras compartirnos? <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              placeholder="Tu retroalimentación nos ayuda a mejorar..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitud de reembolso"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Offboarding;
