import './login.html'
import swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

Template.LoginPage.onCreated(function () {
  // set default tab to 'login'
  this.currentTab = new ReactiveVar("LoginSection");
});

Template.LoginPage.events({

  'submit #login-form': function (event, template) {
    // prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const username = target.username.value;
    const password = target.password.value;

    // Login
    Meteor.loginWithPassword(username, password, (error) => {
      if (error) swal('Error', error.reason, 'error');
      else {
        let _id = Meteor.userId();
        if (Roles.userIsInRole(_id, 'admin')) Router.go('/admin/' + username);
        else if (Roles.userIsInRole(_id, 'unibz')) {
          localStorage.setItem('id', Meteor.user().profile.participantId);
          Router.go('/register');
        }
        else if (Roles.userIsInRole(_id, 'external')) Router.go('/external');
        else if (Roles.userIsInRole(_id, 'participant')) Router.go('/participant');
        else {
          swal('Error', 'Unknown role', 'error');
        }

        // Clear form
        template.find("#login-form").reset();
      }
    });
  },

  'submit #signup-admin-form': function (event, template) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const masterPassword = target.master_password.value;
    const username = target.username.value;
    const password = target.password.value;
    const firstName = target.first_name.value;
    const lastName = target.last_name.value;
    const gender = target.gender.value;

    let user = {
      username: username,
      password: password,
      createParticipant: false,
      profile: {
        university: 'UniBz',
        gender: gender,
        firstName: firstName,
        lastName: lastName
      }
    };

    // check master password
    Meteor.call('users.create', user, 'admin', masterPassword, function (error) {
      if (error) swal('Error', error.message, 'error');
      else {
        // Login
        Meteor.loginWithPassword(username, password, (error) => {
          if (error) swal('Error', error.reason, 'error')
        });

        // Clear form
        template.find("#signup-admin-form").reset();
      }
    });
  },

  'click #admin-login': function (event, template) {
    template.currentTab.set('CreateAdminSection')
  }
});

Template.LoginPage.helpers({
  tab: function () {
    return Template.instance().currentTab.get();
  }
});

Template.LoginPage.onDestroyed(function () {
  // remove the class so it does not appear on other routes
  // $('body').removeClass('login-body');
});