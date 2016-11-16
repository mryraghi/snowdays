import Flickity from 'flickity'

var flickity, currentSlideIndex;

Template.AddNewSection.onCreated(function () {
  this.subscribe("currentUserData");
  this.subscribe("participantsData");

});

Template.AddNewSection.helpers({
  // info about current logged participants
  // TODO: if loggedParticipant (name to be changed) is a contact person, then also update user's main profile
  loggedParticipant: () => {
    return Participants.findOne({_id: Meteor.userId()});
  }
});

Template.UserFormSection.events({
  'click #activities': (event, template) => {
    flickity.select(1);
    template.currentSlideIndex.set(1);
  },
  'click #profile': (event, template) => {
    flickity.select(0);
    template.currentSlideIndex.set(0);
  },

  // form submission
  'submit #user_form': function (event) {
    event.preventDefault();

    // TODO: add participant validation...
    // const user = Meteor.user();
    //
    // if (user) {
    //   // values from form elements
    //   const target = event.target;
    //   const participant = {
    //     owner: this.userId(),
    //     // TODO: add university to user object
    //     // university: user.university,
    //     first_name: target.first_name.value,
    //     last_name: target.last_name.value,
    //     email: target.email.value,
    //     // TODO: validate phone number
    //     phone: target.phone.value,
    //     birth_date: target.birth_date.value,
    //     birth_country: target.birth_country.value,
    //     t_activity: target.t_activity.value,
    //     t_rental: target.t_rental.value,
    //     f_activity: target.f_activity.value,
    //     f_rental: target.f_rental.value,
    //     is_volley_player: target.is_volley_player.checked
    //   };
    // }


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

    console.log('here');

    // event.target.user_form.value = "";
  }
});

Template.UserFormSection.onRendered(function () {
  flickity = new Flickity('.user_form_carousel', {
    draggable: false,
    imagesLoaded: true,
    adaptiveHeight: true,
    pageDots: false,
    prevNextButtons: false,
    accessibility: false
  });

});

Template.registerHelper('isLastSlide', () => {
  if (flickity) return !!_.isEqual(flickity.cells.length - 1, Template.instance().currentSlideIndex.get());

});