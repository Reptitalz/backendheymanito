
'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import {
  CountrySelector,
  CountrySelectorDropdown,
  usePhoneInput,
} from 'react-international-phone';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input, type InputProps } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ScrollArea } from './scroll-area';

interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (phone: string) => void;
  defaultCountry: any
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, defaultCountry, ...props }, ref) => {
    const {
      country,
      handlePhoneValueChange,
      inputRef,
      isInvalid,
      setCountry,
    } = usePhoneInput({
      defaultCountry: defaultCountry,
      value,
      onChange: (data) => {
        onChange(data.phone);
      },
    });

    return (
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex w-[140px] items-center justify-between',
                isInvalid && 'border-destructive',
              )}
              aria-label="Select a country"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center">
                  <span
                    className={cn(
                      'fi fis rounded-full',
                      country.iso2.toLowerCase(),
                    )}
                  />
                </span>
                <span>+{country.dialCode}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <CountrySelector
              selectedCountry={country.iso2}
              onSelect={(country) => setCountry(country.iso2)}
              renderMode="virtual"
              style={{
                height: '250px',
              }}
            >
              <ScrollArea className="h-[250px]">
                <CountrySelectorDropdown
                  listItemClassName="flex items-center gap-4 p-2 cursor-pointer hover:bg-accent"
                  showDialCodeInList
                  renderArrow={() => (
                    <span className="ml-auto h-4 w-4 opacity-50">
                      <ChevronsUpDown />
                    </span>
                  )}
                  renderListItem={({
                    country,
                    onSelect,
                    isSelected,
                    dialCode,
                  }) => (
                    <div
                      className={cn(
                        'flex items-center gap-4 p-2 cursor-pointer hover:bg-accent',
                        isSelected && 'bg-accent',
                      )}
                      onClick={() => onSelect(country)}
                    >
                      <span className="flex h-5 w-5 items-center">
                        <span
                          className={cn(
                            'fi fis rounded-full',
                            country.iso2.toLowerCase(),
                          )}
                        />
                      </span>
                      <span className="flex-grow">{country.name}</span>
                      <span className="text-muted-foreground">
                        +{dialCode}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  )}
                />
              </ScrollArea>
            </CountrySelector>
          </PopoverContent>
        </Popover>
        <Input
          ref={ref}
          className={cn(isInvalid && 'border-destructive', className)}
          onChange={handlePhoneValueChange}
          type="tel"
          value={value}
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

    