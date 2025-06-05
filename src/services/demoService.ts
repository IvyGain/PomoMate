// Demo service for testing without live Supabase
export const demoService = {
  // Demo user for testing
  demoUser: {
    id: 'demo-user-123',
    email: 'demo@pomodoroplay.com',
    username: 'demo_user',
    display_name: 'Demo User',
    level: 5,
    experience: 1250,
    coins: 500,
    streak_days: 7,
    total_focus_time: 1800, // 30 hours
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Mock authentication
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Allow any email/password for demo
    return {
      data: {
        user: { id: this.demoUser.id, email },
        session: { access_token: 'demo-token' },
      },
      error: null,
    };
  },

  async signUp({ email, password }: { email: string; password: string }) {
    return {
      data: {
        user: { id: this.demoUser.id, email },
        session: { access_token: 'demo-token' },
      },
      error: null,
    };
  },

  async signOut() {
    return { error: null };
  },

  async getUser() {
    return {
      data: { user: { id: this.demoUser.id, email: this.demoUser.email } },
      error: null,
    };
  },

  async getSession() {
    return {
      data: { 
        session: { 
          user: { id: this.demoUser.id, email: this.demoUser.email },
        },
      },
      error: null,
    };
  },

  // Mock database operations
  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            if (table === 'users') {
              return { data: this.demoUser, error: null };
            }
            return { data: null, error: null };
          },
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            then: async (callback: any) => {
              return callback({ data: [], error: null });
            },
          }),
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ data: { ...data, id: Date.now() }, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => ({ data: { ...this.demoUser, ...data }, error: null }),
          }),
        }),
      }),
    };
  },
};

// Replace Supabase client with demo service in demo mode
export const getDemoSupabase = () => ({
  auth: {
    signInWithPassword: demoService.signInWithPassword.bind(demoService),
    signUp: demoService.signUp.bind(demoService),
    signOut: demoService.signOut.bind(demoService),
    getUser: demoService.getUser.bind(demoService),
    getSession: demoService.getSession.bind(demoService),
    resetPasswordForEmail: async () => ({ error: null }),
    onAuthStateChange: () => ({ subscription: { unsubscribe: () => {} } }),
  },
  from: demoService.from.bind(demoService),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
    send: async () => ({}),
  }),
  removeChannel: () => {},
});