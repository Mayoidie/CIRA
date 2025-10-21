import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, FileText, Settings as SettingsIcon, Search, Users, Play } from 'lucide-react';
import { getTickets, getUsers, deleteTicket as deleteTicketFn, updateTicket, updateUser, saveUsers } from '../../lib/mockData';
import { Ticket as TicketType, User } from '../../lib/mockData';
import { TicketCard } from '../tickets/TicketCard';
import { SettingsPage } from '../settings/SettingsPage';
import { useToast } from '../ui/toast-container';

export const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'tickets' | 'users' | 'settings'>('tickets');
  const [ticketFilter, setTicketFilter] = useState<'approved' | 'in-progress' | 'resolved'>('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolutionNote, setResolutionNote] = useState<{ [key: string]: string }>({});
  const { showToast } = useToast();

  const loadData = () => {
    setTickets(getTickets());
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicketFn(ticketId);
      loadData();
      showToast('Ticket deleted successfully', 'success');
    }
  };

  const handleStatusChange = (ticketId: string, status: 'in-progress' | 'resolved') => {
    if (status === 'resolved') {
      const note = resolutionNote[ticketId];
      if (!note || note.trim() === '') {
        showToast('Please add a resolution note before marking as resolved', 'warning');
        return;
      }
      updateTicket(ticketId, { status, resolutionNote: note });
      setResolutionNote(prev => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });
    } else {
      updateTicket(ticketId, { status });
    }
    loadData();
    showToast(`Ticket marked as ${status.replace('-', ' ')}`, 'success');
  };

  const handleApproveClassRep = (userId: string) => {
    if (confirm('Approve this user as a Class Representative?')) {
      updateUser(userId, { role: 'class-representative', requestedRole: undefined });
      loadData();
      showToast('User approved as Class Representative', 'success');
    }
  };

  const handleRejectClassRep = (userId: string) => {
    if (confirm('Reject this Class Representative request?')) {
      updateUser(userId, { requestedRole: undefined });
      loadData();
      showToast('Class Representative request rejected', 'info');
    }
  };

  const filteredTickets = tickets
    .filter(t => t.status === ticketFilter)
    .filter(ticket => 
      ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const approvedTickets = tickets.filter(t => t.status === 'approved');
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const pendingClassReps = users.filter(u => u.requestedRole === 'class-representative');

  const stats = [
    { label: 'Approved', count: approvedTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'In Progress', count: inProgressTickets.length, icon: Play, color: 'bg-[#3942A7]' },
    { label: 'Resolved', count: resolvedTickets.length, icon: CheckCircle, color: 'bg-[#1DB954]' },
    { label: 'Total Tickets', count: tickets.length, icon: FileText, color: 'bg-[#1B1F50]' },
  ];

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
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
        <h1 className="text-[#1E1E1E] mb-2">Admin Dashboard</h1>
        <p className="text-[#7A7A7A]">Manage all tickets and user permissions</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setTicketFilter('approved')}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  ticketFilter === 'approved'
                    ? 'bg-[#1DB954] text-white'
                    : 'bg-white text-[#7A7A7A] border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Approved ({approvedTickets.length})
              </button>
              <button
                onClick={() => setTicketFilter('in-progress')}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  ticketFilter === 'in-progress'
                    ? 'bg-[#3942A7] text-white'
                    : 'bg-white text-[#7A7A7A] border border-gray-300 hover:bg-gray-50'
                }`}
              >
                In Progress ({inProgressTickets.length})
              </button>
              <button
                onClick={() => setTicketFilter('resolved')}
                className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  ticketFilter === 'resolved'
                    ? 'bg-[#1DB954] text-white'
                    : 'bg-white text-[#7A7A7A] border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Resolved ({resolvedTickets.length})
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
                    : `There are no ${ticketFilter.replace('-', ' ')} tickets`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map(ticket => (
                  <div key={ticket.id} className="space-y-4">
                    <TicketCard
                      ticket={ticket}
                      onDelete={handleDeleteTicket}
                    />
                    
                    {/* Admin Actions - Only show for approved and in-progress tickets */}
                    {ticketFilter !== 'resolved' && (
                      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                        {ticketFilter === 'approved' && (
                          <motion.button
                            onClick={() => handleStatusChange(ticket.id, 'in-progress')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3942A7] text-white rounded-lg hover:bg-[#3942A7]/90 transition-all"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Working</span>
                          </motion.button>
                        )}
                        
                        {ticketFilter === 'in-progress' && (
                          <div className="space-y-3">
                            <textarea
                              value={resolutionNote[ticket.id] || ''}
                              onChange={(e) => setResolutionNote(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                              placeholder="Add resolution note..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3942A7] transition-all"
                            />
                            <motion.button
                              onClick={() => handleStatusChange(ticket.id, 'resolved')}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1DB954] text-white rounded-lg hover:bg-[#1DB954]/90 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Mark as Resolved</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-[#1E1E1E] mb-6">Pending Class Representative Requests</h3>
            
            {pendingClassReps.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-[#7A7A7A] mb-4" />
                <h3 className="text-[#1E1E1E] mb-2">No pending requests</h3>
                <p className="text-[#7A7A7A]">There are no Class Representative requests to review</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingClassReps.map(user => (
                  <div key={user.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-[#1E1E1E] mb-2">{user.firstName} {user.lastName}</h4>
                      <p className="text-[#7A7A7A]">{user.email}</p>
                      <p className="text-[#7A7A7A]">Student ID: {user.studentId}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-[#FFC107] text-[#1E1E1E] rounded-full">
                        Requested: Class Representative
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleApproveClassRep(user.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1DB954] text-white rounded-lg hover:bg-[#1DB954]/90 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleRejectClassRep(user.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#FF4D4F]/90 transition-all"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
