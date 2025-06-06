import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: true,
  env: {
    CKAN_USERNAME: 'ckan_admin',
    CKAN_PASSWORD: 'test1234',
    API_KEY: "ap_key",
    ORG_NAME_SUFFIX: '-organization-test',
    DATASET_NAME_SUFFIX: '-dataset-test',
    GROUP_SUFFIX: '-group-test',
    USER_NAME_SUFFIX: '-user-test',
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:4000',
    apiUrl: 'http://ckan-dev:5000/',
    setupNodeEvents(on, config) {
      on('task', {
        table(violations) {

          console.table(violations)
          return null
        },
      })
    },
  },
})