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

Template.AddNewSection.events({
  'click #preferences': () => {
    slider.select(2)
  },
  'click #activities': () => {
    slider.select(1)
  },
  'click #profile': () => {
    slider.select(0)
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
        owner: this.userId(),
        // TODO: add university to user object
        // university: user.university,
        first_name: target.first_name.value,
        last_name: target.last_name.value,
        email: target.email.value,
        // TODO: validate phone number
        phone: target.phone.value,
        birth_date: target.birth_date.value,
        birth_country: target.birth_country.value,
        t_activity: target.t_activity.value,
        t_rental: target.t_rental.value,
        f_activity: target.f_activity.value,
        f_rental: target.f_rental.value,
        is_volley_player: target.is_volley_player.checked
      };
    }


    console.log(participant);

    // event.target.user_form.value = "";
  }
});