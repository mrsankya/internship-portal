import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { DiGiBotModal } from './components/DiGiBotModal';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { SearchEventsPage } from './pages/SearchEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { EventItem } from './services/api';
import { api } from './services/api';

export function AppContent() {
  const { openAuthModal, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'discovery' | 'search' | 'dashboard' | 'admin'>('discovery');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event._id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExploreCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentTab('search');
  };

  const handleQuickRegister = async (event: EventItem) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      await api.registerForEvent(event._id);
      alert(`🎉 Registered successfully for ${event.title}! Your QR ticket is now ready in My Passes.`);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedEventId(null);
        }}
        openCreateModal={() => setCreateModalOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'search') setCurrentTab('search');
        }}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedEventId ? (
          <EventDetailsPage
            eventId={selectedEventId}
            onBack={handleBack}
            onOpenAuthModal={() => openAuthModal('login')}
          />
        ) : currentTab === 'discovery' ? (
          <EventDiscoveryPage
            events={events}
            onSelectEvent={handleSelectEvent}
            onExploreCategory={handleExploreCategory}
            onQuickRegister={handleQuickRegister}
            key={refreshTrigger}
          />
        ) : currentTab === 'search' ? (
          <SearchEventsPage
            events={events}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectEvent={handleSelectEvent}
            onQuickRegister={handleQuickRegister}
            key={refreshTrigger}
          />
        ) : currentTab === 'dashboard' ? (
          <StudentDashboardPage
            onSelectEvent={handleSelectEvent}
            key={refreshTrigger}
          />
        ) : (
          <AdminDashboardPage
            onEventCreatedOrUpdated={triggerRefresh}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            key={refreshTrigger}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Floating AI Assistant */}
      <AuthModal />
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={triggerRefresh}
      />
      <DiGiBotModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
