import './registers.html'
import moment from 'moment';
import 'sweetalert2/dist/sweetalert2.min.css';

Template.RegistersPage.onCreated(function () {
  let loggedIn = !_.isNull(Meteor.user());
  this.currentTab = new ReactiveVar(loggedIn ? 'RegistersFormSection' : "RegistersWelcomeSection");
});

Template.RegistersPage.events({
  // proceed to FORM form WELCOME screen
  'click #welcome-button': (event, template) => {
    template.currentTab.set('RegistersFormSection')
  }
});

Template.RegistersPage.helpers({
  tab: function () {
    return Template.instance().currentTab.get();
  },
  registrationIsOpen: () => {
    return moment().isBetween('2019-01-01', '2019-01-14')
  }
});

Template.RegistersPage.onDestroyed(function () {

});
