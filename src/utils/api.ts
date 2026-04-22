import { supabase } from './supabase';

const defaultSettings = {
  id: 'default',
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

let authUser: { id: string; username: string } | null = null;

// Load token and user from localStorage on app init
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('auth_user');
  authUser = storedUser ? JSON.parse(storedUser) : null;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    // Basic auth check for demo/migration purposes
    if (username === 'rishabh' && password === 'Rishabh5689') {
        const user = { id: 'user_rishabh', username: 'rishabh' };
        authUser = user;
        localStorage.setItem('auth_token', 'supabase-mock-token');
        localStorage.setItem('auth_user', JSON.stringify(user));
        return { token: 'supabase-mock-token', user };
    }
    
    // Attempt Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
    });
    
    if (error || !data.user) {
        throw new Error(error?.message || 'Invalid username or password');
    }
    
    const user = { id: data.user.id, username: data.user.email || username };
    authUser = user;
    localStorage.setItem('auth_token', data.session.access_token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return { token: data.session.access_token, user };
  },

  logout: async () => {
    await supabase.auth.signOut();
    authUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getToken: () => localStorage.getItem('auth_token'),
  getUser: () => authUser,
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('clients').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Clients fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (client: any) => {
    const clientData = { ...client, id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date().toISOString() };
    const { data, error } = await supabase.from('clients').insert([clientData]).select().single();
    if (error) {
        console.error('Error creating client:', error);
        return clientData; // Fallback so UI doesn't break if table doesn't exist
    }
    return data || clientData;
  },

  update: async (id: string, client: any) => {
    const { data, error } = await supabase.from('clients').update(client).eq('id', id).select().single();
    if (error) {
        console.error('Error updating client:', error);
        return client;
    }
    return data || client;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
        console.error('Error deleting client:', error);
        return { success: false, error };
    }
    return { success: true };
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Bookings fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (booking: any) => {
    if (booking.invoiceNo) {
      const { data: existing } = await supabase.from('bookings').select('id').eq('invoiceNo', booking.invoiceNo).maybeSingle();
      if (existing) {
        throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
      }
    }
    const wayBillNo = await bookingsAPI.getNextWayBillNo();
    const bookingData = { ...booking, id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, wayBillNo, createdAt: new Date().toISOString() };
    const { data, error } = await supabase.from('bookings').insert([bookingData]).select().single();
    if (error) {
        console.error('Error creating booking:', error);
        return bookingData;
    }
    return data || bookingData;
  },

  update: async (id: string, booking: any) => {
    if (booking.invoiceNo) {
      const { data: existing } = await supabase.from('bookings').select('id').eq('invoiceNo', booking.invoiceNo).maybeSingle();
      if (existing && existing.id !== id) {
        throw new Error(`Invoice number ${booking.invoiceNo} already exists!`);
      }
    }
    const { data, error } = await supabase.from('bookings').update(booking).eq('id', id).select().single();
    if (error) {
        console.error('Error updating booking:', error);
        return booking;
    }
    return data || booking;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
        console.error('Error deleting booking:', error);
        return { success: false, error };
    }
    return { success: true };
  },

  getNextWayBillNo: async () => {
    try {
        const { data: settingsData } = await supabase.from('settings').select('*').single();
        const prefix = settingsData?.prefix || defaultSettings.prefix;
        const startingNumber = settingsData?.startingNumber || defaultSettings.startingNumber;
        
        const { data: bookings, error } = await supabase.from('bookings').select('wayBillNo');
        if (error) throw error;

        let maxNumber = startingNumber - 1;
        
        if (bookings && bookings.length > 0) {
            bookings.forEach((b: any) => {
                const match = b.wayBillNo?.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > maxNumber) maxNumber = num;
                }
            });
        }
        return `${prefix}${maxNumber + 1}`;
    } catch (err) {
        console.error('Error in getNextWayBillNo:', err);
        return `OSHO-${Date.now()}`; // Fallback to unique string if all else fails
    }
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    const { data, error } = await supabase.from('payments').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Payments fetch error:', error);
        return [];
    }
    return data || [];
  },

  create: async (payment: any) => {
    const paymentData = { ...payment, id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date().toISOString() };
    const { data, error } = await supabase.from('payments').insert([paymentData]).select().single();
    if (error) {
        console.error('Error creating payment:', error);
        return paymentData;
    }
    return data || paymentData;
  },

  update: async (id: string, payment: any) => {
    const { data, error } = await supabase.from('payments').update(payment).eq('id', id).select().single();
    if (error) {
        console.error('Error updating payment:', error);
        return payment;
    }
    return data || payment;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) {
        console.error('Error deleting payment:', error);
        return { success: false, error };
    }
    return { success: true };
  },
};

// Settings API


export const settingsAPI = {
  get: async () => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error || !data) {
        return defaultSettings;
    }
    return data;
  },

  update: async (settings: any) => {
    const { data: existingData } = await supabase.from('settings').select('id').single();
    
    if (existingData) {
        const { data, error } = await supabase.from('settings').update(settings).eq('id', existingData.id).select().single();
        if (error) {
            console.error('Error updating settings:', error);
            return settings;
        }
        return data || settings;
    } else {
        const { data, error } = await supabase.from('settings').insert([{ ...settings, id: 'default' }]).select().single();
        if (error) {
            console.error('Error inserting settings:', error);
            return settings;
        }
        return data || settings;
    }
  },
};
