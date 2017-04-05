import "./home.html";
import "./schedule";
import LazyLoad from "vanilla-lazyload";
import initHeadline from "/lib/js/animated-headline";
import countdown from "/lib/js/countdown.min";

// Flickity
// const Flickity = require('flickity');
// import 'flickity/css/flickity.css';
Template.Home.onCreated(function () {
  Session.set('countdown', [])
});

Template.Home.onRendered(function () {
  initHeadline();
  initTeamCarousel();

  // initiates lazy loading library
  // TODO: check because with parallax some pictures do not have the data-* attribute
  let myLazyLoad = new LazyLoad();

  Session.set("showLoadingIndicator", true);

  TAPi18n.setLanguage('it')
    .done(function () {
      Session.set("showLoadingIndicator", false);
    })
    .fail(function (error_message) {
      // Handle the situation
      console.log(error_message);
    });

  countdown.setLabels(
    null,
    null,
    ', ', // overrides final 'and ...'
    ', ',
    'Now!');

  countdown(
    new Date(2017, 2, 9, 9),
    function (ts) {
      let unitArray = ts.toString().split(', ');
      let result = [];
      _.forEach(unitArray, function (unit) {
        let split = unit.split(' ');
        let time = {};
        time[split[1]] = split[0];
        result.push(time)
      });
      Session.set('countdown', result)
    }, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);

  // var flickity = new Flickity('.carousel', {
  //   lazyLoad: true,
  //   autoPlay: true,
  //   prevNextButtons: false
  // });
});


Template.Home.events({
  'click .nav-link': function (event, template) {
    // menu items have .nav-link class
    // go to section with animation
    $('body,html').animate({'scrollTop': $($(event.currentTarget).attr('href')).offset().top}, 500);
  }
});

Template.Home.helpers({
  countdown: function () {
    return Session.get('countdown') || []
  }
});

/**
 * Initiates team carousel with options
 */
function initTeamCarousel() {
  let mySwiper = new Swiper('.team-carousel', {
    loop: true,
    autoplay: 2000,


    slidesPerView: 'auto',
    watchSlidesVisibility: true,

    // Navigation arrows
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',

    breakpoints: {
      575: {
        slidesPerView: 1
      }
    }
  })
}

function initCountdown() {
  Meteor.setTimeout(function () {
    Session.set('countdown', countdown(new Date(2017, 3, 9)).toString())
  }, 1000);
}