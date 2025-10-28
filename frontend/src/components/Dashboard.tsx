import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { CalendarEvent } from '../types';
import { EventList } from './EventList';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await api.getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      alert('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleToggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const result = await api.deleteEvents(Array.from(selectedIds));

      alert(`Successfully deleted ${result.succeeded} event(s).${result.failed > 0 ? ` Failed to delete ${result.failed} event(s).` : ''}`);

      setSelectedIds(new Set());
      setShowDeleteModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete events:', error);
      alert('Failed to delete events. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unplanr</h1>
              <p className="text-sm text-gray-600">Signed in as {user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Upcoming Events</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} event(s) selected`
                    : `${events.length} event(s) found`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  disabled={loading || events.length === 0}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedIds.size === events.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>

          <EventList
            events={events}
            selectedIds={selectedIds}
            onToggle={handleToggleEvent}
            loading={loading}
          />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          count={selectedIds.size}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
