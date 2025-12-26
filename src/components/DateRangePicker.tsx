import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import type { DateRange } from '../types';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presetRanges = [
  { label: 'Last 12 hours', getValue: () => ({ from: subHours(new Date(), 12), to: new Date() }) },
  { label: 'Last 24 hours', getValue: () => ({ from: subHours(new Date(), 24), to: new Date() }) },
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Custom', getValue: () => ({ from: null, to: null }) },
];

export default function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<Date | null>(new Date());
  const [customToDate, setCustomToDate] = useState<Date | null>(new Date());

  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    if (preset.label === 'Custom') {
      setShowCustom(true);
    } else {
      onDateRangeChange(preset.getValue());
      setShowCustom(false);
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    onDateRangeChange({ ...dateRange, from: customFromDate, to: customToDate });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!dateRange.from || !dateRange.to) {
      return 'Select date range';
    }
    
    const fromStr = format(dateRange.from, 'MMM d, HH:mm');
    const toStr = format(dateRange.to, 'MMM d, HH:mm');
    return `${fromStr} - ${toStr}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 min-w-[250px]"
      >
        <Calendar className="w-4 h-4 text-gray-600" />
        <span className="flex-1 text-left text-sm font-medium truncate">
          {getDisplayText()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[999] min-w-[300px]">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Quick Select</h3>
          </div>
          <div className="p-2">
            {presetRanges.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 rounded transition-colors text-gray-700"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {showCustom && (
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="datetime-local"
                  value={customFromDate ? format(customFromDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setCustomFromDate(date);
                    
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="datetime-local"
                  value={customToDate ? format(customToDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setCustomToDate(date);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customFromDate || !customToDate}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
