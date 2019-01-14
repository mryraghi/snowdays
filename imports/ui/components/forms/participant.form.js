import _ from "lodash";
import moment from 'moment';
import {deepFlush} from "/lib/js/utilities";
import Participants from "/imports/collections/participants";
import IDs from "/imports/collections/ids";
import swal from 'sweetalert2';
import "./participant.form.html";
import "./t&c.html";
import "/imports/ui/components/loader/loader";

let CryptoJS = require("crypto-js");

// TODO: offline? save info as cookies

// var online = navigator.onLine;
// document.body.addEventListener("online", function () {
// }
// document.body.addEventListener("offline", function () {
// }

// Sentry.io
// let raven = require('raven');
// let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
//   environment: Meteor.settings.public.environment,
//   tags: {section: 'participant.form'}
// });

// catches all exceptions on the server
// raven.patchGlobal(client);

// client.on('logged', function () {
//   console.log('Exception handled and sent to Sentry.io');
// });

// client.on('error', function (e) {
// The event contains information about the failure:
//   e.reason -- raw response body
//   e.statusCode -- response status code
//   e.response -- raw http response object

//   console.log('Couldn\'t connect to Sentry.io');
// });


Template.UserFormSection.onCreated(function () {
  let template = Template.instance();

  // behave differently if current user is ad admin
  template.isAdmin = !_.isNull(Meteor.userId()) && Roles.userIsInRole(Meteor.userId(), 'admin');

  // internal registration happens first
  template.hasToBeHelperOrHost = moment().isBetween('2019-01-14 00:00:00', '2019-01-20 23:59:00');

  console.log('hasToBeHelperOrHost', moment().isBetween('2019-01-14 00:00:00', '2019-01-20 23:59:00'));
  console.log('Meteor user', Meteor.user());

  // set _id session variable when editing
  // participant in external cp list
  setSessions();
  facebookSetup();

  // let _id = Session.get('_id') || Meteor.userId();

  // subscriptions
  // this.subscribe("users.current");

  // this.subscribe("participants.current", _id, function () {
  //   let p = Participants.findOne();
  //   if (p) {
  //     // again, if admin then set true since not needed
  //     let acceptTandC = (Roles.userIsInRole(Meteor.userId(), 'admin') ? true : p.hasAcceptedTandC);
  //     template.hasAcceptedTandC.set(acceptTandC);
  //     template.filling.set(!p.statusComplete);
  //     getSettings(template);
  //   }
  // });

  // if user is admin then set this as true since not needed
  // template.hasAcceptedTandC = new ReactiveVar(!!Roles.userIsInRole(Meteor.userId(), ['admin', 'external']));

  /**
   * 1. retrieve or create new participant
   * --> used to pre-fill the form
   */
  let _id = localStorage.getItem('id');
  console.log('participant ID', _.toString(_id));

  let p = Participants.findOne(_id);

  // if we don't have a participant then assign a unique ID
  if (!p) {
    p = {_id: Random.id()};
  }

  // save to localStorage
  if (!_.isEqual(_id, p._id)) localStorage.setItem('id', p._id);

  template.user = Meteor.users.find().fetch()[0];
  template.participant = new ReactiveVar(p);
  template.userId = template.user ? template.user._id : undefined;
  template.hasUser = !!template.userId;
  template.emailVerified = template.hasUser ? template.user.emails[0].verified : false;
  template.emailSent = new ReactiveVar(false);
  template.hasAcceptedTandC = new ReactiveVar(!!p.hasAcceptedTandC);
  template.isHelper = new ReactiveVar(!!p.isHelper);
  template.isLoggedIn = new ReactiveVar(!!p.userId);
  template.isHost = new ReactiveVar(!!p.isHost);
  template.isInDorm = new ReactiveVar(_.isEqual(p.accommodationType, 'dorm'));
  template.isDormDante = new ReactiveVar(_.isEqual(p.studentDorm, 'dante'));
  template.isDormUnicity = new ReactiveVar(_.isEqual(p.studentDorm, 'univercity'));
  template.noOfGuests = new ReactiveVar((p.noOfGuests ? p.noOfGuests : 1));
  template.hasStudentIDFront = new ReactiveVar(!!p.hasStudentIDFront);
  template.hasStudentIDBack = new ReactiveVar(!!p.hasStudentIDBack);
  template.hasPersonalIDFront = new ReactiveVar(!!p.hasPersonalIDFront);
  template.hasPersonalIDBack = new ReactiveVar(!!p.hasPersonalIDBack);
  template.paymentID = !_.isUndefined(p.paymentID) ? p.paymentID : calculatePaymentID();
  template.rentSkiis = new ReactiveVar(_.isEqual(p.rentMaterial, 'Ski'));
  template.rentSnowboard = new ReactiveVar(_.isEqual(p.rentMaterial, 'Snowboard'));
  template.noRent = new ReactiveVar(_.isEqual(p.rentMaterial, 'None'));
  template.isDay1Swimming = new ReactiveVar((p.day1 ? p.day1.swimming : false));
  template.isDay1BubbleFootball= new ReactiveVar((p.day1 ? p.day1.bubble_football : false));
  template.isDay1Other= new ReactiveVar((p.day1 ? p.day1.other_activities : false));
  template.isDay2SkiOrSnow =  new ReactiveVar((p.day2 ? p.day2.ski_or_snow : false));
  template.isDay2SkiCourse =  new ReactiveVar((p.day2 ? p.day2.ski_course : false));
  template.isDay2SnowCourse =  new ReactiveVar((p.day2 ? p.day2.snow_course : false));
  template.isDay2SkiRace =  new ReactiveVar((p.day2 ? p.day2.ski_race : false));
  template.isDay2SnowRace =  new ReactiveVar((p.day2 ? p.day2.snow_race : false));
  template.isDay2JibSession =  new ReactiveVar((p.day2 ? p.day2.jib_session : false));
  template.isDay2Other =  new ReactiveVar((p.day2 ? p.day2.other_activities : false));

  template.isDay3Snowvolley =  new ReactiveVar((p.day3 ? p.day3.snow_volley_tournament : false));
  template.isDay3SnowFootball =  new ReactiveVar((p.day3 ? p.day3.snow_football_tournament : false));
  template.isDay3SkiOrSnow =  new ReactiveVar((p.day3 ? p.day3.ski_or_snow : false));
  template.isDay3Other =  new ReactiveVar((p.day3 ? p.day3.other_activities : false));
  // TODO: check these
  template.uploadingSIDFront = new ReactiveVar(false);
  template.uploadingSIDBack = new ReactiveVar(false);
  template.uploadingPIDFront = new ReactiveVar(false);
  template.uploadingPIDBack = new ReactiveVar(false);
  template.filling = new ReactiveVar(true);
  template.settings = new ReactiveVar([]);

  // see if participant info have already been saved in localStorage
  // Meteor.call('participants.findOne', _id,
  //   (error, p) => {
  //
  //   }
  // );

  this.subscribe("participants.current", _id, function () {
    let p = Participants.findOne();
    console.log(p);
    if (p) {
      // again, if admin then set true since not needed
      template.filling.set(!p.statusComplete);
      //template.isLoggedIn.set(true);
      getSettings(template);
    }
    let acceptTandC = (Roles.userIsInRole(Meteor.userId(), 'admin') ? true : (p ? p.hasAcceptedTandC : false));
    template.hasAcceptedTandC.set(acceptTandC);
  });

  // set sentry.io context and catch all exceptions
  // client.setContext({
  //   user: Meteor.user()
  // });
});

Template.UserFormSection.helpers({
  // shown for hosting and helping internals
  finalPrice: function () {
    return `${calculateFinalPrice()}€`;
  },
  isLoggedIn: function() {
    let template = Template.instance();
    return (!!template.userId);
  },
  // INTERNALS ONLY: isHelper and isHost
  isHelper: function () {
    let template = Template.instance();
    return (template.isHelper.get() ? template.isHelper.get() : false)
  },
  isHelperCategoryAvailable: function (category, max) {
    return Participants.find({
      $and: [
        {helperCategory: category},
        {_id: {$ne: Template.instance().participant.get()._id}}
      ]
    }).count() < max;
  },
  helpersLeft: function (category, max) {
    return max - Participants.find({helperCategory: category}).count()
  },
  isHost: function () {
    let template = Template.instance();
    return (template.isHost.get() ? template.isHost.get() : false)
  },
  isDormDante: function () {
    let template = Template.instance();
    return (template.isDormDante.get() ? true : false)
  },
  isDormUnicity: function () {
    let template = Template.instance();
    return (template.isDormUnicity.get() ? true : false)
  },

  isDormAvailable: function (dorm, max) {
    return Participants.find({
      $and: [
        {studentDorm: dorm},
        {_id: {$ne: Template.instance().participant.get()._id}}
      ]
    }).count() < max;
  },
  dormPlacesLeft: function (dorm, max) {
    return max - Participants.find({studentDorm: dorm}).count()
  },
  isCorrectDorm: function (dorm) {
    let template = Template.instance();
    console.log(dorm );
    return (template.dorm == dorm);
  },
 
// RENTAL 
rentSkiis: function () {
  let template = Template.instance();
  return (template.rentSkiis.get() ? template.rentSkiis.get() : false);
},

rentSnowboard: function () {
  let template = Template.instance();
  return (template.rentSnowboard.get() ? template.rentSnowboard.get() : false);
},
noRent: function () {
  let template = Template.instance();
  return (template.noRent.get() ? template.noRent.get() : false);
},

//Day1 Activities
isDay1Swimming: function() {
  //return this.swimming === true?'checked':'';
  let template = Template.instance();
  return (template.isDay1Swimming.get() ? template.isDay1Swimming.get() : false);
},
isDay1BubbleFootball: function() {
  //return this.bubble_football === true?'checked':'';
  let template = Template.instance();
  return (template.isDay1BubbleFootball.get() ? template.isDay1BubbleFootball.get() : false);
},
isDay1Other: function() {
  let template = Template.instance();
  return (template.isDay1Other.get() ? template.isDay1Other.get() : false);
},
// Day2 Activities
isDay2SkiOrSnow:function () {
  let template = Template.instance();
  return (template.isDay2SkiOrSnow.get() ? template.isDay2SkiOrSnow.get() : false);
},
isDay2SkiCourse:function () {
  let template = Template.instance();
  return (template.isDay2SkiCourse.get() ? template.isDay2SkiCourse.get() : false);
},
isDay2SnowCourse:function () {
  let template = Template.instance();
  return (template.isDay2SnowCourse.get() ? template.isDay2SnowCourse.get() : false);
},
isDay2SkiRace:function () {
  let template = Template.instance();
  return (template.isDay2SkiRace.get() ? template.isDay2SkiRace.get() : false);
},
isDay2SnowRace:function () {
  let template = Template.instance();
  return (template.isDay2SnowRace.get() ? template.isDay2SnowRace.get() : false);
},
isDay2JibSession:function () {
  let template = Template.instance();
  return (template.isDay2JibSession.get() ? template.isDay2JibSession.get() : false);
},
isDay2Other: function () {
  let template = Template.instance();
  return (template.isDay2Other.get() ? template.isDay2Other.get() : false);
},
// Day3 Activities
isDay3Snowvolley:function () {
  let template = Template.instance();
  return (template.isDay3Snowvolley.get() ? template.isDay3Snowvolley.get() : false);
},
isDay3SnowFootball: function () {
  let template = Template.instance();
  return (template.isDay3SnowFootball.get() ? template.isDay3SnowFootball.get() : false);
},
isDay3SkiOrSnow:function () {
  let template = Template.instance();
  return (template.isDay3SkiOrSnow.get() ? template.isDay3SkiOrSnow.get() : false);
},
isDay3Other: function () {
  let template = Template.instance();
  return (template.isDay3Other.get() ? template.isDay3Other.get() : false);
},
  // INTERNALS ONLY: number of guest chosen and allowed (if in dorm only 1)
  noOfGuests: function () {
    return Template.instance().noOfGuests.get();
  },

  // INTERNALS ONLY: where the participant lives in a dorm
  isInDorm: function () {
    return Template.instance().isInDorm.get();
  },
  // INTERNALS ONLY: password required to create a user that can login
  isPasswordRequired: function () {
    return !Template.instance().hasUser;
  },

  // DOCUMENTS
  hasStudentIDFront: function () {
    return Template.instance().hasStudentIDFront.get();
  },
  hasStudentIDBack: function () {
    return Template.instance().hasStudentIDBack.get();
  },
  hasPersonalIDFront: function () {
    return Template.instance().hasPersonalIDFront.get();
  },
  hasPersonalIDBack: function () {
    return Template.instance().hasPersonalIDBack.get();
  },
  uploadingSIDFront: function () {
    return Template.instance().uploadingSIDFront.get();
  },
  uploadingSIDBack: function () {
    return Template.instance().uploadingSIDBack.get();
  },
  uploadingPIDFront: function () {
    return Template.instance().uploadingPIDFront.get();
  },
  uploadingPIDBack: function () {
    return Template.instance().uploadingPIDBack.get();
  },

  // PARTICIPANT: information
  lp: function () {
    setSessions();
    return Object.assign(Template.instance().participant.get(),
      Participants.findOne(Template.instance().participant.get()._id));
  },

  // Terms and Conditions
  hasAcceptedTandC: function () {
    return Template.instance().hasAcceptedTandC.get();
  },

  // show different button text based on if hasPaid and email is verified
  proceedButton: function () {
    let template = Template.instance();
    let p = template.participant.get();

    if (!template.hasUser && !template.emailVerified) {
      return 'Verify email'
    }

    return 'Save'
  },

  // email not verified && account created
  emailNotVerified: function () {
    let template = Template.instance();
    let p = template.participant.get();

    return !template.emailVerified && p && template.hasUser;
  },

  hasToPay: function () {
    let template = Template.instance();
    let p = template.participant.get();

    return !p.hasPaid && template.hasUser
  },

  complete: () => {
    let p = Participants.findOne();
    let filling = Template.instance().filling.get();

    // if admin never show the completed message
    if (Roles.userIsInRole(Meteor.userId(), 'admin')) return false;

    return (p && !filling ? p.statusComplete : false);
  },
  isExternal: function () {

    // since external participants (not cp) do not have an account
    // here it checks whether is neither unibz nor admin
    return !Roles.userIsInRole(Session.get('_id'), ['unibz', 'admin'])
  }
});

Template.UserFormSection.events({
  // CHANGE: isHelper/isHost checkboxes
  'change input[name="internals"]': (item, template) => {
    let id = item.target.id;
    let checked = item.target.checked;
    console.info(id, checked);
    template[id].set(checked);
  },
  //CHANGE day1 activitiy
  'change input[name="swimming"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    
    template.isDay1Swimming.set(checked);

    if(template.isDay1Swimming) {
      template.isDay1BubbleFootball.set(false);
      template.isDay1Other.set(false);};
    console.info(id, checked);
  },
  'change input[name="bubble_football"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay1BubbleFootball.set(checked);
    if(template.isDay1BubbleFootball) {
      template.isDay1Swimming.set(false);
      template.isDay1Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day1_other"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay1Other.set(checked);
    if(template.isDay1Other) {
      template.isDay1Swimming.set(false);
      template.isDay1BubbleFootball.set(false);
    };

    console.info(id, checked);
  },
  //CHANGE: day2 activities
  'change input[name="day2_ski_or_snow"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2SkiOrSnow.set(checked);
    if(template.isDay2SkiOrSnow) {
      template.isDay2SkiCourse.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2JibSession.set(false);
      template.isDay2Other.set(false);
    };
    /*swal('Important!',
      'You will receive your skipass at the check-in of the event. From the moment you receive the skipass/es you are fully responsible of them. In case of loss you will have to buy a new one on your own.'
      , 'info');*/
    console.info(id, checked);
  },
  'change input[name="day2_ski_course"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2SkiCourse.set(checked);
    if(template.isDay2SkiCourse) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2JibSession.set(false);
      template.isDay2Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day2_snow_course"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2SnowCourse.set(checked);
    if(template.isDay2SnowCourse) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SkiCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2JibSession.set(false);
      template.isDay2Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day2_ski_race"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2SkiRace.set(checked);
    if(template.isDay2SkiRace) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SkiCourse.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2JibSession.set(false);
      template.isDay2Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day2_snow_race"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2SnowRace.set(checked);
    if(template.isDay2SnowRace) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SkiCourse.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2JibSession.set(false);
      template.isDay2Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day2_jib_session"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2JibSession.set(checked);
    if(template.isDay2JibSession) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SkiCourse.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2Other.set(false);
    };
    console.info(id, checked);
  },
  'change input[name="day2_other"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay2Other.set(checked);
    if(template.isDay2Other) {
      template.isDay2SkiOrSnow.set(false);
      template.isDay2SkiCourse.set(false);
      template.isDay2SnowCourse.set(false);
      template.isDay2SkiRace.set(false);
      template.isDay2SnowRace.set(false);
      template.isDay2JibSession.set(false);
    };
    console.info(id, checked);
    
  },
  //CHANGE: day3 activities
  'change input[name="day3_snow_volley"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay3Snowvolley.set(checked);
    if(template.isDay3Snowvolley) {
      template.isDay3SnowFootball.set(false);
      template.isDay3SkiOrSnow.set(false);
      template.isDay3Other.set(false);
    };
    console.info(id, checked);
    
  },
  'change input[name="day3_snow_football"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay3SnowFootball.set(checked);
    if(template.isDay3SnowFootball){
      template.isDay3Snowvolley.set(false);
      template.isDay3SkiOrSnow.set(false);
      template.isDay3Other.set(false);
    };
    console.info(id, checked);
    
  },
  'change input[name="day3_ski_or_snow"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay3SkiOrSnow.set(checked);
    if(template.isDay3SkiOrSnow) {
      template.isDay3Snowvolley.set(false);
      template.isDay3SnowFootball.set(false);
      template.isDay3Other.set(false);
    };
    /*swal('Important!',
      'You will receive your skipass at the check-in of the event. From the moment you receive the skipass/es you are fully responsible of them. In case of loss you will have to buy a new one on your own.'
      , 'info');*/
    console.info(id, checked);
    
  },
  'change input[name="day3_other"]':(item, template) => {
    let id = item.target.id;
    checked = item.target.checked;
    template.isDay3Other.set(checked);
    if(template.isDay3Other) {
      template.isDay3Snowvolley.set(false);
      template.isDay3SnowFootball.set(false);
      template.isDay3SkiOrSnow.set(false);
    };
    console.info(id, checked);
    
  },
  // CHANGE: rental type
  'change #rent_material':(event, template) => {
    let rentingSkiis = _.isEqual(event.target.value, 'Ski');
    template.rentSkiis.set(rentingSkiis);
    let rentingSnowboard = _.isEqual(event.target.value, 'Snowboard');
    template.rentSnowboard.set(rentingSnowboard);
    let noRenting = _.isEqual(event.target.value, 'None');
    template.noRent.set(noRenting);
    if(noRenting) {
      if(template.rentSkiBoots) {template.rentSkiBoots.set(false);};
      if(template.rentSkiSticks) {template.rentSkiSticks.set(false);};
      if(template.rentSnowboardBoots) {template.rentSnowboardBoots.set(false);};
      if(template.rentHelmet) {template.rentHelmet.set(false);};
    };
    if(rentingSkiis) {
      if(template.rentSnowboardBoots) {template.rentSnowboardBoots.set(false);};
    };
    if(rentingSnowboard) {
      if(template.rentSkiBoots) {template.rentSkiBoots.set(false);};
      if(template.rentSkiSticks) {template.rentSkiSticks.set(false);};
    };
  },

  //CHANGE: DAY1 activities

  // CHANGE: number of guests
  'change #noOfGuests': (event, template) => {
    template.noOfGuests.set(_.toNumber(event.target.value));
  },
  'change #studentDorm': (event,template) => {
    let dorm = event.target.value;
    if (dorm == "univercity") {template.isDormUnicity.set(true);
      template.isDormDante.set(false)}
    else if (dorm == "dante") {template.isDormDante.set(true);
      template.isDormUnicity.set(false)}
    else {template.isDormUnicity.set(false);
      template.isDormDante.set(false)
    };
    console.log(dorm);
  },
  // CHANGE: accommodation type
  'change #accommodationType': (event, template) => {
    let isDorm = _.isEqual(event.target.value, 'dorm');
    
    template.isInDorm.set(isDorm);
    if (isDorm) {
      console.log("passa");
      dorm = template.studentDorm;
    if (dorm == "univercity") {template.isDormUnicity.set(true);
      template.isDormDante.set(false)}
    else if (dorm == "dante") {template.isDormDante.set(true);
      template.isDormUnicity.set(false)}
    else {template.isDormUnicity.set(false);
      template.isDormDante.set(false)
    };
      /*swal('Important!',
      'We will give you an extra key at the check-in to give to your guest but they will be responsible of their own key, if lost they have to pay a fee. PLEASE be sure to collect the extra key at the end of the event and leave it at the student hall reception. \n' + 
      '(If places are finished in your student hall, you can become a helper to get the discount.)'
      , 'info');*/
      /*swal('',
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">We will give you an extra key at the check-in to give to your guest but they will be responsible of their own key, if lost they have to pay a fee. PLEASE be sure to collect the extra key at the end of the event and leave it at the student hall reception.</span></strong></p>' +
      '<p>&nbsp;</p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Rainerum:</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;"> 1 guest per student</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Peter Rigler</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">: 1 guest per student</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Marianum: </span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">no guests allowed (in order to get the discount you can become a helper)</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Haus st. Benedikt</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">: 1 guest per student</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Univercity</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">: 1 guest per student. Double apartments: max 3 guests if both students agree.</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Kolping</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">: no guests allowed (in order to get the discount you can become a helper)</span></p>' +
      '<p style="line-height: 1.2; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">Kolping - Dante apartments</span></strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-weight: 400; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">: max 3 guests in each apartment</span></p>' +
      '<p>&nbsp;</p>' +
      '<p style="line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;"><strong><span style="font-size: 11pt; font-family: Arial; color: #000000; background-color: transparent; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;">(If places are finished in your student hall, you can become a helper to get the discount.)</span></strong></p>'
      , 'info');*/
      template.noOfGuests.set(1);
    }else{
      template.isDormUnicity.set(false);
      template.isDormDante.set(false);
    }
    
    template.isInDorm.set(isDorm);
  },
  'click #resendEmailVerification': function (event, template) {
    Meteor.call('sendVerificationLink', (error) => {
      if (error) {
        swal('Error', error.reason, 'error');
      } else {
        swal('Success', 'Please check your email and click on the confirmation link!', 'success');
      }
    });
  },

  // form submission
  'submit #user_form': function (event, template) {
    event.preventDefault();

    // values from form elements
    const target = event.target;

    // save previous save button text to restore in case of failure
    let previousText = $(target.save).text();

    // get settings
    let settings = template.settings.get();

    // saving spinner
    $(target.save).text('Loading...');

    // // check STUDENT ID
    if (!template.hasStudentIDFront.get() && !template.isAdmin) {
      $(target.save).text(previousText);
      return swal('Error', 'You need to upload your personal ID!', 'warning');
    }
    if (!template.hasStudentIDBack.get() && !template.isAdmin) {
      $(target.save).text(previousText);
      return swal('Error', 'You need to upload your personal ID!', 'warning');
    }

    // check PERSONAL ID
    if (!template.hasPersonalIDFront.get() && !template.isAdmin && !_.isEqual(target.university.value, 'Alumni Bolzano')) {
      $(target.save).text(previousText);
      return swal('Error', 'You need to upload your personal ID!', 'warning');
    }
    if (!template.hasPersonalIDBack.get() && !template.isAdmin && !_.isEqual(target.university.value, 'Alumni Bolzano')) {
      $(target.save).text(previousText);
      return swal('Error', 'You need to upload your personal ID!', 'warning');
    }

    // between the 15th and the 21st people can register only if they are helpers or hosts
    if (template.hasToBeHelperOrHost && !template.isHost.get() && !template.isHelper.get()) {
      $(target.save).text(previousText);
      return swal('Error', 'You need to be either a helper or a host in order to register!', 'warning');
    }

    // let p = template.participant.get()._id;
    // if (_.isEqual($.inArray('hasPersonalID', settings), -1) && !isAdmin) {
    //   $(target.save).text('Save');
    //   return swal('Error', 'You need to upload your personal ID!', 'warning');
    // }
    //
    // if (_.isEqual($.inArray('hasStudentID', settings), -1) && !isAdmin && !_.isEqual(p.university, 'Alumni Bolzano')) {
    //   $(target.save).text('Save');
    //   return swal('Error', 'You need to upload your student ID!', 'warning');
    // }

    let parsedDate = _.replace(target.birth_date.value, /\//g, '-');
    let splitDate = parsedDate.split('-');
    if (_.isEqual(splitDate[0].length, 2))
      parsedDate = splitDate[2] + '-' + splitDate[1] + '-' + splitDate[0];

    // TODO: if first name and last name change either disable or change user info

    const participant = {
      _id: template.participant.get()._id,
      firstName: target.first_name.value,
      lastName: target.last_name.value,
      studentID: target.student_id.value,
      email: target.email.value,
      gender: target.gender.value,
      phone: target.phone.value,
      university: target.university.value,
      info: {
        street: target.street.value,
        number: target.number.value,
        room: target.room_number.value,
        city: target.city.value,
        zip: _.toInteger(target.zip.value),
        province: target.province.value,
        country: target.country.value
      },
      birth: {
        date: parsedDate,
        country: target.birth_country.value
      },
      //Activities
      day1: {
        swimming: target.swimming.checked,
        bubble_football: target.bubble_football.checked,
        other_activities: target.day1_other.checked,
      },
      day2: {
        ski_or_snow: target.day2_ski_or_snow.checked,
        ski_course:target.day2_ski_course.checked,
        snow_course:target.day2_snow_course.checked,
        ski_race:target.day2_ski_race.checked,
        snow_race:target.day2_snow_race.checked,
        jib_session:target.day2_jib_session.checked,
        other_activities: target.day2_other.checked,
      },
      day3: {
        snow_volley_tournament: target.day3_snow_volley.checked,
        snow_football_tournament: target.day3_snow_football.checked,
        ski_or_snow: target.day3_ski_or_snow.checked,
        other_activities: target.day3_other.checked,
      },
      
      //activity: target.activity.checked,
      //rental: target.rental.checked,
      //course: target.course.checked,
      //isVolleyPlayer: target.isVolleyPlayer.checked,
      //isFootballPlayer: target.isFootballPlayer.checked,
      foodAllergies: target.food_allergies.value,
      shoeSize: target.shoe_size.value,
      height: target.height.value,
      weight: target.weight.value,
      tshirt: target.tshirt.value,

      //rental
      rentMaterial: target.rent_material.value,
      rentSkiBoots: (template.rentSkiis.get() ? target.rentSkiBoots.checked: false),
      rentSkiSticks: (template.rentSkiis.get() ? target.rentSkiSticks.checked: false),
      rentSnowboardBoots: (template.rentSnowboard.get() ? target.rentSnowboardBoots.checked: false),
      rentHelmet: ((template.rentSnowboard.get() || template.rentSnowboard.get()) ? target.rentHelmet.checked: false),
      // HELPER
      isHelper: template.isHelper.get(),
      helperCategory: (template.isHelper.get() ? target.helperCategory.value : undefined),

      // HOST
      isHost: template.isHost.get(),
      isDormDante: (template.isHost.get() ? template.isDormDante.get() : undefined),
      isDormUnicity: (template.isHost.get() ? template.isDormUnicity.get() : undefined),
      accommodationType: (template.isHost.get() ? target.accommodationType.value : undefined),
      studentDorm: (template.isHost.get() && template.isInDorm.get() ? target.studentDorm.value : undefined),
      guestPreference: (template.isHost.get() ? target.guestPreference.value : undefined),
      noOfGuests: (template.isHost.get() ? target.noOfGuests.value : undefined),

      // PAYMENT
      amountToPay: calculateFinalPrice(),
      paymentID: template.paymentID
    };

    // if not admin, set hasAcceptedTandC to true when saving
    if (!Roles.userIsInRole(Meteor.user(), 'admin')) participant['hasAcceptedTandC'] = true;

    // check security section on Meteor's documentation
    Meteor.call('participants.update', participant, function (error, result) {

      console.log(error);
      if (error) {
        swal('Error', error.reason.split('#')[0], 'error');
        $(target.save).text(previousText);
        return;
      }

      // UPDATE user if already exists
      if (!!template.userId) {
        Meteor.users.update({_id: template.userId}, {
          $set: {
            profile: {
              firstName: participant.firstName,
              lastName: participant.lastName,
              gender: participant.gender,
              university: participant.university
            }
          }
        }, function (error) {
          if (error) swal('Error', 'There has been an error saving your profile!', 'error');
          else swal('Success', "Profile updated!     Amount to pay: "+ participant.amountToPay + '€.', 'success');
        });
      }

      // CREATE user
      else {
        Accounts.createUser({
          email: participant.email,
          password: target.password.value,
          profile: {
            participantId: participant._id,
            firstName: participant.firstName,
            lastName: participant.lastName,
            gender: participant.gender,
            university: participant.university
          }
        }, function (error) {
          if (error) {
            swal('Error', `There has been an error while creating your account. Please contact us at it@snowdays.it. Thank you (${error.reason})`, 'error');
          } else {
            Roles.addUsersToRoles((template.userId ? template.userId : Meteor.userId()), 'unibz');
            Meteor.call('sendVerificationLink', (error) => {
              if (error) {
                swal('Error', error.reason, 'error');
              }
            });
            swal('Success', "Profile Created!     Amount to pay: "+ participant.amountToPay + '€.', 'success');
          }
        });
      }

      // if (Roles.userIsInRole(Meteor.user(), 'admin')) {
      //   $('html, body').animate({scrollTop: 0}, 'fast');
      //   Session.set('tab', 'AdminListSection');
      // }
      //
      // if (Roles.userIsInRole(Meteor.user(), 'unibz')) {
      //   $('html, body').animate({scrollTop: 0}, 'fast');
      //   template.filling.set(false);
      // } else if (_.has(Session.get('tab'), 'previous')) {
      //   let previous = Session.get('tab')['previous'];
      //   if (!_.isUndefined(previous)) Session.set('tab', {name: previous})
      // }

      $(target.save).text('Save');
    })
  },

  // upload files
  'change #has_personal_id_front': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'personal', 'front')
    }
  },
  'change #has_personal_id_back': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'personal', 'back')
    }
  },

  'change #has_student_id_front': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'student', 'front')
    }
  },
  'change #has_student_id_back': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      uploadID(e.currentTarget.files[0], template, 'student', 'back')
    }
  },

  'click #acceptTandC': function (e, template) {
    template.hasAcceptedTandC.set(true);
    getSettings(template)
  },

  'click #edit-profile': function (e, template) {
    template.filling.set(true);
    getSettings(template)
  },
});

function setSessions() {
  // _id session variable if _id is property of session variable tab
  if (!_.isUndefined(Session.get('tab')) && _.has(Session.get('tab'), '_id')) {
    Session.set('_id', Session.get('tab')._id);
  }
}

function uploadID(file, template, idType, bf) {
  // if (_.isUndefined(Session.get('_id'))) {
  //   swal('Error', 'A server side error occurred. Please contact it@snowdays.it', 'error');
  //   throw new Meteor.Error('uploadID', 'Session.get(_id) is not defined');
  // }
  const _id = template.participant.get()._id;

  let p = {_id: _id};
  let key = (_.isEqual(idType, 'personal') ? 'hasPersonalID' : 'hasStudentID');
  let keyBF = `${key}${_.capitalize(bf)}`;
  p[keyBF] = true;
  console.log(p);

  // We upload only one file, in case
  // multiple files were selected
  const upload = IDs.insert({
    file: file,
    streams: 'dynamic',
    chunkSize: 'dynamic',
    // transport: 'http',
    meta: {
      type: keyBF,
      userId: _id
    }
  }, false);

  upload.on('start', function () {
    $('#has_' + idType + '_id_' + bf).removeClass('fadeOut').addClass('animated fadeIn');
    $('#loader-label').removeClass('fadeOut').addClass('animated fadeIn');
    toggleLoading(idType, bf, template)
  });

  upload.on('error', function (error, fileData) {
    if (error) {
      $('#has_' + idType + '_id_' + bf).removeClass('fadeOut').addClass('animated fadeIn');
      swal('Error', error.message, 'error')
    }
  });

  upload.on('end', function (error, fileObj) {
    if (error || !fileObj) {
      return swal('Error', `Error during upload ${error ? ': ' + error : ''}`, 'error');
    } else {
      // update participant
      Meteor.call('participants.update', p, function (error, result) {

        // if error delete image
        if (error) {
          IDs.remove({_id: fileObj._id});
          swal('Error', error.message, 'error');
        } else {
          // notify user
          swal('Uploaded', 'Your ' + idType + ' ID has been uploaded!', 'success');
          template[keyBF].set(true);
        }
      });
    }

    $('#loader-label').removeClass('fadeIn').addClass('animated fadeOut');
    toggleLoading(idType, bf, template)
  });

  upload.start();
}

/**
 * Calculate final price to pay based on whether he/she is a helper and # of hosts.
 * @returns {string}
 */
function calculateFinalPrice() {
  let template = Template.instance();
  let price = 110;
/*
  // HELPER + HOST
  if (template.isHelper.get() && template.isHost.get()) {
    price = price - 35;
  }

  // HELPER OR HOST
  else if (template.isHelper.get() || template.isHost.get()) {
    price = price - 20;
  }
*/
// HOST
if ( template.isHost.get()) {
  price = price - 30;
  // NUMBER OF GUESTS
  let noOfGuests = template.noOfGuests.get();
  if (noOfGuests > 1) {
    price = price - (15 * (noOfGuests - 1));
  }
}
  

  // cannot go beyond 50
  if (price < 50) {
    price = 50;
  }

  return price
}

function calculatePaymentID() {
  return Math.random().toString(36).slice(-8);
}

function getSettings(template) {
  let userId = Session.get('_id');
  Meteor.call('settings.get', userId, function (error, result) {
    if (result && result.form && result.form.doNotAsk) {
      _.forEach(result.form.doNotAsk, function (setting) {
        // set settings as reactive variable
        template.settings.set(result.form.doNotAsk);
        let elemId = _.snakeCase(setting);
        $('#' + elemId).remove();
        $('label[for=' + elemId + ']').remove()
      })
    }
  });
}

function facebookSetup() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: '216607852080016',
      xfbml: true,
      version: 'v2.8'
    });
    FB.AppEvents.logPageView();
  };

  (function (d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

function toggleLoading(type, bf, template) {
  switch (type) {
    case 'personal':
      let key_p = `uploadingPID${_.capitalize(bf)}`;
      let p_value = template[key_p].get();
      console.log(p_value);
      template[key_p].set(!p_value);
      break;
    case 'student':
      let key_s = `uploadingSID${_.capitalize(bf)}`;
      let s_value = template[key_s].get();
      console.log(s_value);
      template[key_s].set(!s_value);
      break;
    default:
      throw new Meteor.Error('toggleLoading', 'Unknown type');
  }
}

Template.SuccessSection.onCreated(function () {
  Meteor.subscribe('participant.internal', localStorage.getItem('id'))
});

Template.SuccessSection.helpers({
  lp: function () {
    return Participants.findOne(localStorage.getItem('id'));
  },
});