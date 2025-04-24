"use client";

import Image from "next/image";

interface InvoicePDFTemplateProps {
  invoice: any;
}

export function InvoicePDFTemplate({ invoice }: InvoicePDFTemplateProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Header con diseño de líneas diagonales */}
      <div className="bg-black text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }} />
        <div className="flex justify-between items-center relative z-10">
			<div className="w-[300px] h-[100px] relative">
				<Image
					src="/images/LOGO-FACTURA.png"
					alt="Logo"
					width={300}
					height={100}
					className="object-scale-down"
					priority
				/>
			</div>
          <div>
            <h2 className="text-4xl font-bold mb-2">FACTURA</h2>
            <div className="text-right">
              <p>Factura: N° {invoice.numero}</p>
              <p>Fecha: {new Date(invoice.fechaEmision).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Información del cliente */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">INFORMACIÓN DEL CLIENTE</h3>
          <div className="space-y-2">
            <p><span className="font-semibold">NOMBRE:</span> {invoice.cliente?.name || invoice.cliente}</p>
            <p><span className="font-semibold">EMAIL:</span> {invoice.email}</p>
          </div>
        </div>

        {/* Tabla de items */}
        <table className="w-full mb-8">
          <thead className="bg-black text-white">
            <tr>
              <th className="py-2 px-4 text-left">DESCRIPCIÓN</th>
              <th className="py-2 px-4 text-right">PRECIO</th>
              <th className="py-2 px-4 text-right">CANTIDAD</th>
              <th className="py-2 px-4 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items?.map((item: { descripcion: string; precio: number; cantidad: number }, index: number) => (
              <tr key={index}>
                <td className="py-3 px-4">{item.descripcion}</td>
                <td className="py-3 px-4 text-right">${item.precio.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">{item.cantidad}</td>
                <td className="py-3 px-4 text-right">${(item.cantidad * item.precio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="w-1/2 ml-auto space-y-2">
          <div className="flex justify-between">
            <span>Sub-total</span>
            <span>${invoice.subtotal?.toFixed(2)}</span>
          </div>
          {invoice.descuento && (
            <div className="flex justify-between text-gray-600">
              <span>Descuento ({invoice.descuento.tipo === "porcentaje" ? `${invoice.descuento.valor}%` : null})</span>
              <span>-${(invoice.descuento.tipo === "porcentaje"
                ? invoice.subtotal * (invoice.descuento.valor / 100)
                : invoice.descuento.valor).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl pt-2 border-t border-black">
            <span>TOTAL</span>
            <span>${invoice.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Información de contacto y pago */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-2">CONTACTO</h4>
              <div className="space-y-1 text-sm">
                <p>contacto@workexpress.online</p>
                <p>www.workexpress.online</p>
                <p>6818-7751 | 63864733 | 6482-9251</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">INFORMACIÓN DE PAGO</h4>
              <div className="space-y-1 text-sm">
                <p>Banco: Banco General</p>
                <p>Cuenta: 0000-0000-0000</p>
                <p>Titular: Workexpress Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
