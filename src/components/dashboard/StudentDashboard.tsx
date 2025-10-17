import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Clock, CheckCircle, AlertCircle, FileText, Settings as SettingsIcon, Search } from 'lucide-react';
import { getUserTickets, deleteTicket as deleteTicketFn, getCurrentUser } from '../../lib/mockData';
import { Ticket as TicketType } from '../../lib/mockData';
import { TicketCard } from '../tickets/TicketCard';
import { TicketForm } from '../tickets/TicketForm';
import { SettingsPage } from '../settings/SettingsPage';
import { useToast } from '../ui/toast-container';

export const StudentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [activeTab, setActiveTab] = useState<'my-tickets' | 'report' | 'settings'>('my-tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const loadTickets = () => {
    const user = getCurrentUser();
    if (user) {
      setTickets(getUserTickets(user.id));
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicketFn(ticketId);
      loadTickets();
      showToast('Ticket deleted successfully', 'success');
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTickets = filteredTickets.filter(t => t.status === 'pending');
  const approvedTickets = filteredTickets.filter(t => t.status === 'approved');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in-progress');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved');

  const stats = [
    { label: 'Pending', count: pendingTickets.length, icon: Clock, color: 'bg-[#FFC107]' },
    { label: 'Approved', count: approvedTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'In Progress', count: inProgressTickets.length, icon: AlertCircle, color: 'bg-[#3942A7]' },
    { label: 'Resolved', count: resolvedTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'Total', count: tickets.length, icon: FileText, color: 'bg-[#1B1F50]' },
  ];

  const tabs = [
    { id: 'my-tickets', label: 'My Tickets', icon: Ticket },
    { id: 'report', label: 'Report Issue', icon: AlertCircle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-[#1E1E1E] mb-2">Dashboard</h1>
        <p className="text-[#7A7A7A]">Manage your tickets and report issues</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-[#7A7A7A] mb-1">{stat.label}</p>
            <p className="text-[#1E1E1E]">{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                activeTab === tab.id
                  ? 'bg-[#3942A7] text-white'
                  : 'bg-white text-[#7A7A7A] hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'my-tickets' && (
          <motion.div
            key="my-tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all"
                />
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-[#7A7A7A] mb-4" />
                <h3 className="text-[#1E1E1E] mb-2">No tickets found</h3>
                <p className="text-[#7A7A7A]">
                  {searchQuery 
                    ? 'Try adjusting your search query' 
                    : "You haven't submitted any tickets yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onDelete={handleDeleteTicket}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'report' && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketForm onSuccess={loadTickets} />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SettingsPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
