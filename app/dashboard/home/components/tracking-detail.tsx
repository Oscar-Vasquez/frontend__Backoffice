import { Card } from "@/components/ui/card";
import { Package, MapPin, Truck, Clock, AlertTriangle, CheckCircle2, Phone, Mail } from 'lucide-react';

function TrackingDetail() {
  const envioActual = {
    codigo: 'RA8005',
    estado: 'En Tránsito',
    fechaCreacion: '2024-02-18 08:30',
    fechaEstimada: '2024-02-19 14:00',
    tiempoRestante: '5h 30min',
    origen: {
      ciudad: 'Valencia',
      pais: 'España',
      direccion: 'Av. del Puerto, 123',
      codigoPostal: '46021'
    },
    destino: {
      ciudad: 'Barcelona',
      pais: 'España',
      direccion: 'Carrer de Mallorca, 456',
      codigoPostal: '08013'
    },
    conductor: {
      nombre: 'Steve Scott',
      foto: '/avatars/steve.jpg',
      telefono: '+34 612 345 678',
      email: 'steve.s@workexpress.com',
      vehiculo: 'Ford Transit',
      matricula: '1234 ABC'
    },
    cliente: {
      nombre: 'María García',
      telefono: '+34 698 765 432',
      email: 'maria.g@email.com'
    },
    paquete: {
      peso: '12.5 kg',
      dimensiones: '60x40x30 cm',
      tipo: 'Frágil',
      valor: '€250.00'
    },
    progreso: [
      { estado: 'Recogido', completado: true, tiempo: '08:30' },
      { estado: 'En Tránsito', completado: true, tiempo: '10:15' },
      { estado: 'En Ciudad Destino', completado: false, tiempo: '14:45' },
      { estado: 'Entregado', completado: false, tiempo: '16:00' }
    ]
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-500">Envío #{envioActual.codigo}</span>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/20 rounded-full">
              {envioActual.estado}
            </span>
            <span className="text-xs text-slate-500">
              <Clock className="w-3 h-3 inline mr-1" />
              {envioActual.tiempoRestante} restantes
            </span>
          </div>
          <div className="mt-4 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Origen</p>
                <p className="text-sm font-medium">{envioActual.origen.ciudad}</p>
                <p className="text-xs text-slate-500">{envioActual.origen.direccion}</p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="h-[2px] bg-slate-200 dark:bg-slate-600 w-full absolute top-1/2 -translate-y-1/2">
                <div className="absolute left-0 w-1/2 h-full bg-blue-500"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-1 rounded-full border-2 border-blue-500">
                <Package className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Destino</p>
                <p className="text-sm font-medium">{envioActual.destino.ciudad}</p>
                <p className="text-xs text-slate-500">{envioActual.destino.direccion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Truck className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <img 
                  src={envioActual.conductor.foto} 
                  alt={envioActual.conductor.nombre}
                  className="w-6 h-6 rounded-full"
                />
                <p className="text-sm font-medium">{envioActual.conductor.nombre}</p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-slate-500">{envioActual.conductor.vehiculo}</p>
                <span className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded">
                  {envioActual.conductor.matricula}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <Phone className="w-3 h-3 text-blue-500" />
                </button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <Mail className="w-3 h-3 text-blue-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Detalles del Paquete</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Peso</p>
                <p className="font-medium">{envioActual.paquete.peso}</p>
              </div>
              <div>
                <p className="text-slate-500">Dimensiones</p>
                <p className="font-medium">{envioActual.paquete.dimensiones}</p>
              </div>
              <div>
                <p className="text-slate-500">Tipo</p>
                <p className="font-medium">{envioActual.paquete.tipo}</p>
              </div>
              <div>
                <p className="text-slate-500">Valor Declarado</p>
                <p className="font-medium">{envioActual.paquete.valor}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Progreso del Envío</p>
          <div className="space-y-4">
            {envioActual.progreso.map((paso, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  paso.completado 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {paso.completado ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{paso.estado}</p>
                    <p className="text-xs text-slate-500">{paso.tiempo}</p>
                  </div>
                  {index < envioActual.progreso.length - 1 && (
                    <div className="ml-3 mt-1 w-[2px] h-4 bg-slate-200 dark:bg-slate-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TrackingDetail; 