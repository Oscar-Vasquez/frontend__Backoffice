# Módulo de Cierre de Caja

Este módulo permite gestionar cierres de caja diarios, agrupando las transacciones por método de pago y manteniendo un historial de cierres anteriores.

## Características principales

- Visualización del cierre de caja actual con total por método de pago
- Funcionalidad para cerrar caja con confirmación
- Historial de cierres de caja con filtrado por fechas
- Detalles completos de cada cierre

## Estructura de archivos

```
cashClosures/
├── components/                     # Componentes específicos del módulo
│   ├── cash-closure-actions.tsx    # Acciones como cerrar caja
│   ├── cash-closure-history.tsx    # Historial de cierres
│   ├── current-cash-closure.tsx    # Visualización del cierre actual
│   └── payment-method-summary.tsx  # Resumen de métodos de pago
├── mock-data.ts                    # Datos simulados para desarrollo
├── page.tsx                        # Página principal del módulo
├── prisma-model.ts                 # Referencia de modelo de datos (solo documentación)
├── README.md                       # Este archivo
└── sample-transactions.ts          # Datos de muestra para el backend
```

## Funcionamiento del cierre de caja

El cierre de caja funciona siguiendo estas reglas:

1. **Hora de corte**: El cierre se realiza a las 18:00 (6:00 PM). Las transacciones después de esta hora se contabilizan para el siguiente día.

2. **Agrupación por método de pago**: Las transacciones se agrupan por método de pago (efectivo, tarjeta, etc.), mostrando el total para cada uno.

3. **Estados del cierre**: Un cierre puede estar en estado "abierto" (open) o "cerrado" (closed).

## Integración con el backend

Este módulo consume los siguientes endpoints:

- `GET /api/cash-closures/current`: Obtiene el cierre de caja actual
- `GET /api/cash-closures/history`: Obtiene el historial de cierres de caja (con paginación)
- `POST /api/cash-closures/close`: Cierra la caja actual

En la fase de desarrollo, se utilizan datos simulados (mock-data.ts).

## Modelo de datos

Ver `prisma-model.ts` para una representación de cómo debería ser el modelo de datos en el backend con Prisma.

Para ayudar a los desarrolladores del backend, se incluye `sample-transactions.ts` con datos de muestra y una función (`generateCashClosureFromTransactions`) que ilustra cómo generar un cierre de caja a partir de transacciones. 