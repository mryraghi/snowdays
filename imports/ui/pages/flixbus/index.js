import './flixbus.html'
import Flixbus from '/imports/collections/flixbus';

Template.FlixbusPage.onCreated(function () {
  this.showCodes = new ReactiveVar(false);
  this.codes = new ReactiveVar('');
  this.errors = new ReactiveVar('');

  Meteor.subscribe('flixbus.all');
});

Template.FlixbusPage.events({
  'click #getCodes': function (event, template) {
    event.preventDefault();

    let f = Flixbus.find({redeemed: false}, {limit: 2}).fetch();
    if (f.length === 0) {
      template.errors.set('No promo codes left');
    } else {
      localStorage.setItem('redeemed', true);
      template.showCodes.set(true);
      template.codes.set(`${f[0].code} ${f[1].code}`);
      Flixbus.update({_id: f[0]._id}, {$set: {redeemed: true}});
      Flixbus.update({_id: f[1]._id}, {$set: {redeemed: true}});
    }
  }
});

Template.FlixbusPage.helpers({
  showCodes: function () {
    return Template.instance().showCodes.get();
  },
  codes: function () {
    return Template.instance().codes.get();
  },
  errors: function () {
    return Template.instance().errors.get();
  },
  alreadyRedeemed: function () {
    return localStorage.getItem('redeemed');
  }
});