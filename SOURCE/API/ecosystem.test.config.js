module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'televimer-api-test',
      script: './bin/www',
      // watch: ['./src'],
      watch_delay: 5000,
      ignore_watch: ['node_modules', 'public'],
      env: {},
      env_production: {
        NODE_ENV: 'production',
        DB_HOST: 'winds.hopto.org',
        DB_NAME: 'televimer_test',
        DB_USER: 'windsoft',
        DB_PASSWORD: 'Windsoft@0808xgwxx',
        DB_PORT: 3306,

        PORT: 8818,
        DEBUG: 'express-base:error,app:error',
        STRINGEE_PROJECT_ID: 5761,
        STRINGEE_API_KEYSID: 'SK8ZuDVWgqC4oqSuG5FkYJhlHbUdpnbmej',
        STRINGEE_API_KEYSEC: 'alpocnZXNFJEamxWdHd0cE9QUGVsWTZDejFFZmI=',
        SENTRY_ENVIRONMENT: 'production',
      },
      env_staging: {
        NODE_ENV: 'stage',
        DB_HOST: 'winds.hopto.org',
        DB_NAME: 'televimer_test',
        DB_USER: 'windsoft',
        DB_PASSWORD: 'Windsoft@0808xgwxx',
        PORT: 8018,
        DEBUG: 'express-base:*,app:*',
        STRINGEE_PROJECT_ID: 5761,
        STRINGEE_API_KEYSID: 'SK8ZuDVWgqC4oqSuG5FkYJhlHbUdpnbmej',
        STRINGEE_API_KEYSEC: 'alpocnZXNFJEamxWdHd0cE9QUGVsWTZDejFFZmI=',
        SENTRY_ENVIRONMENT: 'stage',
      },
      env_test: {
        NODE_ENV: 'test',
        DB_HOST: 'winds.hopto.org',
        DB_NAME: 'televimer_test',
        DB_USER: 'windsoft',
        DB_PASSWORD: 'Windsoft@0808xgwxx',
        PORT: 8018,
        DEBUG: 'express-base:*,app:*',
        STRINGEE_PROJECT_ID: 5761,
        STRINGEE_API_KEYSID: 'SK8ZuDVWgqC4oqSuG5FkYJhlHbUdpnbmej',
        STRINGEE_API_KEYSEC: 'alpocnZXNFJEamxWdHd0cE9QUGVsWTZDejFFZmI=',
        SENTRY_ENVIRONMENT: 'test',
      },
    },
  ],
};
