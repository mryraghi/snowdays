import './externals.table.html'
import Participants from '/imports/collections/participants'
import Clipboard from 'clipboard'
let CryptoJS = require("crypto-js");

Template.ParticipantsTableSection.onCreated(function () {
  this.subscribe("users.current");
  this.subscribe("participants.all.related");
});

Template.ParticipantsTableSection.helpers({
  participants: function () {
    return Participants.find({owner: {$eq: Meteor.userId()}});
  },
  n_participants: function () {
    return Participants.find({_id: {$ne: Meteor.userId()}}).count();
  },
  maxAllowed: function () {
    let added = Participants.find({_id: {$ne: Meteor.userId()}}).count();
    let max = Meteor.user().profile.allowedParticipants;
    return _.isEqual(added, max)
  },
  participants_exist: function () {
    return (!_.isEqual(Participants.find({owner: {$eq: Meteor.userId()}}).count(), 0))
  },
  has_not_token: function () {
    return (_.isUndefined(Meteor.user().profile) || _.isUndefined(Meteor.user().profile.token))
  }
});

Template.ParticipantsTableSection.events({

  'submit #master_password_form': function (event, template) {
    event.preventDefault();

    const user = Meteor.user();

    if (user) {
      // values from form elements
      const target = event.target;
      const password = target.password.value;
      const password_confirmation = target.password_confirmation.value;

      if (!_.isEqual(password, password_confirmation)) {
        swal("Error", "Passwords do not match!", "error");
        template.find("#master_password_form").reset();
      } else {
        let hash = CryptoJS.SHA3(password);
        Meteor.call('users.update', {'profile.token': hash.toString()}, function (error, result) {
          if (error) swal('Error', error.message, 'error');
          else {
            swal('Success', 'Master password has been set!', 'success');
            template.find("#master_password_form").reset();
          }
        })
      }
    }
  },

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
        email: target.email.value,
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
    Session.set('tab', {name: 'UserFormSection', _id: this._id, previous: 'ParticipantsTableSection'});
  },

  'click #sn-icon-copy': function () {
    if (!_.isUndefined(Meteor.user().profile.token)) {
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
