import "./home.html";
import "./schedule";
import LazyLoad from "vanilla-lazyload";
import initHeadline from "/lib/js/animated-headline";
import countdown from "/lib/js/countdown.min";

// Flickity
// const Flickity = require('flickity');
// import 'flickity/css/flickity.css';
Template.Home.onCreated(function () {
    Session.set('countdown', []);
});

Template.Home.onRendered(function () {
  initHeadline();
  initTeamCarousel();
    initSponsorsCarousel();

    jQuery(document).ready(() => {

        jQuery('div#panorama').paver({
            mouseSmoothingFunction: 'cosine',
            tiltSmoothingFunction: 'cosine',
            tiltThresholdPortrait: 115,
            gracefulFailure: false,
            gyroscopeThrottle: 1000 / 200,
            cursorThrottle: 1000 / 200,
            tiltSensitivity: 0.1
        });

        // check whether Paver has been enabler/disable
        jQuery(document).on('enabled.paver', () => {
            // do nothing
        }).on('disabled.paver', () => {
            // Fallback
            jQuery('img#panorama-img').css({position: "absolute"});
        });

        /**
         * TODO: move this elsewhere!
         */
        //trigger the animation - open modal window
        jQuery('[data-type="modal-trigger"]').on('click', function () {
            let actionBtn = jQuery(this),
                scaleValue = retrieveScale(actionBtn.next('.cd-modal-bg'));

            actionBtn.addClass('to-circle');
            actionBtn.next('.cd-modal-bg').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue, true);
            });

            //if browser doesn't support transitions...
            if (actionBtn.parents('.no-csstransitions').length > 0) animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue, true);
        });
        jQuery(document).keyup(function (event) {
            if (event.which == '27') closeModal();
        });

        jQuery(window).on('resize', function () {
            //on window resize - update cover layer dimention and position
            if (jQuery('.cd-section.modal-is-visible').length > 0) window.requestAnimationFrame(updateLayer);
        });
    });

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
    'click .nav-link': (event, template) => {
    // menu items have .nav-link class
    // go to section with animation
    $('body,html').animate({'scrollTop': $($(event.currentTarget).attr('href')).offset().top}, 500);
    },
    'click .cd-modal-close': (event, template) => {
        closeModal();
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

/**
 * Initiates sponsors carousel with options
 */
function initSponsorsCarousel() {
    let mySwiper = new Swiper('.sponsors-carousel', {
        loop: true,
        autoplay: 2000,

        slidesPerView: 'auto',
        watchSlidesVisibility: true,

        // Navigation arrows
        nextButton: '.swiper-button-next-2',
        prevButton: '.swiper-button-prev-2',

        breakpoints: {
            575: {
                slidesPerView: 1
            }
        }
    })
}

function retrieveScale(btn) {
    let btnRadius = btn.width() / 2,
        left = btn.offset().left + btnRadius,
        top = btn.offset().top + btnRadius - jQuery(window).scrollTop(),
        scale = scaleValue(top, left, btnRadius, jQuery(window).height(), jQuery(window).width());

    btn.css('position', 'fixed').velocity({
        top: top - btnRadius,
        left: left - btnRadius,
        translateX: 0,
    }, 0);

    return scale;
}

function scaleValue(topValue, leftValue, radiusValue, windowW, windowH) {
    let maxDistHor = ( leftValue > windowW / 2) ? leftValue : (windowW - leftValue),
        maxDistVert = ( topValue > windowH / 2) ? topValue : (windowH - topValue);
    return Math.ceil(Math.sqrt(Math.pow(maxDistHor, 2) + Math.pow(maxDistVert, 2)) / radiusValue);
}

function animateLayer(layer, scaleVal, bool) {
    layer.velocity({scale: scaleVal}, 400, function () {
        jQuery('body').toggleClass('overflow-hidden', bool);
        (bool)
            ? layer.parents('.cd-section').addClass('modal-is-visible').end().off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend')
            : layer.removeClass('is-visible').removeAttr('style').siblings('[data-type="modal-trigger"]').removeClass('to-circle');
    });
}

function updateLayer() {
    let layer = jQuery('.cd-section.modal-is-visible').find('.cd-modal-bg'),
        layerRadius = layer.width() / 2,
        layerTop = layer.siblings('.btn').offset().top + layerRadius - jQuery(window).scrollTop(),
        layerLeft = layer.siblings('.btn').offset().left + layerRadius,
        scale = scaleValue(layerTop, layerLeft, layerRadius, jQuery(window).height(), jQuery(window).width());

    layer.velocity({
        top: layerTop - layerRadius,
        left: layerLeft - layerRadius,
        scale: scale,
    }, 0);
}

function closeModal() {
    let section = jQuery('.cd-section.modal-is-visible');
    section.removeClass('modal-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
        animateLayer(section.find('.cd-modal-bg'), 1, false);
    });
    //if browser doesn't support transitions...
    if (section.parents('.no-csstransitions').length > 0) animateLayer(section.find('.cd-modal-bg'), 1, false);
}

function initCountdown() {
  Meteor.setTimeout(function () {
    Session.set('countdown', countdown(new Date(2017, 3, 9)).toString())
  }, 1000);
}