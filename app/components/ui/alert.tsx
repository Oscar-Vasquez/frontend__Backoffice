import { AlertCircle } from "lucide-react";

interface AlertErrorProps {
  message: string;
}

export function AlertError({ message }: AlertErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );
}