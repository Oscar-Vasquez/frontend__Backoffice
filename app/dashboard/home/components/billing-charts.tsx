import { Card } from "@/components/ui/card";
import { Scale, Package } from 'lucide-react';

function BillingCharts() {
  const facturacionData = {
    porMes: [
      { mes: 'Ene', cantidad: 980, libras: 12500 },
      { mes: 'Feb', cantidad: 1150, libras: 14200 },
      { mes: 'Mar', cantidad: 1247, libras: 15680 }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">Paquetes por Mes</h3>
          </div>
        </div>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end space-x-6">
            {facturacionData.porMes.map((mes, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-lg relative" 
                     style={{ height: `${(mes.cantidad / 1500) * 100}%` }}>
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium">
                    {mes.cantidad}
                  </span>
                </div>
                <span className="mt-2 text-sm text-slate-600 dark:text-slate-400">{mes.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Scale className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Libras por Mes</h3>
          </div>
        </div>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end space-x-6">
            {facturacionData.porMes.map((mes, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-green-100 dark:bg-green-900/20 rounded-t-lg relative" 
                     style={{ height: `${(mes.libras / 20000) * 100}%` }}>
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium">
                    {mes.libras.toLocaleString()}
                  </span>
                </div>
                <span className="mt-2 text-sm text-slate-600 dark:text-slate-400">{mes.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BillingCharts; 