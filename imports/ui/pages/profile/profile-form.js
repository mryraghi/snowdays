import Flickity from 'flickity'

let flickity;
const totNumberOfSlides = 3;

Session.set("sessionSlideIndex", 0);

Template.AddNewSection.onCreated(function () {
  this.subscribe("currentUserData");
  this.subscribe("participantsData");
  this.subscribe('files.ids.all');
});

Template.AddNewSection.helpers({
  // info about current logged participants
  // TODO: if loggedParticipant (name to be changed) is a contact person, then also update user's main profile
  loggedParticipant: function () {
    return Participants.findOne({_id: Meteor.userId()});
  }
});

Template.UserFormSection.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);

  let user = Meteor.user();
  if (user) {
    let p = Participants.findOne({_id: user._id});
    if (_.isUndefined(p)) {
      const p_id = Participants.insert({
        _id: user._id,
        first_name: user.profile.first_name,
        last_name: user.profile.last_name,
        email: user.emails[0].address
      });
      return Participants.find({_id: p_id})
    } else {
      return p
    }
  }
});

Template.UserFormSection.helpers({
  slideIndex: function () {
    return Session.get("sessionSlideIndex") + 1
  },
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  },
  imageFile: function () {
    return IDs.findOne();
  },
  lp: function () {
    return Participants.findOne({_id: Meteor.userId()})
  }
});

Template.UserFormSection.events({
  'click #first': (event, template) => {
    flickity.select(0);
    Session.set("sessionSlideIndex", 0);
  },
  'click #second': (event, template) => {
    flickity.select(1);
    Session.set("sessionSlideIndex", 1);
  },
  'click #third': (event, template) => {
    flickity.select(2);
    Session.set("sessionSlideIndex", 2);
  },
  'keyup .sn-field-input': (event, template) => {
    const value = event.currentTarget.value;
    const class_name = $('.' + event.currentTarget.className);

    if (!_.isEqual(value, '')) class_name.parent().parent().addClass('sn-animate-field-label');
    else class_name.parent().parent().removeClass('sn-animate-field-label');
  },
  'focusout .sn-field-input': (event, template) => {
    const value = event.currentTarget.value;
    const class_name = $('.' + event.currentTarget.className);

    if (_.isEqual(value, '') && !class_name.is(":focus")) {
      class_name.parent().parent().removeClass('sn-animate-field-label');
    }
  },
  'change #personal_id': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const upload = IDs.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          swal('Error', 'Error during upload: ' + error, 'error');
        } else {
          swal('Uploaded', 'File "' + fileObj.name + '" successfully uploaded', 'success');
          Participants.update(Meteor.userId(), {$set: {has_personal_id: true}})
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  },

  // form submission
  'submit #user_form': function (event) {
    event.preventDefault();

    // TODO: add participant validation...
    const user = Meteor.user();

    if (user) {
      // values from form elements
      const target = event.target;

      const participant = {
        owner: user._id,
        first_name: target.first_name.value,
        last_name: target.last_name.value,
        email: target.email.value,
        // TODO: validate phone number
        phone: target.phone.value,
        university: target.university.value,
        info: {
          address: target.address.value,
          city: target.city.value,
          zip: target.zip.value,
          province: target.province.value,
          country: target.country.value
        },
        birth: {
          date: target.birth_date.value,
          country: target.birth_country.value
        },
        bank: {
          beneficiary: target.beneficiary.value,
          IBAN: target.iban.value,
          name: target.bank_name.value,
          swift_bic: target.swift_bic.value
        },
        thursday: {
          activity: target.t_activity.value,
          rental: target.t_rental.value
        },
        friday: {
          activity: target.f_activity.value,
          rental: target.f_rental.value,
          race: target.f_race.checked,
          course: target.f_course.checked
        },
        food_allergies: target.food_allergies.value,
        t_shirt: target.t_shirt.value,
        is_volley_player: target.is_volley_player.checked,
        has_personal_id: target.has_personal_id,
        // has_student_id: target.has_student_id,
        createdAt: new Date()
      };

      Meteor.call('update.participant', Meteor.userId(), participant, function (error, result) {
        if (error) swal('Error', error.message, 'error');
        else {
          console.log(result);
          swal('Success', 'You\'ve successfully updated your profile!', 'success')
        }
      })
    }


    // swal.queue([{
    //   title: 'Your public IP',
    //   confirmButtonText: 'Show my public IP',
    //   text: 'Your public IP will be received ' +
    //   'via AJAX request',
    //   showLoaderOnConfirm: true,
    //   preConfirm: function () {
    //     return new Promise(function (resolve) {
    //       $.get('https://api.ipify.org?format=json')
    //         .done(function (data) {
    //           swal.insertQueueStep(data.ip);
    //           resolve()
    //         })
    //     })
    //   }
    // }]);

    // event.target.user_form.value = "";
  }
});

Template.UserFormSection.onRendered(function () {
  // set session variables
  Session.set("sessionSlideIndex", 0);

  flickity = new Flickity('.user_form_carousel', {
    draggable: false,
    pageDots: false,
    adaptiveHeight: true,
    prevNextButtons: false,
    accessibility: false
  });
});

Template.registerHelper('currentSlideIndex', function (index) {
  return !!_.isEqual(index, Session.get("sessionSlideIndex"));
});