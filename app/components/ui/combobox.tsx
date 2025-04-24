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

export type ComboboxOption = {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  popoverWidth?: string
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode
  triggerClassName?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar opción",
  emptyMessage = "No se encontraron coincidencias",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className,
  popoverWidth = "300px",
  renderOption,
  triggerClassName,
}: ComboboxProps) {
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

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  )

  const defaultRenderOption = (option: ComboboxOption, isSelected: boolean) => (
    <>
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex flex-col">
        <span className="font-medium">{option.label}</span>
        {option.description && (
          <span className="text-xs text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    </>
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
            triggerClassName
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("p-0 border-border/40", className)} 
        style={{ width: popoverWidth }}
      >
        <Command className="w-full bg-background">
          <div className="flex items-center border-b border-border/30 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder={searchPlaceholder}
              className="h-9 w-full border-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
          </div>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
                className="flex items-center py-2.5 px-2 cursor-pointer data-[selected=true]:bg-accent"
              >
                {renderOption ? 
                  renderOption(option, selectedValue === option.value) : 
                  defaultRenderOption(option, selectedValue === option.value)
                }
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 