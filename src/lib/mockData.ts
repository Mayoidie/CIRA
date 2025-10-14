// Mock data storage and utilities for the CIRA system

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  role: "student" | "class-representative" | "admin";
  requestedRole?: "class-representative";
  password: string;
  verified: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  classroom: string;
  unitId: string;
  issueType: string;
  issueSubtype?: string;
  issueDescription: string;
  imageUrl?: string;
  status:
    | "pending"
    | "approved"
    | "in-progress"
    | "resolved"
    | "rejected";
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
  reviewedBy?: string;
}

// Initialize mock data
const initializeMockData = () => {
  if (typeof window === "undefined") return;

  // Initialize users if not exists
    const defaultUsers: User[] = [
      {
        id: "admin-1",
        email: "admin@plv.edu.ph",
        firstName: "Admin",
        lastName: "User",
        studentId: "00-0000",
        role: "admin",
        password: "admin",
        verified: true,
      },
    ];
    localStorage.setItem(
      "cira_users",
      JSON.stringify(defaultUsers),
    );

  // Initialize tickets if not exists
  if (!localStorage.getItem("cira_tickets")) {
    localStorage.setItem("cira_tickets", JSON.stringify([]));
  }

  // Initialize current user if not exists
  if (!localStorage.getItem("cira_currentUser")) {
    localStorage.setItem("cira_currentUser", "");
  }
};

export const getUsers = (): User[] => {
  initializeMockData();
  const users = localStorage.getItem("cira_users");
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem("cira_users", JSON.stringify(users));
};

export const getTickets = (): Ticket[] => {
  initializeMockData();
  const tickets = localStorage.getItem("cira_tickets");
  return tickets ? JSON.parse(tickets) : [];
};

export const saveTickets = (tickets: Ticket[]) => {
  localStorage.setItem("cira_tickets", JSON.stringify(tickets));
};

export const getCurrentUser = (): User | null => {
  initializeMockData();
  const userId = localStorage.getItem("cira_currentUser");
  if (!userId) return null;
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
};

export const setCurrentUser = (userId: string) => {
  localStorage.setItem("cira_currentUser", userId);
};

export const logout = () => {
  localStorage.setItem("cira_currentUser", "");
};

export const createUser = (
  userData: Omit<User, "id" | "verified">,
): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    verified: true, // Auto-verify for demo purposes
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (
  userId: string,
  updates: Partial<User>,
) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
};

export const createTicket = (
  ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">,
): Ticket => {
  const tickets = getTickets();
  const newTicket: Ticket = {
    ...ticketData,
    id: `ticket-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(newTicket);
  saveTickets(tickets);
  return newTicket;
};

export const updateTicket = (
  ticketId: string,
  updates: Partial<Ticket>,
) => {
  const tickets = getTickets();
  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index !== -1) {
    tickets[index] = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTickets(tickets);
  }
};

export const deleteTicket = (ticketId: string) => {
  const tickets = getTickets();
  const filtered = tickets.filter((t) => t.id !== ticketId);
  saveTickets(filtered);
};

export const getUserTickets = (userId: string): Ticket[] => {
  const tickets = getTickets();
  return tickets.filter((t) => t.userId === userId);
};

export const getTicketsByStatus = (
  status: string,
): Ticket[] => {
  const tickets = getTickets();
  return tickets.filter((t) => t.status === status);
};