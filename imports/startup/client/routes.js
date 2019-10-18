import "../../ui/pages/home";
import "../../ui/pages/thankyou";
import "../../ui/pages/login";
import "../../ui/pages/register";
import "../../ui/pages/admin";
import "../../ui/pages/externals/index";
import "../../ui/pages/participant/index";
import "../../ui/pages/event";
import "../../ui/pages/registers";
import "../../ui/pages/errors/404/not_found";
import "../../ui/pages/thankyou";
import "../../ui/pages/press";
import "../../ui/pages/flixbus";
import "../../ui/pages/privacy";
import _ from "lodash";
import moment from "moment/moment";
import swal from 'sweetalert2'
import Participants from "../../collections/participants";

Router.configure({
  template: 'Home',
  notFoundTemplate: 'NotFoundPage',
  noRoutesTemplate: 'Home'
});

Router.route('/', {
  name: 'Home',
  template: 'Home'
});
Router.route('/privacy', {
  name: 'Privacy',
  template: 'PrivacyPage'
});
Router.route('/flixbus', {
  name: 'Flixbus',
  template: 'FlixbusPage'
});

Router.route('/press', {
  name: 'PressKit',
  template: 'PressKitPage'
});

Router.route('/login', {
  name: 'Login',
  template: 'LoginPage',
  onBeforeAction: function () {
    // Google Analytics
    GAnalytics.pageview();
    const user = Meteor.user();
    if (user) {

      // ADMIN
      if (Roles.userIsInRole(user, 'admin'))
        this.redirect('/admin/' + user.username);

      // EXTERNAL
      if (Roles.userIsInRole(user, 'external')){
        this.redirect('/external');
      }
      if (Roles.userIsInRole(user, 'participant')){
        this.redirect('/participant');
      }

      // UNIBZ
      if (Roles.userIsInRole(user, 'unibz'))
        this.redirect('/register');
    }

    this.next()
  }
});

Router.route('/register', {
  onBeforeAction: function () {
  this.redirect('/');
  }
/*  name: 'Register',
  template: 'RegisterPage',
  subscriptions: function () {
    let _id = localStorage.getItem('id');
    let subscriptions = [];

    if (moment().isBetween('2019-01-14 12:00:00', '2019-01-27 23:59:00')) {
      subscriptions = [
        Meteor.subscribe('stats.helpers.internals'),
        Meteor.subscribe('stats.dorms.internals'),
        Meteor.subscribe('count.internals')
      ]
    }

    // returning a subscription handle or an array of subscription handles
    // adds them to the wait list.
    return Object.assign(subscriptions, [
      Meteor.subscribe('participant.internal', _id),
      Meteor.subscribe('user.internal', _id)
    ]);
  },
  action: function () {
    if (this.ready()) {
      // registration closes when 300 participants successfully enrolled
      if (!_.isNull(Meteor.user()) || Participants.find().count() < 300) {
        this.render();
      } else {
        this.render('RegisterClosedSection')
      }
    } else {
      this.render('Loader');
    }
  }*/
});


Router.route('/verify-email/:token', {
  name: 'VerifyEmail',
  action: function () {
    if (!this.params.token)
      this.render('LoginPage');

    Accounts.verifyEmail(this.params.token, (error) => {
      if (error) {
        swal('Error', error.reason, 'error');
        this.render('LoginPage');
      } else {
        this.render('SuccessSection');
      }
    });
  }
});

Router.route('/thankyou', {
  name: 'ThankYou',
  template: 'ThankYouPage'
});

// TODO: rename in Schedule
Router.route('/event', {
  name: 'Event',
  template: 'EventPage',
  onBeforeAction: function () {
    // Google Analytics
    GAnalytics.pageview();

    this.next()
  }
});

Router.route('/external', {
  template: 'ExternalsPage',
  onBeforeAction: function () {
    // Google Analytics
    GAnalytics.pageview();
    const user = Meteor.user();
    if (!user) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && Roles.userIsInRole(user, 'admin')) {
      this.redirect('/admin/' + user.username)
    } else if (user && Roles.userIsInRole(user, 'unibz')) {
      this.redirect('/participant');
      // TODO: check here
    } else if (user) {
      this.redirect('/external')
    }

    this.next()
  }
});

Router.route('/admin/:username', {
  template: 'AdminPage',
  onBeforeAction: function () {
    // Google Analytics
    GAnalytics.pageview();
    const user = Meteor.user();
    if (!user) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && Roles.userIsInRole(user, 'user')) {
      this.redirect('/external')
    } else if (user && !_.isEqual(user.username, this.params.username)) {
      this.redirect('/admin/' + user.username)
    }

    this.next()
  }
});

Router.route('/participant', {
  name: 'ParticipantPage',
  template: 'ParticipantPage',
  onBeforeAction: function () {
    // Google Analytics
    GAnalytics.pageview();
    let user = Meteor.user();
    if (!user && !this.params.query.token) {
      // if not logged in redirect to login
      Router.go('Login');
    } else if (user && this.params.query.token) {
      // if both aren't undefined then logout and proceed
      Meteor.logout()
    }
    this.next()
  },
  data: function () {
    return {
      token: this.params.query.token || ''
    };
  }
});