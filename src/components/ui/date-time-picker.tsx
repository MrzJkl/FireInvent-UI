import { useState, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Locale } from 'date-fns';

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  locale?: Locale;
  disabled?: boolean;
  dateLabel?: string;
  timeLabel?: string;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  locale,
  disabled,
  dateLabel = 'Date',
  timeLabel = 'Time',
  placeholder = 'Select date',
}: DateTimePickerProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('09:00');

  // Parse initial value when it changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime(
        `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      );
    } else {
      setSelectedDate(undefined);
      setSelectedTime('09:00');
    }
  }, [value]);

  // Update parent when date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime && onChange) {
      const [hours, minutes] = selectedTime.split(':');
      const dateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(hours),
        parseInt(minutes),
        0,
        0,
      );
      onChange(dateTime.toISOString());
    }
  }, [selectedDate, selectedTime, onChange]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3 flex-1">
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
                setSelectedDate(date);
                setPopoverOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          {timeLabel}
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          disabled={disabled}
          className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
