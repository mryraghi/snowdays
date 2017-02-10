import "./home.html";
import LazyLoad from "vanilla-lazyload";
import initHeadline from "/lib/js/animated-headline";

// Flickity
// const Flickity = require('flickity');
// import 'flickity/css/flickity.css';

Template.Home.onRendered(function () {
  initHeadline();
  initTeamCarousel();

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

  // var flickity = new Flickity('.carousel', {
  //   lazyLoad: true,
  //   autoPlay: true,
  //   prevNextButtons: false
  // });


});


Template.Home.events({
  'click .nav-link': function (event, template) {
    console.log(event.target);
    $('body,html').animate(
      {'scrollTop': $($(event.currentTarget).attr('href')).offset().top},
      500
    );
  }
});

Meteor.startup(function () {

});

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