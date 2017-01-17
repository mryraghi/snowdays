import _ from 'lodash'
let CryptoJS = require("crypto-js");

import './participant.form.html'
import Participants from '/imports/collections/participants'
import IDs from '/imports/collections/ids'

// Sentry.io

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  tags: {section: 'participant.form'}
});

// catches all exceptions on the server
raven.patchGlobal(client);

client.on('logged', function () {
  console.log('Exception handled and sent to Sentry.io');
});

client.on('error', function (e) {
  // The event contains information about the failure:
  //   e.reason -- raw response body
  //   e.statusCode -- response status code
  //   e.response -- raw http response object

  console.log('Couldn\'t connect to Sentry.io');
});

//

Template.UserFormSection.onCreated(function () {
  setSessions();
  let _id = Session.get('_id');
  if (_id) this.subscribe("participants.current", _id);
  else this.subscribe("participants.current", Meteor.userId());

  this.subscribe("users.current");
  // this.subscribe('files.ids.all');

  let p = Participants.find().fetch();
  // console.log(p);

  // TODO: check p.accepted
  this.filling = new ReactiveVar(false);

  // reactive var need when uploading files
  this.uploadingSID = new ReactiveVar(false);
  this.uploadingPID = new ReactiveVar(false);

  // set sentry.io context and catch all exceptions
  client.setContext({
    user: Meteor.user()
  });
});

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

Template.UserFormSection.helpers({
  uploadingSID: function () {
    return Template.instance().uploadingSID.get();
  },
  uploadingPID: function () {
    return Template.instance().uploadingPID.get();
  },
  imageFile: function () {
    return IDs.findOne();
  },
  lp: function () {
    setSessions();
    let _id = Session.get('_id');
    return Participants.findOne({_id: _id});
  },
  filling: function () {
    return !Template.instance().filling.get();
  }
});

Template.UserFormSection.events({
  // form submission
  'submit #user_form': function (event) {
    event.preventDefault();

    // values from form elements
    const target = event.target;

    let _id = Session.get('_id');
    let p = Participants.findOne({_id: _id});
    if (!p.hasPersonalID)
      return swal('Error', 'You need to upload your personal ID!', 'warning');

    if (!p.hasStudentID)
      return swal('Error', 'You need to upload your personal ID!', 'warning');

    // TODO: if first name and last name changes either disable or change user info

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
      tshirt: target.tshirt.value,
      hasAcceptedTandC: (!Roles.userIsInRole(Meteor.user(), 'admin'))
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
      if (error) {
        swal('Error', error.message, 'error');
        // Template.instance().filling.set(false)
      } else {
        swal('Success', 'You\'ve successfully updated your externals!', 'success');

        // TODO: catch undefined
        let previous = Session.get('tab')['previous'];
        if (!_.isUndefined(previous)) Session.set('tab', {name: previous})
      }
    })
  },

  // upload files
  'change #has_personal_id': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'personal')
    }
  },

  'change #has_student_id': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'student')
    }
  },

  'click #acceptTandC': function () {
    $('html, body').animate({scrollTop: 0}, 'fast');
    Template.instance().filling.set(true)
  }
});

function setSessions() {
  // _id session variable if _id is property of session variable tab
  if (!_.isUndefined(Session.get('tab')) && _.has(Session.get('tab'), '_id')) Session.set('_id', Session.get('tab')._id);
}

function uploadID(file, template, idType) {
  if (_.isUndefined(Session.get('_id'))) {
    swal('Error', 'A server side error occurred. Please contact rbellon@unibz.it', 'error');
    throw new Meteor.Error('uploadID', 'Session.get(_id) is not defined');
  }

  let p = {_id: Session.get('_id')};
  let key = (_.isEqual(idType, 'personal') ? 'hasPersonalID' : 'hasStudentID');
  p[key] = true;

  // We upload only one file, in case
  // multiple files were selected
  const upload = IDs.insert({
    file: file,
    streams: 'dynamic',
    chunkSize: 'dynamic',
    // transport: 'http',
    meta: {
      type: idType
    }
  }, false);

  upload.on('start', function () {
    $('#has_' + idType + '_id').removeClass('fadeOut').addClass('animated fadeIn');
    $('#loader-label').removeClass('fadeOut').addClass('animated fadeIn');
    template.uploadingPID.set(this);
  });

  upload.on('error', function (error, fileData) {
    if (error) {
      $('#has_' + idType + '_id').removeClass('fadeOut').addClass('animated fadeIn');
      $('#loader-label').removeClass('fadeIn').addClass('animated fadeOut');
      template.uploadingPID.set(this);
      swal('Error', error.message, 'error')
    }
  });

  upload.on('end', function (error, fileObj) {
    if (error) {
      swal('Error', 'Error during upload: ' + error, 'error');
    } else {
      swal('Uploaded', 'Your ' + idType + ' id has been uploaded!', 'success');

      // check security section on Meteor's documentation
      Meteor.call('participants.update', p, function (error, result) {
        if (error) swal('Error', error.message, 'error');
      })
    }
    $('#loader-label').removeClass('fadeIn').addClass('animated fadeOut');
    template.uploadingPID.set(false);
  });

  upload.start();
}