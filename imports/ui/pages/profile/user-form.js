import _ from 'lodash'
let CryptoJS = require("crypto-js");

import './user-form.html'
import Participants from '/imports/collections/participants'
import IDs from '/imports/collections/ids'

Template.UserFormSection.onRendered(function () {
  Meteor.defer(function () {
    Tracker.autorun(function () {
      let lp = Participants.findOne({_id: Session.get('_id')});

      if (lp) {
        // since custom checkboxes are used, values are set manually
        if (_.has(lp, 'gender')) $("#gender").val(lp.gender);
        if (_.has(lp, 'university')) $("#university").val(lp.university);
        if (_.has(lp, 'tshirt')) $("#tshirt").val(lp.tshirt);
        if (_.has(lp, 'day1.activity')) $("#d1_activity").val(lp.day1.activity);
        if (_.has(lp, 'day1.rental')) $("#d1_rental").val(lp.day1.rental);
        if (_.has(lp, 'day2.activity')) $("#d2_activity").val(lp.day2.activity);
        if (_.has(lp, 'day2.rental')) $("#d2_rental").val(lp.day2.rental);
      }
    })
  });
});

Template.UserFormSection.onCreated(function () {
  setSessions();

  this.subscribe("users.current");
  this.subscribe("participants.current", Meteor.userId());
  this.subscribe("participants.current", Session.get('_id'));
  // this.subscribe('files.ids.all');

  // reactive var need when uploading files
  this.currentUpload = new ReactiveVar(false);
});

Template.UserFormSection.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  },
  imageFile: function () {
    return IDs.findOne();
  },
  lp: function () {
    setSessions();
    let _id = Session.get('_id');
    return Participants.findOne({_id: _id});
  }
});

Template.UserFormSection.events({
  // form submission
  'submit #user_form': function (event) {
    event.preventDefault();

    let _id = Session.get('_id');
    let p = Participants.findOne({_id: _id});
    if (!p.hasPersonalID)
      return swal('Error', 'You need to upload your personal ID!', 'warning');

    // values from form elements
    const target = event.target;

    const participant = {
      _id: _id,
      firstName: target.first_name.value,
      lastName: target.last_name.value,
      email: target.email.value,
      gender: target.gender.value,
      phone: target.phone.value,
      university: target.university.value,
      info: {
        street: target.street.value,
        number: target.number.value,
        city: target.city.value,
        zip: _.toInteger(target.zip.value),
        province: target.province.value,
        country: target.country.value
      },
      birth: {
        date: target.birth_date.value,
        country: target.birth_country.value
      },
      day1: {
        activity: target.d1_activity.value,
        rental: target.d1_rental.value,
      },
      day2: {
        activity: target.d2_activity.value,
        rental: target.d2_rental.value,
        course: target.d2_course.checked
      },
      isVolleyPlayer: target.is_volley_player.checked,
      isFootballPlayer: target.is_football_player.checked,
      foodAllergies: target.food_allergies.value,
      tshirt: target.tshirt.value
    };

    // check if participants object is valid before inserting
    try {
      Participants.simpleSchema().validate(participant);
    } catch (e) {
      // if not valid throw an error
      return swal('Error', e.message, 'error')
    }

    // check security section on Meteor's documentation
    Meteor.call('participants.update', participant, function (error, result) {
      if (error) swal('Error', error.message, 'error');
      else {
        swal('Success', 'You\'ve successfully updated your profile!', 'success');
        let previous = Session.get('tab').previous;
        if (!_.isUndefined(previous)) Session.set('tab', {name: previous})
      }
    })
  },

  // upload files
  'change #has_personal_id': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const upload = IDs.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        $('#has_personal_id').addClass('animated fadeOut');
        $('#loader-label').addClass('animated fadein');
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          swal('Error', 'Error during upload: ' + error, 'error');
        } else {
          swal('Uploaded', 'File "' + fileObj.name + '" successfully uploaded', 'success');

          // check security section on Meteor's documentation
          Meteor.call('participants.update', {
            _id: Session.get('_id'),
            hasPersonalID: true
          }, function (error, result) {
            if (error) swal('Error', error.message, 'error');
            else {
              swal('Success', 'You\'ve successfully updated your profile!', 'success')
            }
          })
        }
        $('#loader-label').addClass('animated fadeOut');
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});

function setSessions() {
  // _id session variable if _id is property of session variable tab
  if (!_.isUndefined(Session.get('tab')) && _.has(Session.get('tab'), '_id')) Session.set('_id', Session.get('tab')._id);
}