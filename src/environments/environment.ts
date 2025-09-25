export const environment = {
  production: true,
  apiUrl: 'https://api.your-production-domain.com/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr'],
  apiEndpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password'
    },
    user: {
      profile: '/user/profile',
      updateProfile: '/user/update-profile'
    },
    treatments: {
      list: '/treatments',
      details: '/treatments/:id',
      search: '/treatments/search'
    },
    hospitals: {
      list: '/hospitals',
      details: '/hospitals/:id',
      search: '/hospitals/search'
    },
    doctors: {
      list: '/doctors',
      details: '/doctors/:id',
      search: '/doctors/search'
    },
    bookings: {
      create: '/bookings',
      list: '/bookings',
      details: '/bookings/:id',
      cancel: '/bookings/:id/cancel'
    }
  }
};