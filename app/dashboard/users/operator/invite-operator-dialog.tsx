"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  EnvelopeClosedIcon,
  ReloadIcon,
  RocketIcon,
  StarIcon,
  IdCardIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { OperatorsService } from "@/app/services/operators.service";

const formSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(["Admin", "Operator", "Manager"]),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InviteOperatorDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "Operator",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      
      await OperatorsService.inviteOperator({
        email: data.email,
        role: data.role,
        message: data.message
      });

      toast.success("Invitación enviada exitosamente", {
        style: { background: "#22c55e", color: "white" },
        className: "modern-toast",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Error al enviar la invitación", {
        style: { background: "#ef4444", color: "white" },
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90"
        >
          <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
          Invitar usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 bg-white/95 backdrop-blur-xl border-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02] pointer-events-none" />
        
        <div className="p-8">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <RocketIcon className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Invitar nuevo operador
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-500 text-base">
              Envía una invitación por correo electrónico para unirse al sistema
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder="usuario@ejemplo.com" 
                          {...field}
                          className="h-12 pl-12 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        />
                        <EnvelopeClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 rounded-xl">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin" className="focus:bg-purple-50 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                              <StarIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Administrador</div>
                              <div className="text-xs text-gray-500">Acceso completo al sistema</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Manager" className="focus:bg-blue-50 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <IdCardIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Gerente</div>
                              <div className="text-xs text-gray-500">Gestión y supervisión</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Operator" className="focus:bg-emerald-50 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                              <PersonIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">Operador</div>
                              <div className="text-xs text-gray-500">Operaciones básicas</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Mensaje personalizado (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder="Escribe un mensaje personalizado para la invitación..." 
                          {...field}
                          className="h-12 bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 border-gray-200 hover:bg-gray-100 transition-all duration-200 rounded-xl"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-6 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 rounded-xl shadow-lg shadow-blue-600/20"
                >
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                  {isLoading ? (
                    <>
                      <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <EnvelopeClosedIcon className="mr-2 h-5 w-5" />
                      Enviar invitación
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 