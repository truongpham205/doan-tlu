# Express Base

## Starting App

Using yarn:

yarn install
yarn start

This will start the application and create an mysql database in your app dir.
Just open [http://localhost:3000](http://localhost:3000).

## Config environment

And finally you have to adjust the `config/env.js` to fit your environment.
Once thats done, your database configuration is ready!

# Note

## Response

```js
{
  status: 1,
  code: 1,
  data: ${array|object},
  paging: {
    page,
    totalItemCount,
    limit
  }
}
```

## Error

```js
{
  status: 0,
  code: ${errorCode},
  msg: 'message'
}
```

## Required

- **DateQuery**: by date using format: `yyyy-mm-dd`

## Base Structure

```js
├── __tests__
│ ├── app.spec.js
│ ├── lodash.spec.js
│ └── setupTest.js
├── app.js                # main
├── app.json              #
├── bin
│ └── www                 # server entry
├── ecosystem.config.js   # pm2 enviroment
├── jest.config.js        # test CONFIG
├── jsconfig.json         # VSCode CONFIG, - include autocomplete alias
├── nodemon.json          # Nodemon CONFIG
├── package.json          # main config for node project
├── pathConfig.js
├── public                # public assets
│ ├── stylesheets
│ ├── templates
│ └── upload
├── scripts               # useful scripts
│ └── sentry.js
├── src                   # Project source code
│ ├── common              #
│ ├── config              # Project config/Env
│ │ ├── crashlytics.js    # Crashlytics util
│ │ └── env.js
│ ├── controllers         #
│ ├── middleware          #
│ ├── models              #
│ ├── routes              #
│ ├── service             #
│ └── utils               #
└── .sentryclirc          # config sentry for project
```
