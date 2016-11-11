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

  meteor: {
    name: 'snowdays',
    path: '../../snowdays',
    servers: {
      one: {}
    },
    buildOptions: {
      // build with the debug mode on
      debug: true,
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'http://www.snowdays.it'
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