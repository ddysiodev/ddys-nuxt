export default defineNuxtConfig({
  modules: ['ddys-nuxt'],
  ddys: {
    routePrefix: '/api/ddys',
    requestForm: {
      enabled: false
    },
    diagnostics: {
      enabled: false
    }
  }
});
