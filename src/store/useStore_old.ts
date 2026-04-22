import { create } from 'zustand';
import { authAPI, clientsAPI, bookingsAPI, paymentsAPI, settingsAPI } from '../utils/api';

export type BookingStatus = 'pending' | 'in_transit' | 'delivered';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Client {
  id: string;
  name: string;
  gst: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
}

export interface Charges {
  freight: number;
  hamali: number;
  docket: number;
  doorCollection: number;
  other: number;
  total: number;
}

export interface Booking {
  id: string;
  wayBillNo: string;
  bookingDate: string;
  origin: string;
  destination: string;
  consignorId: string;
  consignorName: string;
  consignorPhone: string;
  consignorAddress: string;
  consignorGst: string;
  consigneeId: string;
  consigneeName: string;
  consigneePhone: string;
  consigneeAddress: string;
  consigneeGst: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: string;
  material: string;
  packages: number;
  packingType: string;
  actualWeight: number;
  chargeWeight: number;
  paymentMode: 'toPay' | 'paid' | 'tBB';
  charges: Charges;
  totalFreight: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  wayBillNo: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  notes: string;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  phone2: string;
  gst: string;
  prefix: string;
  startingNumber: number;
  defaultFreight: number;
  defaultHamali: number;
  defaultDocket: number;
  terms: string;
}

interface AppState {
  isAuthenticated: boolean;
  currentUser: string | null;
  clients: Client[];
  bookings: Booking[];
  payments: Payment[];
  settings: CompanySettings;
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeFromToken: () => Promise<boolean>;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchClients: () => Promise<void>;

  // Bookings
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'wayBillNo'>) => Promise<Booking>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  getNextWayBillNo: () => Promise<string>;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  fetchPayments: () => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<CompanySettings>) => Promise<void>;
  fetchSettings: () => Promise<void>;

  // UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: CompanySettings = {
  name: 'OSHO Transport Chhattisgarh',
  address: 'Transport Nagar, Raipur',
  city: 'Raipur',
  state: 'Chhattisgarh',
  phone: '9876543210',
  phone2: '9876543211',
  gst: '22AAAAA0000A1Z5',
  prefix: 'OSHO-',
  startingNumber: 1001,
  defaultFreight: 0,
  defaultHamali: 0,
  defaultDocket: 50,
  terms: 'Goods once booked will not be returned. Company not responsible for leakage or breakage. All disputes subject to Raipur jurisdiction.',
};

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  clients: [],
  bookings: [],
  payments: [],
  settings: defaultSettings,
  sidebarOpen: false,
  isLoading: false,
  error: null,

  // Auth
  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authAPI.login(username, password);

      // Fetch initial data after login
      await Promise.all([
        get().fetchClients(),
        get().fetchBookings(),
        get().fetchPayments(),
        get().fetchSettings(),
      ]);

      set({
        isAuthenticated: true,
        currentUser: result.user.username,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Login failed' });
      return false;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
      set({
        isAuthenticated: false,
        currentUser: null,
        clients: [],
        bookings: [],
        payments: [],
        sidebarOpen: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  initializeFromToken: async () => {
    const token = authAPI.getToken();
    if (!token) return false;

    try {
      set({ isLoading: true });
      // Try to fetch data using stored token
      await Promise.all([
        get().fetchClients(),
        get().fetchBookings(),
        get().fetchPayments(),
        get().fetchSettings(),
      ]);
      const user = authAPI.getUser();
      set({ isAuthenticated: true, currentUser: user?.username ?? null, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  // Clients
  fetchClients: async () => {
    try {
      const clients = await clientsAPI.getAll();
      set({ clients });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addClient: async (clientData) => {
    try {
      const client = await clientsAPI.create(clientData);
      set((state) => ({ clients: [client, ...state.clients] }));
      return client;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      await clientsAPI.update(id, clientData);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientData } : c)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      await clientsAPI.delete(id);
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Bookings
  fetchBookings: async () => {
    try {
      const bookings = await bookingsAPI.getAll();
      set({ bookings });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addBooking: async (bookingData) => {
    try {
      const booking = await bookingsAPI.create(bookingData);
      set((state) => ({ bookings: [booking, ...state.bookings] }));
      return booking;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      await bookingsAPI.update(id, bookingData);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...bookingData } : b)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      await bookingsAPI.delete(id);
      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        payments: state.payments.filter((p) => p.bookingId !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getNextWayBillNo: async () => {
    try {
      return await bookingsAPI.getNextWayBillNo();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Payments
  fetchPayments: async () => {
    try {
      const payments = await paymentsAPI.getAll();
      set({ payments });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addPayment: async (paymentData) => {
    try {
      const payment = await paymentsAPI.create(paymentData);
      set((state) => {
        const newPayments = [payment, ...state.payments];
        // Update local booking payment status
        const booking = state.bookings.find((b) => b.id === paymentData.bookingId);
        if (booking) {
          const totalPaid = newPayments
            .filter((p) => p.bookingId === paymentData.bookingId)
            .reduce((sum, p) => sum + p.amount, 0);
          const payStatus: PaymentStatus =
            totalPaid >= booking.totalFreight ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
          const updatedBookings = state.bookings.map((b) =>
            b.id === paymentData.bookingId
              ? { ...b, amountPaid: totalPaid, paymentStatus: payStatus }
              : b
          );
          return { payments: newPayments, bookings: updatedBookings };
        }
        return { payments: newPayments };
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updatePayment: async (id, paymentData) => {
    try {
      await paymentsAPI.update(id, paymentData);
      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? { ...p, ...paymentData } : p)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deletePayment: async (id) => {
    try {
      await paymentsAPI.delete(id);
      set((state) => ({ payments: state.payments.filter((p) => p.id !== id) }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Settings
  fetchSettings: async () => {
    try {
      const settings = await settingsAPI.get();
      set({ settings });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const updatedSettings = await settingsAPI.update(settingsData);
      set((state) => ({ settings: { ...state.settings, ...updatedSettings } }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // UI
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setError: (error) => {
    set({ error });
  },
}));
