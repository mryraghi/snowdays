import './register.html'
import moment from 'moment';
import 'sweetalert2/dist/sweetalert2.min.css';

Template.RegisterPage.onCreated(function () {
  let loggedIn = !_.isNull(Meteor.user());
  this.currentTab = new ReactiveVar(loggedIn ? 'RegisterFormSection' : "RegisterWelcomeSection");
});

Template.RegisterPage.events({
  // proceed to FORM form WELCOME screen
  'click #welcome-button': (event, template) => {
    template.currentTab.set('RegisterFormSection')
  }
});

Template.RegisterPage.helpers({
  tab: function () {
    return Template.instance().currentTab.get();
  },
  registrationIsOpen: () => {
    return moment().isBetween('2018-01-01', '2018-01-21')
  }
});

Template.RegisterPage.onDestroyed(function () {

});
