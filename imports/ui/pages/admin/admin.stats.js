import "./admin.stats.html";
import Chart from "chart.js";
import _ from "lodash";
import moment from "moment";
import Participants from "/imports/collections/participants";
import randomColor from "randomcolor";
import reflect from "reflect-node";

let participants, users;

Template.AdminStatsSection.onCreated(function () {
  participants = this.subscribe("stats.participants.all");
  users = this.subscribe("stats.users.all");
});

Template.AdminStatsSection.onRendered(function () {
  let ueCanvas = document.getElementById("unibz_externals");
  let genderCanvas = document.getElementById("gender");
  let meanAgesCanvas = document.getElementById("mean_ages");
  let universitiesCanvas = document.getElementById("universities");


  let reflectApiToken = "a1b2c3d-your-secure-api-token-4e5f6g7";

  let usernameParam = {
    field: "Username",
    op: "=",
    value: "tonydanza"
  };

  let tokenParams = [
    usernameParam
  ];

  let signedToken = reflect.generateToken(reflectApiToken, tokenParams);
  console.log(signedToken);



  // _.forEach();

  Tracker.autorun(() => {
    const usersReady = users.ready();
    const participantsReady = participants.ready();

    if (usersReady && participantsReady) {

      // UNIBZ / EXTERNALS
      let ueChart = new Chart(ueCanvas, {
        type: 'doughnut',
        data: {
          labels: [
            "UniBz",
            "Externals"
          ],
          datasets: [
            {
              data: [Participants.find({university: 'UniBz'}).count(), Participants.find().count() - Participants.find({university: 'UniBz'}).count()],
              backgroundColor: randomColor({count: 2, hue: 'red'}),
            }]
        },
        options: {}
      });

      // GENDER CHART
      let genderChart = new Chart(genderCanvas, {
        type: 'pie',
        data: {
          labels: ["Female", "Male"],
          datasets: [{
            data: [Participants.find({gender: 'F'}).count(), Participants.find({gender: 'M'}).count()],
            backgroundColor: randomColor({count: 2, hue: 'orange'}),
          }]
        },
        options: {}
      });


      // MEAN AGES
      let agesObj = {};
      let agesArr = [];
      let agesCountArr = [];
      let sorted = [];
      _.forEach(Participants.find({}, {fields: {'birth.date': 1}}).fetch(), function (participant) {
        if (participant.birth && participant.birth.date) {
          // get year, parse number, push into ages array
          let age = _.toNumber(moment().diff(participant.birth.date, 'years'));

          let value = agesObj[age];
          (value ? value += 1 : value = 1);
          agesObj[age] = value;
        }
      });

      _.forEach(agesObj, function (value, key) {
        agesArr.push(_.toNumber(key));
      });

      mean = _.round(_.mean(agesArr), 1);
      sorted = _.sortedUniq(agesArr);

      _.forEach(sorted, function (v) {
        let value = agesObj[v];
        agesCountArr.push(value);
      });

      let meanAgesChart = new Chart(meanAgesCanvas, {
        type: 'bar',
        data: {
          labels: sorted,
          datasets: [{
            label: `Mean: ${mean}`,
            data: agesCountArr,
            backgroundColor: randomColor({count: sorted.length, hue: 'yellow'}),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });


      // UNIVERSITIES
      let uniObj = {};
      let uniArr = [];
      let uniCountArr = [];
      _.forEach(Participants.find({}, {fields: {'university': 1}}).fetch(), function (participant) {
        if (participant.university) {
          // get year, parse number, push into ages array
          let value = uniObj[participant.university];
          (value ? value += 1 : value = 1);
          uniObj[participant.university] = value;
        }
      });

      _.forEach(uniObj, function (value, key) {
        uniArr.push(key);
        uniCountArr.push(value);
      });

      let universitiesChart = new Chart(universitiesCanvas, {
        type: 'pie',
        data: {
          labels: uniArr,
          datasets: [{
            data: uniCountArr,
            backgroundColor: randomColor({count: uniCountArr.length, hue: 'green'}),
            borderWidth: 1
          }]
        },
        options: {}
      });
    }
  });
});

Template.AdminStatsSection.helpers({
  internals: function () {
    return 750
  },
  externals: function () {
    return 750
  }
});