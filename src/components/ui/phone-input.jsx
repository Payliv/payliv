import React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { countries } from '@/lib/countries'
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'

const CustomPhoneInput = React.forwardRef(({ className, country: controlledCountry, onCountryChange, defaultCountry = 'CI', value, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledCountry, setUncontrolledCountry] = React.useState(defaultCountry);
  
  const country = controlledCountry !== undefined ? controlledCountry : uncontrolledCountry;
  const setCountry = controlledCountry !== undefined ? onCountryChange : setUncontrolledCountry;

  const handleCountryChange = (newCountryCode) => {
    if (setCountry) {
      setCountry(newCountryCode)
    }
    setOpen(false)
  }

  const selectedCountry = countries.find(c => c.value === country)

  return (
    <div className={cn('flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between rounded-r-none"
          >
            {selectedCountry ? (
              <>
                <span className="mr-2">{selectedCountry.flag}</span>
                <span>+{selectedCountry.dialCode}</span>
              </>
            ) : (
              'Select'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher un pays..." />
            <CommandList>
              <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
              <CommandGroup>
                {countries.map((c) => (
                  <CommandItem
                    key={c.value}
                    value={`${c.label} ${c.value} ${c.dialCode}`}
                    onSelect={() => handleCountryChange(c.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        country === c.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="mr-2">{c.flag}</span>
                    <span className="flex-1">{c.label}</span>
                    <span className="text-muted-foreground">+{c.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <PhoneInput
        ref={ref}
        country={country}
        value={value}
        className={cn(
          'flex h-10 w-full rounded-md rounded-l-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        {...props}
      />
    </div>
  )
})
CustomPhoneInput.displayName = 'CustomPhoneInput'

export { CustomPhoneInput as PhoneInput }