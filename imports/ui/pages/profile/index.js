import moment from 'moment'
import Survey from 'survey-knockout'
import Participants from '/imports/collections/participants'
import Surveys from '/imports/collections/surveys'

import './profile.html'
import './user-form'
import './participants-table'
import '/imports/ui/components/loader/loader'

Template.ProfilePage.onCreated(function () {
  // subscribe as soon the template is created
  this.subscribe("users.current");

  // set default tab
  Session.set('tab', {name: 'ParticipantsTableSection'})

});


Template.ProfilePage.events({

  'click #logout': (event, template) => {
    Meteor.logout((error) => {
      // window.drift.reset();
      if (error) console.log(error)
    })
  },

  'click .sn-menu-item': (event, template) => {
    switch (event.currentTarget.id) {
      case 'home':
        Session.set('tab', {name: 'HomeSection'});
        break;
      case 'profile':
        Session.set('tab', {name: 'UserFormSection', _id: Meteor.userId()});
        break;
      case 'participants':
        Session.set('tab', {name: 'ParticipantsTableSection'});
        break;
      case 'faq':
        Session.set('tab', {name: 'FaqSection'});
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

Template.ProfilePage.helpers({
  tab: function () {
    return Session.get('tab').name;
  },
  survey: function () {
    const user = Meteor.user();
    if (user) return !user.survey
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

Template.HomeSection.helpers({


  // allowed number of participants
  a_participants: () => {
    const user = Meteor.user();
    // TODO: allowed_participants of undefined
    if (user) return user.profile.allowed_participants
  },
  moment: (date, format) => {
    return moment(date).format(format)
  },
  progress: (n, m) => {
    const p = (n * 100) / m;

    if (0 < p && p < 80) return 'progress-danger';
    if (80 <= p && p < 100) return 'progress-warning';
    return 'progress-success'
  }
});

Template.SurveySection.onRendered(function () {
  // Survey.Survey.cssType = "bootstrap";
  const survey = new Survey.Survey(
    {
      completedHtml: "<h6 class=\"text-success m-y-1 text-xs-center\">Thank you, your efforts are greatly appreciated.</h6>",
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
    navigationButton: "sn-btn-empty-blue sn-btn-sm m-t-1 m-r-1",
    navigation: {complete: "sn-btn-empty-green sn-btn-sm"},
    text: "form-control"
  };

  survey.onComplete.add(function (s) {
    Surveys.insert(s.data, function (error) {
      if (error) {
        swal('Error', 'There was an error sending your feedback.', 'error')
      } else {
        Meteor.users.update({_id: Meteor.userId()}, {$set: {survey: true}}, function (error) {
          if (error) swal('Error', error, 'error')
        })
      }
    })
  });
  survey.render("website-survey");
});
