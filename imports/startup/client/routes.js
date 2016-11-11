import '/imports/ui/pages/home'
import '/imports/ui/pages/login'
import '/imports/ui/pages/profile'
import '/imports/ui/layouts'

Router.route('/', {
  name: 'Home',
  template: 'Home',
  layoutTemplate: 'HomeLayout'
});

Router.route('/login', {
  name: 'Login',
  template: 'LoginPage',
  layoutTemplate: 'LoginLayout',
  onBeforeAction: function () {
    const user = Meteor.user();
    if (!_.isNull(Meteor.userId())) {
      // if not logged in redirect to login
      this.redirect('/' + user.username);
    }

    this.next()
  }
});

Router.route('/:username', {
  template: 'ProfilePage',
  layoutTemplate: 'DefaultLayout',
  onBeforeAction: function () {
    const user = Meteor.user();
    if (_.isNull(Meteor.userId())) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && !_.isEqual(user.username, this.params.username)) {
      // redirect to current user's profile
      this.redirect('/' + user.username)
    }

    this.next()
  }
});