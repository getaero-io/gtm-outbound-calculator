'use client';

interface InputSectionProps {
  meetingsNeeded: number;
  onMeetingsChange: (value: number) => void;
}

export function InputSection({ meetingsNeeded, onMeetingsChange }: InputSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Target Meetings per Month
        </label>
        <input
          type="number"
          min="1"
          value={meetingsNeeded}
          onChange={(e) => onMeetingsChange(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
        />
        <p className="mt-2 text-sm text-neutral-500">
          How many qualified meetings do you want to book each month?
        </p>
      </div>
    </div>
  );
}
