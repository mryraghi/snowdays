var API = new Restivus({
  useDefaultAuth: true,
  prettyJson: true,
  version: 'v1',
  onLoggedIn: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged in');
  },
  onLoggedOut: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged out');
  },
});

API.addCollection(Meteor.users, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    getAll: {
      action: function () {
        return {
          user: 'test'
        }
      }
    },
    post: {
      authRequired: false
    },
    delete: {
      roleRequired: 'admin'
    }
  }
});

// TEST API

API.addRoute('test', {
  get: function () {
    return {
      available: true
    };
  }
});