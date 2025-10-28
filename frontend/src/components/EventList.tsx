import { CalendarEvent } from '../types';

interface EventListProps {
  events: CalendarEvent[];
  selectedIds: Set<string>;
  onToggle: (eventId: string) => void;
  loading: boolean;
}

export function EventList({ events, selectedIds, onToggle, loading }: EventListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">No upcoming events found.</p>
      </div>
    );
  }

  const formatDate = (event: CalendarEvent) => {
    const dateStr = event.start.dateTime || event.start.date;
    if (!dateStr) return 'No date';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(event.start.dateTime && {
        hour: 'numeric',
        minute: '2-digit',
      }),
    });
  };

  return (
    <div className="divide-y divide-gray-200">
      {events.map((event) => (
        <div
          key={event.id}
          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
            selectedIds.has(event.id) ? 'bg-blue-50' : ''
          }`}
          onClick={() => onToggle(event.id)}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={selectedIds.has(event.id)}
              onChange={() => onToggle(event.id)}
              className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {event.summary || '(No title)'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{formatDate(event)}</p>
              {event.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
