
import "./admin.match.html";
import MatchingParticipants from '/imports/collections/matchingresults';
import "/imports/ui/components/loader/loader";
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'

const matchingParticipantsIndices = {
      'host': 1,
      'hostPhoneNumber':1,
      'Room':1,
      'GuestFirstName': 1,
      'GuestLastName': 1,
      'GuestPhonenumber': 1,
      'GuestEmail': 1,
      'University': 1,
      'Accommodation': 1
    };

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'}
});

// catches all exceptions on the server
raven.patchGlobal(client);

Template.AdminMatchSection.onCreated(function () {

  // generate dummy content
  Meteor.startup(function () {
    if (MatchingParticipants.find().count() === 0) {
        MatchingParticipants.insert({
          _id: '500',
          host: 'Anna',
          hostPhoneNumber: '+3912737475',
          Room: '003',
          GuestFirstName: 'John',
          GuestLastName: 'John',
          GuestPhoneNumber: '+3927356562',
          GuestEmail: 'John@gmail.com',
          University: 'UNIBZ',
          Accommodation: 'Rigler'
        });
    }
  });
    Session.set('showMap',false);
    Session.set('displayMatchingList',false);
    Session.set('isLoading', false);

    let template = Template.instance();
    
    template.flattenedFields = new ReactiveVar(matchingParticipantsIndices);
    
    template.collection = new ReactiveVar({
        name: 'MatchingParticipants',
        instance: MatchingParticipants,
        flattened: template.flattenedFields.get(),
        searchQuery: '',
        filters: []
    });
  });

Template.AdminMatchSection.onRendered(function () {

});

Template.AdminMatchSection.helpers({
    showTheMapHelper:function(){
        return Session.get('showMap');
    },

    displayMatchingListHelper: function() {
      return Session.get('displayMatchingList');
    },

    isLoadingHelper: function(){
      return Session.get('isLoading');
    },
})

Template.AdminMatchSection.events({

    'click #matchingBus': function (event, template) {
      debugger;
      var elem = document.getElementById("myBar");   
      var width = 10;
      var id = setInterval(frame, 10);
      function frame() {
          if (width >= 100) {
          clearInterval(id);
          //alert("Hi I'm an alert!")
          Session.set('showMap',true);
          } else {
          width++; 
          elem.style.width = width + '%'; 
          elem.innerHTML = width * 1  + '%';
          }
      }
    },
    
    'click #matchingParticipants': function(event,template) {
      debugger;
      var width = 10;
      var id = setInterval(frame, 10);
      let collection = template.collection.get();
      Meteor.subscribe("MatchingParticipants.all", () => {
           console.log('load data', MatchingParticipants.find().fetch());
          setTimeout(() => {
              generateTable(template);
          }, 300);
      });
      function frame() {
          if (width >= 100) {
            clearInterval(id);
            Session.set('isLoading',false);
            Session.set('displayMatchingList',true);
          } else {
            Session.set('isLoading',true);
            width++; 
          }
      }
    },

})

//Function
function generateTable(template) {
  let collection = template.collection.get();
  let list = collection.instance.find().fetch();
  let schema = collection.instance.simpleSchema();

  let table = $('#MatchingParticipants_table');
  let tableHead = table.find('thead');
  let tableBody = table.find('tbody');
  let flattened = {};
  let count = 0;

  // set select value
  $('#collection_select').val('MatchingParticipants');

  // get flattened object
  flattened = collection.flattened;

  // remove all
  tableHead.children().remove();
  tableBody.children().remove();

  // HEADER
  tableHead.append("<tr>");
  tableHead.append("<th class='animated fadeIn'>#</th>");

  _.forEach(flattened, function (value, key) {
      // get labels from schema schema
      tableHead.append("<th class='animated fadeIn'>" + (_.isNull(schema) ? key : schema.label(key)) + "</th>");
  });
  debugger;
  tableHead.append("</tr>");

  // BODY
  _.forEach(list, function (row) {
      tableBody.append("<tr class='animated fadeIn'>");

      // count column
      tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++count + "</th>");

      _.forEach(flattened, function (value, key) {
          let cell = deepFind(row, key);
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
      });
      tableBody.append("</tr>");
  });
}