import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  age_or_birth_year: z.string().min(1, "Este campo es requerido"),
  tutor_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  contact_phone: z.string().min(10, "Ingresa un teléfono válido"),
  category: z.string().min(1, "Selecciona una categoría"),
  preferred_location: z.string().min(1, "Selecciona una sede"),
  preferred_schedule: z.string().min(1, "Ingresa tu horario preferido"),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TrialClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrialClassModal = ({ open, onOpenChange }: TrialClassModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      player_name: "",
      age_or_birth_year: "",
      tutor_name: "",
      contact_phone: "",
      category: "",
      preferred_location: "",
      preferred_schedule: "",
      comments: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("trial_class_registrations")
        .insert([{
          player_name: data.player_name,
          age_or_birth_year: data.age_or_birth_year,
          tutor_name: data.tutor_name,
          contact_phone: data.contact_phone,
          category: data.category,
          preferred_location: data.preferred_location,
          preferred_schedule: data.preferred_schedule,
          comments: data.comments || null,
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu registro. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>

        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-navy text-center">
                Registra tu Clase Muestra
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center pt-2">
                Tu mejor versión inicia aquí.
              </p>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="player_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Nombre del jugador</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age_or_birth_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Edad o año de nacimiento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 10 años o 2014" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tutor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Nombre del tutor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: María López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Teléfono de contacto</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Ej: 6861234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Categoría deseada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="biberon">Biberón</SelectItem>
                          <SelectItem value="escuelita">Escuelita</SelectItem>
                          <SelectItem value="estrellita">Estrellita</SelectItem>
                          <SelectItem value="infantil">Infantil</SelectItem>
                          <SelectItem value="juvenil-a">Juvenil A</SelectItem>
                          <SelectItem value="juvenil-b">Juvenil B</SelectItem>
                          <SelectItem value="juvenil-c">Juvenil C</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Sede preferida</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sede" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hacienda-del-bosque">Hacienda del Bosque</SelectItem>
                          <SelectItem value="vicente-guerrero">Vicente Guerrero</SelectItem>
                          <SelectItem value="quinta-del-rey">Quinta del Rey</SelectItem>
                          <SelectItem value="otra">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Horario preferido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Lunes y Miércoles 4-6pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-navy">Comentarios opcionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Comparte cualquier información adicional..."
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Registro"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-navy"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-navy">¡Gracias!</h3>
            <p className="text-muted-foreground">
              Hemos recibido tu registro y nos pondremos en contacto contigo.
            </p>
            <Button
              variant="gold"
              onClick={handleClose}
              className="mt-6"
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrialClassModal;
