declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string
      SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      NODE_ENV: 'development' | 'production'
      SUPABASE_PROJECT_REF: string
    }
  }
}

export {}
