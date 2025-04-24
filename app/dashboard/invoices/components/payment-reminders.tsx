import { Checkbox } from "@/components/ui/checkbox";

interface Reminders {
  beforeDue: boolean;
  onDue: boolean;
  afterDue: boolean;
}

interface PaymentRemindersProps {
  reminders: {
    beforeDue: boolean;
    onDue: boolean;
    afterDue: boolean;
  };
  setReminders: (value: Reminders | ((prev: Reminders) => Reminders)) => void;
}

export function PaymentReminders({ reminders, setReminders }: PaymentRemindersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recordatorios de pago</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="reminder1"
            checked={reminders.beforeDue}
            onCheckedChange={(checked) => 
              setReminders((prev: Reminders) => ({
                ...prev, 
                beforeDue: checked === true
              }))
            }
          />
          <label htmlFor="reminder1">
            Enviar recordatorio 3 días antes del vencimiento
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="reminder2"
            checked={reminders.onDue}
            onCheckedChange={(checked) => 
              setReminders((prev: Reminders) => ({
                ...prev, 
                onDue: checked === true
              }))
            }
          />
          <label htmlFor="reminder2">
            Enviar recordatorio el día del vencimiento
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="reminder3"
            checked={reminders.afterDue}
            onCheckedChange={(checked) => 
              setReminders((prev: Reminders) => ({
                ...prev, 
                afterDue: checked === true
              }))
            }
          />
          <label htmlFor="reminder3">
            Enviar recordatorio si el pago está atrasado
          </label>
        </div>
      </div>
    </div>
  );
} 