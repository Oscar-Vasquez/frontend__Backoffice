"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Lista de frameworks disponibles
export const frameworks = [
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

export type Framework = (typeof frameworks)[number]

interface FrameworkSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function FrameworkSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar framework...",
  disabled = false,
  className,
}: FrameworkSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      setSelectedValue(currentValue)
      setOpen(false)
      
      if (onValueChange) {
        onValueChange(currentValue)
      }
    },
    [onValueChange]
  )

  const selectedFramework = React.useMemo(
    () => frameworks.find((framework) => framework.value === selectedValue),
    [selectedValue]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-background border-border/40 text-left font-normal",
            !selectedValue && "text-muted-foreground",
            className
          )}
        >
          {selectedFramework ? selectedFramework.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px] border-border/40">
        <Command className="w-full bg-background">
          <div className="flex items-center border-b border-border/30 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Buscar framework..."
              className="h-9 w-full border-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
          </div>
          <CommandEmpty>No se encontraron coincidencias.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={handleSelect}
                className="flex items-center py-2.5 px-2 cursor-pointer data-[selected=true]:bg-accent"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === framework.value
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{framework.label}</span>
                  {framework.description && (
                    <span className="text-xs text-muted-foreground">
                      {framework.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 