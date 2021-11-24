module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'booking-api',
      script: './bin/www',
      watch: ['./src'],
      watch_delay: 5000,
      ignore_watch: ['node_modules', 'public'],
      env: {},
      env_production: {
        NODE_ENV: 'production',
        DB_HOST: 'winds.hopto.org',
        DB_NAME: 'booking',
        DB_USER: 'windsoft',
        DB_PASSWORD: 'Windsoft@0808xgwxx',
        DB_PORT: 3306,

        PORT: 8765,

        EMAIL_ACCOUNT: 'gasvietsp@gmail.com',
        EMAIL_PASSWORD: 'tktjjucoxcosivsc',

        APP_ID: '7c1a5535-d30a-4e58-b2bc-3bafd900fb5d',
        CHANNEL_ID: 'c7385bce-66c0-4fd3-a105-e9580d71e483',
        URL_ONESIGNAL: 'https://onesignal.com/api',
        API_KEY: 'YTk3YzQ3ZjEtMWM4NC00MDg4LWEwN2EtNzA1MWFlYTYxODg2',

        ALI_ACCESS_KEY_ID: 'LTAI5tFnogipWarS2GdwYRw2',
        ALI_ACCESS_KEY_SECRET: 'pHiqMiki6As7mCzh8s2Ws2G6AjXKof',
        REGION: 'oss-ap-southeast-1',
        BUCKET: 'ohotour',
        ALI_URL: 'http://ohotour.oss-ap-southeast-1.aliyuncs.com/',
      },
      env_dev: {
        NODE_ENV: 'test',
        DB_HOST: 'winds.hopto.org',
        DB_NAME: 'booking',
        DB_USER: 'windsoft',
        DB_PASSWORD: 'Windsoft@0808xgwxx',
        DB_PORT: 3306,

        PORT: 8018,
        DEBUG: 'express-base:*,app:*',
        STRINGEE_PROJECT_ID: 5761,
        STRINGEE_API_KEYSID: 'SKzyC0KtlTlosqfDhIWgvJ0eNzu5QknBK',
        STRINGEE_API_KEYSEC: 'NmZBWWQ4OEFDbGkxMWxvVnd4VEUzUUpLUTdiMnJjTFM=',
        STRINGEE_API_ACCOUNT_KEYSID: 'AC428b515d5a25822c4decf88813fe5d0a',
        STRINGEE_API_ACCOUNT_KEYSEC: 'fd4d91bbc809c5eb88b53f6824e97db1',
        SENTRY_ENVIRONMENT: 'test',
        VAIS_API_KEY: '599b5c68-cd7d-11ea-b712-0242ac130004',
        VAIS_AUDIO_SOURCE_ID: '5f1a8af54c079de4328d223a',
        EMAIL_ACCOUNT: 'gasvietsp@gmail.com',
        EMAIL_PASSWORD: 'tktjjucoxcosivsc',
        APP_ID: 'bbd780af-9024-460a-a533-5538e880cb11',
        CHANNEL_ID: 'f771fb3a-b293-421a-9525-4c6f6def7e31',
        URL_ONESIGNAL: 'https://onesignal.com/api',
        ACCESS_KEY: 'AKIAZRBB2X43P7TQP6OU',
        SECRET_KEY: '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',
        REGION: 'ap-northeast-1',
        BUCKET: 'ezsale',
        AWS_URL: 'https://ezsale.s3-ap-southeast-1.amazonaws.com',
      },
    },
  ],
};
