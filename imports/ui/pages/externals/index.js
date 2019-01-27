import Survey from "survey-knockout";
import Participants from "/imports/collections/participants";
import Surveys from "/imports/collections/surveys";
import "./externals.html";
import "../../components/forms/participant.form";
import "./participants.table";
import "/imports/ui/components/loader/loader";
import swal from 'sweetalert2';

Template.ExternalsPage.onCreated(function () {
  // subscribe as soon the template is created
  this.subscribe("users.current");
  this.subscribe('participant.external', Meteor.userId());
  this.subscribe("participants.all.related");
  // set default tab
  Session.set('tab', {name: 'ParticipantWelcomeSection'})

});


Template.ExternalsPage.events({

  'click #logout': (event, template) => {
    Meteor.logout((error) => {
      // window.drift.reset();
      if (error) console.log(error)
    })
  },

  'click .sn-menu-item': (event, template) => {
    switch (event.currentTarget.id) {
      case 'welcome':
        Session.set('tab', {name: 'ParticipantWelcomeSection'});
        break;
      case 'stats':
        Session.set('tab', {name: 'ParticipantStatsSection'});
        break;
      case 'profile': 
        Session.set('tab', {name: 'UserFormSection', _id: Meteor.userId()});
        break;
      case 'participants':
        Session.set('tab', {name: 'ParticipantsTableSection'});
        break;
      case 'add_new':
        Session.set('tab', {name: 'UserFormSection'});
        break;
      case 'survey':
        Session.set('tab', {name: 'SurveySection'});
        break;
    }
  }

});

Template.ExternalsPage.helpers({
  tab: function () {
    return Session.get('tab').name;
  },
  survey: function () {
    const user = Meteor.user();
    if (user && user.profile) return !user.profile.survey
  },
  lp: function () {
    return Participants.findOne({_id: Meteor.userId()})
  },
  isActive: function (section) {
    let tab = Session.get('tab');
    if (_.isEqual(tab.name, section) && (_.isUndefined(tab._id) || _.isEqual(tab._id, Meteor.userId())))
      return 'sn-menu-item-active'
  }
});

Template.SurveySection.onRendered(function () {
  // Survey.Survey.cssType = "bootstrap";
  const survey = new Survey.Survey(
    {
      completedHtml: "<h6 class=\"text-success my-1 text-center\">Thank you, your efforts are greatly appreciated.</h6>",
      pages: [
        {
          name: "page1",
          questions: [
            {
              type: "rating",
              isRequired: true,
              name: "experience",
              title: "How would you rate your experience with Snowdays' website?"
            }
          ]
        },
        {
          name: "page2",
          questions: [
            {
              type: "comment",
              name: "problems",
              title: "Have you encountered any problems?"
            }
          ]
        },
        {
          name: "page3",
          questions: [
            {
              type: "comment",
              name: "suggestions",
              title: "Do you have any other website-related suggestion or comments to give?"
            }
          ]
        }
      ],
      showPageNumbers: true
    });

  survey.css = {
    root: "",
    rating: {root: "btn-group btn-group-sm"},
    error: {
      root: "text-danger",
      icon: "fa fa-times"
    },
    comment: "sn-field-textarea",
    navigationButton: "sn-btn-empty-blue sn-btn-sm mt-1 mr-1",
    navigation: {complete: "sn-btn-empty-green sn-btn-sm"},
    text: "form-control"
  };

  // TODO: check update profile.survey
  survey.onComplete.add(function (s) {
    Surveys.insert(s.data, function (error) {
      if (error) {
        swal('Error', 'There was an error sending your feedback.', 'error')
      } else {
        Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.survey': true}}, function (error) {
          if (error) swal('Error', error, 'error')
        })
      }
    })
  });
  survey.render("website-survey");
});

Template.ParticipantStatsSection.onCreated(function () {
  this.subscribe('participants.all.related');

  let currentUser = Template.instance().data;

  if (this.subscriptionsReady()) {
    console.log(Participants.find().fetch())
  }

  // get info about related participants
});

Template.ParticipantStatsSection.helpers({
  snowvolley: function () {
    return Participants.find({"isVolleyPlayer": true}).fetch()
  },
  snowfootball: function () {
    return Participants.find({"isFootballPlayer": true}).fetch()
  },
  skirace: function () {
    return Participants.find({"day2.activity": "ski race"}).fetch()
  },
  snowboardrace: function () {
    return Participants.find({"day2.activity": "snowboard race"}).fetch()
  }
});