import "./participant.html";
import {checkToken} from "/lib/js/utilities";
import _ from "lodash";
import Participants from "/imports/collections/participants";
import "/imports/ui/components/forms/participant.form";
import "/imports/ui/components/loader/loader";

let CryptoJS = require("crypto-js");

Template.ParticipantPage.onCreated(function () {
  this.hash = new ReactiveVar();
  this.token = new ReactiveVar((this.data && this.data.token ? this.data.token : ''));

  Meteor.subscribe("participants.current", Session.get('_id'));
  Tracker.autorun(() => {
    if (this.subscriptionsReady()) {
      let p = Participants.findOne();

      if (p && p.owner) {
        Meteor.subscribe("users.one.strict", p.owner);
      }
    }
  })
});
Template.ParticipantPage.helpers({

  loggedIn: function () {

    // available only when internal participant is logged in
    let user = Meteor.user();
    if (user) Session.set('_id', user._id);
    return !!user;
  },
  validToken: function () {

    // return true if the combination between
    // token and hash is valid and if the _id
    // is not undefined (already checked in checkToken)
    let hash = Template.instance().hash.get();
    let token = Template.instance().token.get();
    let _id = checkToken(token, hash);
    let validId = !_.isUndefined(_id);

    if (validId) Session.set('_id', _id);

    return validId
  },

  owner: function () {
    console.log(Meteor.users.findOne());
    // return strictly useful info about contact person
    return Meteor.users.findOne()
  },

  id_is_set: function () {

    // check whether _id session variable has been set
    // display message if undefined
    return !_.isUndefined(Session.get('_id'))
  }
});

Template.ParticipantPage.events({

  'submit #password_verification_form': function (event, template) {
    event.preventDefault();

    // get password from form
    const password = event.target.password.value;

    // hash password
    let hash = CryptoJS.SHA3(password);

    template.hash.set(hash.toString());
  },

  'click #sn-logout': (event, template) => {
    Meteor.logout((error) => {
      if (error) console.log(error)
    })
  }

});

Template.ParticipantPage.onDestroyed(function () {

  // set _id as undefined as soon as the template is destroyed
  Session.set('_id', undefined)
});