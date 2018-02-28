import './flixbus.html'
import Flixbus from '/imports/collections/flixbus';

Template.FlixbusPage.onCreated(function () {
  let notRedeemed = !localStorage.getItem('redeemed') || !localStorage.getItem('redeemed');
  this.showCodes = new ReactiveVar(!notRedeemed);
  this.codes = new ReactiveVar('');
  this.errors = new ReactiveVar('');

  Meteor.subscribe('flixbus.all');
});

Template.FlixbusPage.events({
  'click #getCodes': function (event, template) {
    event.preventDefault();
    console.log('asd');

    let f = Flixbus.find({redeemed: false}, {limit: 20}).fetch();
    if (f.length === 0) {
      template.errors.set('No promo codes left');
    } else {
      console.log(f);
      localStorage.setItem('redeemed', true);
      // template.codes.set(`${codes[0].code} ${codes[1].code}`);
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
  }
});