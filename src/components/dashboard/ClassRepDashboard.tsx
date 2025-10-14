import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Clock, CheckCircle, AlertCircle, FileText, Settings as SettingsIcon, Search, ClipboardList } from 'lucide-react';
import { getUserTickets, getTickets, deleteTicket as deleteTicketFn, updateTicket, getCurrentUser } from '../../lib/mockData';
import { Ticket as TicketType } from '../../lib/mockData';
import { TicketCard } from '../tickets/TicketCard';
import { TicketForm } from '../tickets/TicketForm';
import { SettingsPage } from '../settings/SettingsPage';
import { useToast } from '../ui/toast-container';

export const ClassRepDashboard: React.FC = () => {
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [activeTab, setActiveTab] = useState<'my-tickets' | 'review' | 'report' | 'settings'>('my-tickets');
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const loadTickets = () => {
    const user = getCurrentUser();
    if (user) {
      setMyTickets(getUserTickets(user.id));
      setAllTickets(getTickets());
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

  const handleApprove = (ticketId: string) => {
    updateTicket(ticketId, { status: 'approved' });
    loadTickets();
    showToast('Ticket approved successfully', 'success');
  };

  const handleReject = (ticketId: string) => {
    updateTicket(ticketId, { status: 'rejected' });
    loadTickets();
    showToast('Ticket rejected', 'info');
  };

  const user = getCurrentUser();
  const reviewTickets = allTickets.filter(t => t.userId !== user?.id);
  
  const filteredMyTickets = myTickets.filter(ticket => 
    ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviewTickets = reviewTickets
    .filter(t => t.status === reviewFilter)
    .filter(ticket => 
      ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pendingMyTickets = filteredMyTickets.filter(t => t.status === 'pending');
  const approvedMyTickets = filteredMyTickets.filter(t => t.status === 'approved');
  const inProgressMyTickets = filteredMyTickets.filter(t => t.status === 'in-progress');
  const resolvedMyTickets = filteredMyTickets.filter(t => t.status === 'resolved');

  const stats = [
    { label: 'Pending', count: pendingMyTickets.length, icon: Clock, color: 'bg-[#FFC107]' },
    { label: 'Approved', count: approvedMyTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'In Progress', count: inProgressMyTickets.length, icon: AlertCircle, color: 'bg-[#3942A7]' },
    { label: 'Resolved', count: resolvedMyTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'Total', count: myTickets.length, icon: FileText, color: 'bg-[#1B1F50]' },
  ];

  const tabs = [
    { id: 'my-tickets', label: 'My Tickets', icon: Ticket },
    { id: 'review', label: 'Review Tickets', icon: ClipboardList },
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
        <h1 className="text-[#1E1E1E] mb-2">Class Representative Dashboard</h1>
        <p className="text-[#7A7A7A]">Manage tickets and review student submissions</p>
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
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all whitespace-nowrap ${
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
                  placeholder="Search my tickets..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all"
                />
              </div>
            </div>

            {filteredMyTickets.length === 0 ? (
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
                {filteredMyTickets.map(ticket => (
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

        {activeTab === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setReviewFilter('pending')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  reviewFilter === 'pending'
                    ? 'bg-[#FFC107] text-[#1E1E1E]'
                    : 'bg-white text-[#7A7A7A] border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending ({reviewTickets.filter(t => t.status === 'pending').length})
              </button>
              <button
                onClick={() => setReviewFilter('approved')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  reviewFilter === 'approved'
                    ? 'bg-[#1DB954] text-white'
                    : 'bg-white text-[#7A7A7A] border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Approved ({reviewTickets.filter(t => t.status === 'approved').length})
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets to review..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all"
                />
              </div>
            </div>

            {filteredReviewTickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ClipboardList className="w-16 h-16 mx-auto text-[#7A7A7A] mb-4" />
                <h3 className="text-[#1E1E1E] mb-2">No tickets to review</h3>
                <p className="text-[#7A7A7A]">
                  {searchQuery 
                    ? 'Try adjusting your search query' 
                    : `There are no ${reviewFilter} tickets to review`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviewTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onApprove={reviewFilter === 'pending' ? handleApprove : undefined}
                    onReject={reviewFilter === 'pending' ? handleReject : undefined}
                    showActions={reviewFilter === 'pending'}
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
