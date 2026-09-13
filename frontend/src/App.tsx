import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { ticketService } from './lib/api';

type AppView = 'dashboard' | 'create' | 'detail';

export function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  // Sync with browser hash for easy navigation and back/forward support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash || hash === 'tickets') {
        setView('dashboard');
        setSelectedTicketId(null);
      } else if (hash === 'tickets/new') {
        setView('create');
        setSelectedTicketId(null);
      } else if (hash.startsWith('tickets/')) {
        const id = hash.replace('tickets/', '').trim();
        if (id) {
          setSelectedTicketId(id);
          setView('detail');
        } else {
          setView('dashboard');
          setSelectedTicketId(null);
        }
      } else {
        // Fallback for any unknown hash route
        setView('dashboard');
        setSelectedTicketId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update open tickets count for the sidebar badge
  useEffect(() => {
    async function updateMetrics() {
      try {
        const m = await ticketService.getMetrics();
        setOpenTicketsCount(m.open);
      } catch (err: unknown) {
        console.error('Failed to update metrics count:', err);
      }
    }
    updateMetrics();
  }, [refreshTrigger]);

  const navigateToDashboard = () => {
    window.location.hash = '#/tickets';
    setView('dashboard');
    setSelectedTicketId(null);
  };

  const navigateToCreate = () => {
    window.location.hash = '#/tickets/new';
    setView('create');
    setSelectedTicketId(null);
  };

  const navigateToDetail = (ticketId: string) => {
    window.location.hash = `#/tickets/${ticketId}`;
    setSelectedTicketId(ticketId);
    setView('detail');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  // Build dynamic breadcrumbs based on state
  const breadcrumbs = [
    {
      label: 'Operations Console',
      onClick: navigateToDashboard,
    },
    {
      label: 'Tickets',
      onClick: view !== 'dashboard' ? navigateToDashboard : undefined,
    },
  ];

  if (view === 'create') {
    breadcrumbs.push({ label: 'Create Ticket', onClick: undefined });
  } else if (view === 'detail') {
    breadcrumbs.push({
      label: selectedTicketId ? `Ticket ${selectedTicketId}` : 'Ticket Detail',
      onClick: undefined,
    });
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={view}
        onNavigate={navigateToDashboard}
        openTicketsCount={openTicketsCount}
      />

      {/* Main App Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-900/50">
        {/* Top Header */}
        <Header
          breadcrumbs={breadcrumbs}
          onCreateClick={view !== 'create' ? navigateToCreate : undefined}
          onRefreshClick={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto">
          {view === 'dashboard' && (
            <DashboardPage
              onSelectTicket={navigateToDetail}
              onCreateTicket={navigateToCreate}
              refreshTrigger={refreshTrigger}
            />
          )}

          {view === 'create' && (
            <CreateTicketPage
              onCancel={navigateToDashboard}
              onSuccess={(ticketId) => navigateToDetail(ticketId)}
            />
          )}

          {view === 'detail' && selectedTicketId && (
            <TicketDetailPage
              ticketId={selectedTicketId}
              onBack={navigateToDashboard}
              onTicketUpdated={handleRefresh}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
