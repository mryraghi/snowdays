module.exports = {
  servers: {
    one: {
      host: '138.68.66.74',
      username: 'root',
      // pem:
      password: 'rad3eDru9a'
      // or leave blank for authenticate from ssh-agent
    }
  },

  "ssl": {
    "pem": "./ssl.pem"
  },

  meteor: {
    name: 'snowdays',
    path: '../',
    servers: {
      one: {}
    },
    buildOptions: {
      // build with the debug mode on
      debug: true,
      serverOnly: true,
    },
    env: {
      PORT: "3000",
      ROOT_URL: 'http://138.68.66.74'
      // MONGO_URL: 'mongodb://localhost/meteor'
    },

    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};