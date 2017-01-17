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
      "PORT": "3000", // port bind to the 404
      "UPSTART_UID": "team", // The user you want to run meteor as.
      "ROOT_URL": 'https://www.snowdays.it',
      "MONGO_URL": 'mongodb://romeo:FQDxvGqnx8f74K4L3629@aws-eu-central-1-portal.0.dblayer.com:15401,aws-eu-central-1-portal.1.dblayer.com:15401/main?3t.connection.name=Snowdays+%5Bcompose.io%5D&3t.certificatePreference=RootCACert:from_file&3t.databases=main&3t.uriVersion=2&3t.useClientCertPassword=false&readPreference=primary&3t.rootCAPath=/etc/ssl/certs/snowdays.compose.crt&ssl=true&3t.sharded=true&3t.connectionMode=multi'
    },

    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 45
  }
};