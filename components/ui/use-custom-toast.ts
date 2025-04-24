import { toast } from "@/components/ui/use-toast";

export const customToast = {
  success: ({ title, description }: { title: string; description: string }) => {
    toast({
      title,
      description,
      variant: "default",
      className: "bg-green-50 border-green-200 dark:bg-green-900/50",
    });
  },
  error: ({ title, description }: { title: string; description: string }) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  },
}; 