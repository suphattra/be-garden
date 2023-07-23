const path = require('path')

if (process.env.NODE_ENV === 'local') {
  require('dotenv-safe').config({
    path: path.join(__dirname, './env/.env.local'),
    sample: path.join(__dirname, './env/.env'),
  })
} else if (process.env.NODE_ENV === 'dev') {
  require('dotenv-safe').config({
    path: path.join(__dirname, './env/.env.dev'),
    sample: path.join(__dirname, './env/.env'),
  })
} else if (process.env.NODE_ENV === 'production') {
  require('dotenv-safe').config({
    path: path.join(__dirname, './env/.env.production'),
    sample: path.join(__dirname, './env/.env'),
  })
} else {
  require('dotenv-safe').config({
    path: path.join(__dirname, './env/.env.local'),
    sample: path.join(__dirname, './env/.env'),
  })
}

module.exports = {
  VERSION: process.env.VERSION,
  NODE: process.env.NODE_PARTY_PROFILE,
  TIMEZONE: process.env.TIMEZONE,
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO: {
    URL: `mongodb://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_IP}:${
      process.env.MONGO_PORT
    }/${process.env.MONGO_DATABASE}?connectTimeoutMS=${process.env.MONGO_TIMEOUT}&authSource=${process.env.MONGO_AUTH}`,
    USER: process.env.MONGO_USER,
    PASS: process.env.MONGO_PASS,
    DATABASE: process.env.MONGO_DATABASE,
    IP: process.env.MONGO_IP,
    PORT: process.env.MONGO_PORT,
    AUTH: process.env.MONGO_AUTH,
    TIMEOUT: process.env.MONGO_TIMEOUT,
    // RECONNECT: process.env.MONGO_RECONNECT,
    POOL_SIZE: process.env.MONGO_POOL_SIZE,
  },
  LOG: {
    NAME: process.env.LOG_NAME,
    ROOT_PATH: process.env.LOG_ROOT_PATH,
    FILE_LEVEL: process.env.LOG_FILE_LEVEL, // error, warn, info, verbose, debug, silly
    CONSOLE_LEVEL: process.env.LOG_CONSOLE_LEVEL, // error, warn, info, verbose, debug, silly
  },
  INTERFACE_NODE_URL: {
    PARTY_SERVICE: process.env.PARTY_SERVICE_URL,
    CDR: process.env.PARTY_CDR_URL,
  },
  INTERFACE_NODE: {
    PARTY_SERVICE: process.env.NODE_PARTY_SERVICE,
    CDR: process.env.NODE_CDR,
  },
  HEADER: {
    HEADER_APP: process.env.HEADER_APP,
    HEADER_TRANSACTION_ID: process.env.HEADER_TRANSACTION_ID,
    HEADER_PUBLIC_ID: process.env.HEADER_PUBLIC_ID,
  },
  PAGINATION: {
    LIMIT: process.env.LIMIT,
    SKIP: process.env.SKIP,
    ORDER: process.env.ORDER,
  },
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_TIMEOUT: process.env.AUTH_TIMEOUT,
  FILE: {
    PATH: process.env.FILE_PATH,
  },
  SCHEDULE_CRON: {
    REWARD: {
      JOB_STATUS: process.env.JOB_STATUS_REWARD,
      JOB_TIME: process.env.JOB_TIME_REWARD,
    },
    VALIDITY_PERIOD: {
      JOB_STATUS: process.env.JOB_STATUS_VALIDITY_PERIOD,
      JOB_TIME: process.env.JOB_TIME_VALIDITY_PERIOD,
    },
    ADMIN_SEND_POINT: {
      JOB_STATUS: process.env.JOB_STATUS_ADMIN_SEND_POINT,
      JOB_TIME: process.env.JOB_TIME_ADMIN_SEND_POINT,
    },
    HBD: {
      JOB_STATUS: process.env.JOB_STATUS_HBD,
      JOB_TIME: process.env.JOB_TIME_HBD,
    },
    TIME_POST: {
      JOB_STATUS: process.env.JOB_STATUS_TIME_POST,
      JOB_TIME_TIME_POST: process.env.JOB_TIME_TIME_POST,
    },
    SCHEDULE_SURVEY: {
      JOB_STATUS: process.env.JOB_STATUS_SCHEDULE_SURVEY,
      JOB_TIME: process.env.JOB_TIME_SCHEDULE_SURVEY,
    },
  },
  SCHEDULE_NOTIFICATION: {
    EVENT: {
      JOB_MODULE: process.env.JOB_MODULE_NAME_TO_DAY,
      JOB_STATUS: process.env.JOB_STATUS_EVENT_TO_DAY,
      JOB_TIME: process.env.JOB_TIME_EVENT_TO_DAY,
    },
    SEND_POINT: {
      JOB_MODULE: process.env.JOB_MODULE_NAME_ADMIN_SEND_POINT,
    },
  },
  SERVICE_AUTHENTICATION: {
    PORT: process.env.SERVICE_AUTH_PORT,
    HOSTNAME: process.env.SERVICE_AUTH_HOSTNAME,
    AUTH_GET_BORN_TO_DAY: process.env.SERVICE_AUTH_GET_BORN_TO_DAY,
    AUTH_GET_USER_PROFILE: process.env.SERVICE_AUTH_GET_USER_PROFILE,
    AUTH_GET_PHOTO_INFO: process.env.SERVICE_AUTH_GET_PHOTO_INFO,
  },
}
