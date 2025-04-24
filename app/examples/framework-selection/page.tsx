"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Code, FileCheck, Monitor, CreditCard, BanknoteIcon, Wallet, Landmark, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Combobox, ComboboxOption } from "@/app/components/ui/combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Opciones de frameworks para el combobox
const frameworks: ComboboxOption[] = [
  {
    value: "next",
    label: "Next.js",
    description: "React framework con SSR y generación estática"
  },
  {
    value: "svelte",
    label: "SvelteKit",
    description: "Framework compilado con mínimo JS"
  },
  {
    value: "nuxt",
    label: "Nuxt.js",
    description: "Framework Vue con SSR y generación estática"
  },
  {
    value: "remix",
    label: "Remix",
    description: "Framework React centrado en APIs web nativas"
  },
  {
    value: "astro",
    label: "Astro",
    description: "Framework para sitios estáticos con islas interactivas"
  },
]

// Opciones de métodos de pago para el combobox
const paymentMethods: ComboboxOption[] = [
  {
    value: "credit-card",
    label: "Tarjeta de Crédito",
    description: "Visa, Mastercard, American Express",
    icon: <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
  },
  {
    value: "debit-card",
    label: "Tarjeta de Débito",
    description: "Débito inmediato de tu cuenta bancaria",
    icon: <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
  },
  {
    value: "cash",
    label: "Efectivo",
    description: "Pago en moneda local",
    icon: <BanknoteIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
  },
  {
    value: "wallet",
    label: "Monedero Digital",
    description: "PayPal, Apple Pay, Google Pay",
    icon: <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
  },
  {
    value: "transfer",
    label: "Transferencia Bancaria",
    description: "ACH, SEPA, Wire Transfer",
    icon: <Landmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
  }
]

export default function FrameworkSelectionExample() {
  const [selectedFramework, setSelectedFramework] = useState<string>()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>()
  const [darkMode, setDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState("frameworks")
  
  const toggleTheme = () => {
    setDarkMode(!darkMode)
    // Cambiar el tema del documento
    if (darkMode) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const handleSelectFramework = (value: string) => {
    setSelectedFramework(value)
  }

  const handleSelectPaymentMethod = (value: string) => {
    setSelectedPaymentMethod(value)
  }

  const selectedFrameworkDetails = frameworks.find(f => f.value === selectedFramework)
  const selectedPaymentMethodDetails = paymentMethods.find(p => p.value === selectedPaymentMethod)

  // Función para renderizar las opciones de métodos de pago de manera personalizada
  const renderPaymentMethodOption = (option: ComboboxOption, isSelected: boolean) => (
    <div className="flex items-center w-full">
      {/* Ícono a la izquierda */}
      <div className="mr-3 flex-shrink-0 bg-secondary/30 p-1.5 rounded-md">
        {option.icon}
      </div>
      
      {/* Información central */}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{option.label}</div>
        {option.description && (
          <div className="text-xs text-muted-foreground truncate">
            {option.description}
          </div>
        )}
      </div>
      
      {/* Indicador de selección a la derecha */}
      {isSelected && (
        <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'dark bg-[#121212]' : 'bg-slate-50'} flex flex-col items-center justify-center p-4`}>
      <Card className="w-full max-w-md mx-auto border border-border/40 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Ejemplos de ComboBox</CardTitle>
              <CardDescription>Diferentes estilos y configuraciones</CardDescription>
            </div>
            <Badge
              variant={darkMode ? "outline" : "secondary"}
              className="cursor-pointer flex items-center gap-1"
              onClick={toggleTheme}
            >
              <Monitor className="h-3 w-3" />
              {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="payment">Métodos de Pago</TabsTrigger>
            </TabsList>
            
            <TabsContent value="frameworks" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="framework-select">Framework</Label>
                <Combobox 
                  options={frameworks}
                  value={selectedFramework} 
                  onValueChange={handleSelectFramework} 
                  placeholder="Seleccionar framework..."
                  searchPlaceholder="Buscar framework..."
                  emptyMessage="No se encontraron frameworks"
                  popoverWidth="300px"
                />
              </div>
              
              {selectedFramework && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Framework seleccionado</span>
                  </h3>
                  <div className="bg-secondary/30 rounded-md p-3">
                    <div className="font-medium">{selectedFrameworkDetails?.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedFrameworkDetails?.description}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Code className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {selectedFrameworkDetails?.value}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="payment-method-select">Método de Pago</Label>
                <Combobox 
                  options={paymentMethods}
                  value={selectedPaymentMethod} 
                  onValueChange={handleSelectPaymentMethod} 
                  placeholder="Seleccionar método de pago..."
                  searchPlaceholder="Buscar método de pago..."
                  emptyMessage="No se encontraron métodos de pago"
                  popoverWidth="320px"
                  renderOption={renderPaymentMethodOption}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo con renderización personalizada de opciones incluyendo iconos
                </p>
              </div>
              
              {selectedPaymentMethod && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span>Método seleccionado</span>
                  </h3>
                  <div className="bg-secondary/30 rounded-md p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-background p-2 rounded-md">
                        {selectedPaymentMethodDetails?.icon}
                      </div>
                      <div>
                        <div className="font-medium">{selectedPaymentMethodDetails?.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedPaymentMethodDetails?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end border-t border-border/20 py-3">
          <Button 
            variant="default" 
            size="sm" 
            disabled={
              (activeTab === "frameworks" && !selectedFramework) || 
              (activeTab === "payment" && !selectedPaymentMethod)
            }
            className="gap-1"
          >
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 