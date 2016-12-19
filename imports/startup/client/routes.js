import '/imports/ui/pages/home'
import '/imports/ui/pages/login'
import '/imports/ui/pages/profile'
import '/imports/ui/pages/participant'
import '/imports/ui/layouts'


const jwt = require('jsonwebtoken');

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

Router.route('/token/:token', {
  template: 'ParticipantPage',
  layoutTemplate: 'DefaultLayout',
  subscriptions: function () {
    // returning a subscription handle or an array of subscription handles
    // adds them to the wait list.

    let decoded = jwt.verify(this.params.token, 'secret');
    return this.subscribe('singlePublicParticipant', decoded._id);
  },
  data: function () {
    let decoded = jwt.verify(this.params.token, 'secret');
    let participant = Participants.findOne({_id: decoded._id});
    // Not Valid/Valid cambia in modo irregolare
    return {
      isValidID: !!(this.ready() && participant),
      // token: jwt.sign({_id: 't4qD9ADQfRGfCcu6J'}, 'secret')
      _id: decoded._id

      /** Missing callback */
    };
  }
});