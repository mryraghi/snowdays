
import "./admin.match.html";
import MatchingParticipants from '/imports/collections/matchingresults';
import AccommodationsT from '/imports/collections/accommodations';
import "/imports/ui/components/loader/loader";

import jwt from 'jsonwebtoken';
import _ from "lodash";
import moment from "moment";
import { flatten }from 'flat';
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'

//AccomodationT = new Mongo.Collection('accommodations');

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
  Session.set('subtab', 'BusSection');
  Session.set('isWGReady', true);
  Session.set('showMap',false);
  Session.set('displayMatchingList',false);
  Session.set('isLoading', false);
  Session.set('matchingResults', []);
  
  //alert(AccomodationT.find().count());
  // generate dummy content
  Meteor.startup(function () {
    // if (MatchingParticipants.find().count() === 0) {
    //     MatchingParticipants.insert({
    //       _id: '500',
    //       host: 'Anna',
    //       hostPhoneNumber: '+3912737475',
    //       Room: '003',
    //       GuestFirstName: 'John',
    //       GuestLastName: 'John',
    //       GuestPhoneNumber: '+3927356562',
    //       GuestEmail: 'John@gmail.com',
    //       University: 'UNIBZ',
    //       Accommodation: 'Rigler'
    //     });
    // }
    
  });
    
    

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
    displayMatchingResults:function () {
        return Session.get('matchingResults')
    },
    displayMatchingListHelper: function() {
      return Session.get('displayMatchingList');
    },
    isLoadingHelper: function(){
      return Session.get('isLoading');
    },
    subtab: function () {
      return Session.get('subtab');
    },
    isActive: function (section) {
      let subtab = Session.get('subtab');
      if (_.isEqual(subtab, section)) return 'sn-menu-item-active'
    },
    isWGMatchingReady: function() {
      return true;
    }
})

Template.WGSection.helpers({
  isWGMatchingReady: function() {
    return Session.get('isWGReady');
  }
});

Template.AdminMatchSection.events({

    'click .sn-menu-item': (event, template) => {
      switch (event.currentTarget.id) {
        case 'bus':
         Session.set('subtab', 'BusSection');
        break;
        case 'accommodation':
          Session.set('subtab', 'AccommodationSection');
        break;
        case 'wg':
          Session.set('subtab', 'WGSection');
        break;
      }
    },
    'click #matchingBus': function (event, template) {
      
      Meteor.subscribe("accommodations.all");
      //console.log(AccommodationsT.find({}, {fields: {'_id':1}}).count());

      var arrComodations=AccommodationsT.find({}, {fields: {'_id':1}}).fetch();

      //console.log(arrComodations[0]._id);
      //Evaluating First Accomodation on server, needed to do for each
      var clientResult = Meteor.apply('evaluateAccomodation',
          [arrComodations[0]._id]
        , {returnStubValue: true},

          function(err, evalResult) {
            //console.log("result");
            //Here have to update the progress of the bar
        }
      );
      
      let st = (100/Math.floor((Math.random() * 100) + 50));
      //alert(st);
      move(st);

    },
    
    'click #matchingParticipants': function(event,template) {
      let collection = template.collection.get();
      const tableName = '#MatchingParticipants_table';
      Session.set('isLoading',true);
      Meteor.call('matching_algorithm',  function (error, results) {
             Session.set('matchingResults', results.content);
             generateTable(results.content, tableName);
             Session.set('isLoading',false);
             Session.set('isWGReady', true);
      });
    },

})

//Function
function generateTable(collection,tableName) {
  var results = JSON.parse(collection);

  let table = $(tableName);
  let tableHead = table.find('thead');
  let tableBody = table.find('tbody');
  let flattened = {};
  let count = 0;

  // set select value
  $('#collection_select').val('MatchingParticipants');

  // get flattened object
  flattenedResult = flatten(results.data[0]);

  // remove all
  tableHead.children().remove();
  tableBody.children().remove();

  // HEADER
  tableHead.append("<tr>");
  tableHead.append("<th class='animated fadeIn'>#</th>");

  _.forEach(flattenedResult, function (value, key) {
      // get labels from schema schema
      tableHead.append("<th class='animated fadeIn'>" + key + "</th>");
  });
  tableHead.append("</tr>");

  // BODY
  _.forEach(results.data, function (row) {
      tableBody.append("<tr class='animated fadeIn'>");

      // count column
      tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++count + "</th>");

      _.forEach(flattenedResult, function (value, key) {
          let cell = deepFind(row, key);
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
      });
      tableBody.append("</tr>");
  });
}
function move(num){
  var elem = document.getElementById("myBar");   
  var width = 10;
  var id = setInterval(frame, 100);
  function frame() {
      if (width >= 100) {
      clearInterval(id);
      //alert("Hi I'm an alert!")
      Session.set('showMap',true);
      } else {
      width+=num; 
      if(width>100){
        width = 100;

      }
      elem.style.width = width + '%'; 
      
      Meteor.subscribe('accommodations.all');
      elem.innerHTML = 
      Accommodations.find().count()+" accommodations: " +(width.toPrecision(3) * 1  + '%') ;
      }
    }
}