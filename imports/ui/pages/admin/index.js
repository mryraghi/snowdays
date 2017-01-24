import './admin.html'
import './admin.list'
import './admin.add_new'
import './admin.settings'
import './admin.stats'
// TODO: controllare eliminazione participanti

import _ from 'lodash'
import Participants from '/imports/collections/participants'

Template.AdminPage.onCreated(function () {
  Session.set('tab', 'AdminListSection');
});

Template.AdminPage.onRendered(function () {
});

Template.AdminPage.events({
  'click .sn-menu-item': (event, template) => {
    switch (event.currentTarget.id) {
      case 'list':
        Session.set('tab', 'AdminListSection');
        break;
      case 'add_new':
        Session.set('tab', 'AdminAddNewSection');
        break;
      case 'settings':
        Session.set('tab', 'AdminSettingsSection');
        break;
      case 'stats':
        Session.set('tab', 'AdminStatsSection');
        break;
    }
  },

  'click #sn-logout': (event, template) => {
    Meteor.logout((error) => {
      // window.drift.reset();
      if (error) console.log(error)
    })
  }
});

Template.AdminPage.helpers({
  tab: function () {
    return Session.get('tab');
  },
  isActive: function (section) {
    let tab = Session.get('tab');
    if (_.isEqual(tab, section)) return 'sn-menu-item-active'
  }
});