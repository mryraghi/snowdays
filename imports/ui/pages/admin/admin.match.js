
import "./admin.match.html";
import MatchingParticipants from '/imports/collections/matchingresults';
import Accommodations from '/imports/collections/accommodations';
import "/imports/ui/components/loader/loader";

import jwt from 'jsonwebtoken';
import _ from "lodash";
import moment from "moment";
import { flatten }from 'flat';
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'
import { debug } from "util";
import  Papa from 'papaparse';
import Downloadjs from "downloadjs";

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
  Meteor.startup(function () {
    
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
    subtab: function () {
      return Session.get('subtab');
    },
    isActive: function (section) {
      let subtab = Session.get('subtab');
      if (_.isEqual(subtab, section)) return 'sn-menu-item-active'
    }
})


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

      var arrComodations=Accommodations.find({}, {fields: {'_id':1}}).fetch();

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
    
});


Template.WGSection.helpers({
  isWGMatchingReady: function() {
    return Session.get('isWGReady');
  }
});

Template.AccommodationSection.onCreated(function() {
  Session.set('isWGReady', false);
  Session.set('displayMatchingList',false);
  Session.set('isLoading', false);
  Session.set('matchingInitialResults', []);
  Session.set('matchingWGResults', []);
  Session.set('unMatchedResults', []);
});

Template.AccommodationSection.helpers({
  isCSVReady: function() {
    return Session.get('isWGReady');
  },
  displayMatchingResults:function () {
    return Session.get('unMatchedResults')
  },
  displayMatchingListHelper: function() {
    return Session.get('displayMatchingList');
  },
  isLoadingHelper: function(){
    return Session.get('isLoading');
  },
});
Template.AccommodationSection.events({
  'click #matchingParticipants': function(event,template) {
    const tableName = '#MatchingParticipants_table';
    Session.set('isLoading',true);
    Meteor.call('matching_algorithm',  function (error, results) {
      generateTable(results.initial.content, '#MatchingParticipants_table');
      generateTable(results.second.content, '#MatchingWG_table');
      Session.set('matchingInitialResults', results.initial.content);
      Session.set('matchingWGResults', results.second.content);
      Session.set('isLoading',false);
      Session.set('isWGReady', true);
    });
  },
  'click #download_csv_initial': function (event,template) {
    let collection = Session.get('matchingInitialResults');
    displayFileNameDialog(collection);
  },
  'click #download_csv_second': function (event,template) {
    let collection = Session.get('matchingWGResults');
    displayFileNameDialog(collection);
  },
})

//Function

function displayFileNameDialog(collection) {
  let filename = '';
  swal.setDefaults({
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      allowOutsideClick: false,
      progressSteps: ['1']
  });

  let steps = [
    {
        title: 'Please give the file a name',
        input: 'text',
        showCancelButton: true,
        confirmButtonColor: '#008eff',
        confirmButtonText: 'Download',
        inputValidator: function (result) {
            return new Promise(function (resolve, reject) {
                if (result) {
                    filename = result;
                    resolve()
                } else {
                    reject('You need to write something!')
                }
            })
        },
        preConfirm: function () {
            return new Promise(function (resolve) {
              let options = {};
                options['fileName'] = filename;
                options['download'] = 'all';
                options['collection'] = collection;
                debugger;
                let encoded = jwt.sign(options, 'secret', {expiresIn: 60});
                Meteor.setTimeout(function () {
                    jsonToCSV(options);
                }, 300)
            })
        }
    }
  ];

  swal.queue(steps).then(function () {
      console.log('steps');
      swal.resetDefaults()
  });
}

function jsonToCSV(payload) {
  let jsonResult = JSON.parse(payload.collection);
  let flattened = [];
  _.forEach(jsonResult.data, function (match) {
    flattened.push(flatten(match))
  });

  // parse json and get csv
  let csv = Papa.unparse(flattened);
  Downloadjs(csv, payload.fileName.concat('.csv'), "text/csv");
}

function generateTable(collection,tableName) {
  var results = JSON.parse(collection);
  Session.set('unMatchedResults', results.unassigned_data);

  let table = $(tableName);
  let tableHead = table.find('thead');
  let tableBody = table.find('tbody');
  let flattened = {};
  let count = 0;

  // get flattened object
  flattenedResult = flatten(results.data[0]);
  if(tableName == 'MatchingParticipants_table')

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
    if(_.keys(flattenedResult).length === _.keys(flatten(row)).length ){ 
      tableBody.append("<tr class='animated fadeIn'>");

      // count column
      tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++count + "</th>");

      _.forEach(flattenedResult, function (value, key) {
          let cell = deepFind(row, key);
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
      });
      tableBody.append("</tr>");
    }
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