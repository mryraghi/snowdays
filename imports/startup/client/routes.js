import "../../ui/pages/home";
import "../../ui/pages/thankyou";
import "../../ui/pages/login";
import "../../ui/pages/admin";
import "../../ui/pages/externals/index";
import "../../ui/pages/participant/index";
import "../../ui/pages/event";
import "../../ui/pages/register";
import "../../ui/pages/errors/404/not_found";
import "../../ui/pages/thankyou";
import "../../ui/pages/press";
import "../../ui/pages/flixbus";
import _ from "lodash";

Router.configure({
    template: 'Home',
    notFoundTemplate: 'NotFoundPage',
    noRoutesTemplate: 'Home'
});

Router.route('/', {
    name: 'Home',
    template: 'Home'
});

Router.route('/flixbus', {
    name: 'Flixbus',
    template: 'FlixbusPage'
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
            if (Roles.userIsInRole(user, 'external'))
                this.redirect('/external');

            // UNIBZ
            if (Roles.userIsInRole(user, 'unibz'))
                Router.go('ParticipantPage');
        }

        this.next()
    }
});

Router.route('/register', {
  name: 'Register',
  template: 'RegisterPage'
});

Router.route('/thankyou', {
  name: 'ThankYou',
  template: 'ThankYouPage'
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

Router.route('/thankyou', {
  name: 'ThankYou',
  template: 'ThankYouPage'
});

Router.route('/press',{
    name: 'PressKit',
    template: 'PressKitPage'
});