"use client";

import { Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import {
  collectionSlotDates,
  collectionSlotsOnDate,
  findCollectionSlot,
  formatSlotClock,
  normalizeSlotTime,
  type CollectionSlot,
} from "@/services/collection-slots";

interface CollectionSlotPickerProps {
  slots: CollectionSlot[];
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateLabel: string;
  timeLabel: string;
  timePlaceholder: string;
  pickDateFirstLabel: string;
  loadError?: string | null;
  error?: string;
}

export default function CollectionSlotPicker({
  slots,
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel,
  timeLabel,
  timePlaceholder,
  pickDateFirstLabel,
  loadError,
  error,
}: CollectionSlotPickerProps) {
  const slotDates = collectionSlotDates(slots);
  const minSlotDate = slotDates[0];
  const maxSlotDate = slotDates[slotDates.length - 1];
  const daySlots = collectionSlotsOnDate(slots, date).sort((a, b) =>
    normalizeSlotTime(a.start_time).localeCompare(
      normalizeSlotTime(b.start_time),
    ),
  );
  const timesForSelectedDate = daySlots.map((slot) =>
    normalizeSlotTime(slot.start_time),
  );
  const timeOptions = daySlots.map((slot) => ({
    key: normalizeSlotTime(slot.start_time),
    label: `${formatSlotClock(slot.start_time)} – ${formatSlotClock(slot.end_time)}`,
  }));

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input
        label={dateLabel}
        type="date"
        min={minSlotDate}
        max={maxSlotDate}
        value={date}
        error={error || loadError || undefined}
        onChange={(event) => {
          const nextDate = event.target.value;
          if (nextDate && !slotDates.includes(nextDate)) {
            onDateChange("");
            onTimeChange("");
            return;
          }
          onDateChange(nextDate);
          if (time && !findCollectionSlot(slots, nextDate, time)) {
            onTimeChange("");
          }
        }}
      />
      <Select
        label={timeLabel}
        placeholder={date ? timePlaceholder : pickDateFirstLabel}
        options={timeOptions}
        value={time}
        disabled={!date || timeOptions.length === 0}
        onChange={(value) => {
          if (!timesForSelectedDate.includes(value)) return;
          onTimeChange(value);
        }}
      />
    </div>
  );
}
