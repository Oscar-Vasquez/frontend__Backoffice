interface HistoryEntry {
  action: string;
  date: Date;
  user: string;
  details?: string;
}

export function InvoiceHistory({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Historial de la factura</h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex gap-4 text-sm">
            <div className="w-32 text-gray-500">
              {entry.date.toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">{entry.user}</span>
              <span className="text-gray-600"> {entry.action}</span>
              {entry.details && (
                <p className="text-gray-500 mt-1">{entry.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 