import React, { useState } from 'react';
    import { Check, ChevronsUpDown, X } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { Button } from '@/components/ui/button';
    import {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    } from '@/components/ui/command';
    import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from '@/components/ui/popover';
    import { Badge } from '@/components/ui/badge';

    export function SearchableSelect({ options, value, onValueChange, placeholder, allowCreate = false, isMulti = false, className }) {
      const [open, setOpen] = useState(false);
      const [inputValue, setInputValue] = useState('');

      if (!isMulti) {
        const safeValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
        const selectedOption = options.find(
          (option) => String(option.value).toLowerCase() === safeValue.toLowerCase()
        );

        const handleSingleSelect = (currentValue) => {
          const selectedVal = options.find(o => o.label.toLowerCase() === currentValue.toLowerCase())?.value;
          onValueChange(selectedVal || '');
          setInputValue('');
          setOpen(false);
        };
        
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn("w-full justify-between font-normal", className)}
              >
                {selectedOption ? (
                  <div className="flex items-center truncate">
                    {selectedOption.flag && <span className="mr-2">{selectedOption.flag}</span>}
                    {selectedOption.label}
                  </div>
                ) : (
                   safeValue || <span className="text-muted-foreground">{placeholder || "Select an option..."}</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput 
                  placeholder={placeholder || "Rechercher..."} 
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty>{allowCreate && inputValue ? 'Aucun résultat. Tapez pour créer.' : 'Aucun résultat.'}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={handleSingleSelect}
                      >
                        <Check className={cn("mr-2 h-4 w-4", String(option.value).toLowerCase() === safeValue.toLowerCase() ? "opacity-100" : "opacity-0")} />
                        {option.flag && <span className="mr-2">{option.flag}</span>}
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }

      // Multi-select logic
      const safeValues = Array.isArray(value) ? value : [];
      const selectedOptions = options.filter(option => safeValues.includes(option.value));

      const handleMultiSelect = (option) => {
        const newValues = safeValues.includes(option.value)
          ? safeValues.filter((v) => v !== option.value)
          : [...safeValues, option.value];
        onValueChange(newValues);
        setInputValue('');
      };

      const handleUnselect = (e, val) => {
        e.stopPropagation();
        onValueChange(safeValues.filter((v) => v !== val));
      };

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className={cn("flex flex-wrap gap-1 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[40px] cursor-text", className)}>
              <div className="flex flex-wrap gap-1 flex-grow">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map(option => (
                    <Badge key={option.value} variant="secondary" className="pl-2">
                      {option.label}
                      <button className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={(e) => handleUnselect(e, option.value)}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">{placeholder || "Select options..."}</span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Rechercher..." value={inputValue} onValueChange={setInputValue} />
              <CommandList>
                <CommandEmpty>Aucun résultat.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleMultiSelect(option)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", safeValues.includes(option.value) ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }