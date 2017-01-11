module.exports = {
  servers: {
    one: {
      host: '138.68.93.206',
      username: 'team'
    }
  },

  ssl: {
    pem: "./ssl.pem"
  },

  "appName": "snowdays",

  meteor: {
    name: 'snowdays',
    path: '../',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
    },
    "env": {
      "PORT": "8000", // port bind to the 404
      "UPSTART_UID": "team", // The user you want to run meteor as.
      "ROOT_URL": 'https://maintenance.snowdays.it',
      "MONGO_URL": 'mongodb://localhost/meteor'
    },

    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 45
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};