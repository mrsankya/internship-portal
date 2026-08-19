import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { SubmitInternshipModal } from './components/SubmitInternshipModal';
import { DiGiBotModal } from './components/DiGiBotModal';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { SearchEventsPage } from './pages/SearchEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import type { EventItem } from './services/api';
import { api } from './services/api';

function getInitialTab(): 'discovery' | 'search' | 'dashboard' | 'admin' | 'super-admin' {
  if (typeof window === 'undefined') return 'discovery';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const tabParam = search.get('tab')?.toLowerCase();

  if (path.includes('super-admin') || path.includes('superadmin') || hash.includes('super-admin') || hash.includes('superadmin') || tabParam === 'super-admin' || tabParam === 'superadmin') {
    return 'super-admin';
  }
  if (path.includes('admin') || hash.includes('admin') || tabParam === 'admin') {
    return 'admin';
  }
  if (path.includes('dashboard') || hash.includes('dashboard') || tabParam === 'dashboard') {
    return 'dashboard';
  }
  if (path.includes('search') || path.includes('explore') || hash.includes('search') || tabParam === 'search') {
    return 'search';
  }
  return 'discovery';
}

export function AppContent() {
  const { openAuthModal, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'discovery' | 'search' | 'dashboard' | 'admin' | 'super-admin'>(getInitialTab);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync tab with browser URL history
  useEffect(() => {
    const handleUrlChange = () => {
      const tab = getInitialTab();
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleTabChange = (tab: 'discovery' | 'search' | 'dashboard' | 'admin' | 'super-admin') => {
    setCurrentTab(tab);
    setSelectedEventId(null);
    try {
      const url = tab === 'discovery' ? '/' : `/${tab}`;
      window.history.pushState(null, '', url);
    } catch {}
  };

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

  const handleOpenSubmitModal = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setSubmitModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        openCreateModal={() => setCreateModalOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'search') handleTabChange('search');
        }}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8">
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
            onOpenSubmitModal={handleOpenSubmitModal}
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
        ) : currentTab === 'super-admin' ? (
          <SuperAdminPage
            onNavigateTab={handleTabChange}
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
      <SubmitInternshipModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmitted={triggerRefresh}
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
