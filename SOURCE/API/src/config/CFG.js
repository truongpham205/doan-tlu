require('dotenv').config();
const path = require('path');

module.exports = {
  PRODUCT_TYPE: 'productive',
  PORT: process.env.PORT,
  db: {
    DB_NAME: process.env.DB_NAME || 'televimer',
    DB_HOST: process.env.DB_HOST || 'winds.hopto.org',
    DB_PORT: process.env.DB_PORT || 3306,
    DB_USER: process.env.DB_USER || 'windsoft',
    DB_PASS: process.env.DB_PASS || 'Windsoft@0808xgwxx',
  },
  key_ali: {
    ALI_ACCESS_KEY_ID: process.env.ALI_ACCESS_KEY_ID,
    ALI_ACCESS_KEY_SECRET: process.env.ALI_ACCESS_KEY_SECRET,
    REGION: process.env.REGION,
    BUCKET: process.env.BUCKET,
    ALI_URL: process.env.ALI_URL,
  },
  mqtt: {
    HOST: process.env.MQTT_HOST,
    PORT: process.env.MQTT_PORT,
  },
  resource: {
    HOST: process.env.RESOURCE_HOST,
    PORT: process.env.RESOURCE_PORT,
  },
  onesignal: {
    APP_ID: process.env.APP_ID,
    CHANNEL_ID: process.env.CHANNEL_ID,
    API_KEY: process.env.API_KEY,
    LINK: process.env.URL_ONESIGNAL,
  },
};
