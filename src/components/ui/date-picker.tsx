import { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Locale } from 'date-fns';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  locale?: Locale;
  disabled?: boolean;
  dateLabel?: string;
  placeholder?: string;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  locale,
  disabled,
  dateLabel = 'Date',
  placeholder = 'Select date',
}: DatePickerProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setSelectedDate(d);
      else setSelectedDate(undefined);
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  useEffect(() => {
    if (selectedDate && onChange) {
      onChange(toDateString(selectedDate));
    }
  }, [selectedDate, onChange]);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date-picker" className="px-1">
        {dateLabel}
      </Label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className="justify-between font-normal"
            type="button"
            disabled={disabled}
          >
            {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            locale={locale}
            weekStartsOn={1}
            onSelect={(date) => {
              setSelectedDate(date || undefined);
              setPopoverOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
