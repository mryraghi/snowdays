import '/imports/ui/pages/home'
import '/imports/ui/pages/login'
import '/imports/ui/pages/admin'
import '/imports/ui/pages/profile'
import '/imports/ui/pages/participant'
import '/imports/ui/pages/errors/404/not_found'

const jwt = require('jsonwebtoken');

Router.route('/', {
  name: 'Home',
  template: 'Home'
});

Router.route('/login', {
  name: 'Login',
  template: 'LoginPage',
  onBeforeAction: function () {
    const user = Meteor.user();
    console.log(user);
    if (user) {
      // if admin redirect to admin
      if (Roles.userIsInRole(user, 'admin'))
        this.redirect('/admin/' + user.username);

      // if user redirect to user
      if (Roles.userIsInRole(user, 'user'))
        this.redirect('/user/' + user.username);
    }

    this.next()
  }
});

Router.route('/user/:username', {
  template: 'ProfilePage',
  onBeforeAction: function () {
    const user = Meteor.user();
    if (!user) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && Roles.userIsInRole(user, 'admin')) {
      this.redirect('/admin/' + user.username)
    } else if (user && !_.isEqual(user.username, this.params.username)) {
      this.redirect('/user/' + user.username)
    }

    this.next()
  }
});

Router.route('/admin/:username', {
  template: 'AdminPage',
  onBeforeAction: function () {
    const user = Meteor.user();
    if (!user) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && Roles.userIsInRole(user, 'user')) {
      this.redirect('/user/' + user.username)
    } else if (user && !_.isEqual(user.username, this.params.username)) {
      this.redirect('/admin/' + user.username)
    }

    this.next()
  }
});

Router.route('/token/:token', {
  template: 'ParticipantPage',
  data: function () {
    return {
      token: this.params.token
    };
  }
});