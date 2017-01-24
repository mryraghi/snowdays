import './externals.table.html'
import Participants from '/imports/collections/participants'
import Clipboard from 'clipboard'
import _ from 'lodash'
let CryptoJS = require("crypto-js");

Template.ParticipantsTableSection.onCreated(function () {
  this.subscribe("users.current");
  this.subscribe("participants.all.related");
});

Template.ParticipantsTableSection.helpers({
  participants: function () {
    // return cursor of all the participants already enrolled
    return Participants.find({owner: {$eq: Meteor.userId()}});
  },
  n_participants: function () {
    // return the number of participants already enrolled
    return Participants.find({_id: {$ne: Meteor.userId()}}).count();
  },
  max_allowed: function () {
    // return the number of participants the cp is allowed to enroll
    let added = Participants.find({_id: {$ne: Meteor.userId()}}).count();
    let max = _.toNumber(Meteor.user().profile.allowedParticipants);
    return _.isEqual(added, max)
  },
  participants_exist: function () {
    // return true if cp has at least one participant enrolled
    return (!_.isEqual(Participants.find({owner: {$eq: Meteor.userId()}}).count(), 0))
  },
  has_no_token: function () {
    // return true if cp has set a master password
    return (_.isUndefined(Meteor.user().profile) || _.isUndefined(Meteor.user().profile.token))
  }
});

Template.ParticipantsTableSection.events({

  // REQUIRED FORM set a master password
  'submit #master_password_form': function (event, template) {
    event.preventDefault();
    const user = Meteor.user();

    if (user) {

      // values from form elements
      const target = event.target;
      const password = target.password.value;
      const password_confirmation = target.password_confirmation.value;

      // check passwords match
      if (!_.isEqual(password, password_confirmation)) {
        swal("Error", "Passwords do not match!", "error");
      } else {

        // hash password
        let hash = CryptoJS.SHA3(password);

        // then update user by saving token
        Meteor.call('users.update', {'profile.token': hash.toString()}, function (error, result) {
          if (error) swal('Error', error.message, 'error');
          else swal('Success', 'Master password has been set!', 'success');
        })
      }

      // reset form
      template.find("#master_password_form").reset();
    }
  },

  // FORM add participants
  'submit #add_new_participant_form': function (event, template) {
    event.preventDefault();
    const user = Meteor.user();

    if (user) {

      // values from form elements
      const target = event.target;

      const participant = {
        owner: user._id,
        firstName: target.first_name.value,
        lastName: target.last_name.value,
        university: user.profile.university
      };

      Meteor.call('participants.insert', participant, function (error, result) {
        if (error) swal('Error', error.message, 'error');
        else template.find("#add_new_participant_form").reset();
      })
    }
  },

  'click #sn-icon-delete': function (event, template) {
    // provided by {{with}}
    const _id = this._id;

    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008eff',
      cancelButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, delete it!'
    }).then(function () {
      Meteor.call('participants.remove', _id, function (error, result) {
        if (error) swal('Error', error.message, 'error');
        else if (_.isEqual(0, result)) swal('Warning', 'Participant not removed!', 'warning');
      })
    });
  },

  'click #sn-icon-edit': function () {
    // go to UserFormSection and save previous tab
    Session.set('tab', {name: 'UserFormSection', _id: this._id, previous: 'ParticipantsTableSection'});
  },

  'click #sn-icon-copy': function () {
    // double check that user has set a master password = has a token
    if (!_.isUndefined(Meteor.user().profile.token)) {

      // copy data-clipboard-text form #sn-icon-copy
      let clipboard = new Clipboard('#sn-icon-copy');

      clipboard.on('success', function (e) {
        swal("Copied", 'Participant\'s URL copied in your clipboard.\nYou just have to share it!', "success");

        e.clearSelection();
      });

      clipboard.on('error', function (e) {
        swal("Error", e.trigger, "error");
      });
    } else {
      swal("Ooops!", "You first have to set a master password.", "warning")
    }
  }

});
