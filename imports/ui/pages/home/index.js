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

  let scrolling = false;
  let mainHeader = $('.cd-auto-hide-header'),
    secondaryNavigation = $('.cd-secondary-nav'),    //this applies only if secondary nav is below intro section
    belowNavHeroContent = $('.sub-nav-hero'),
    verticalNavigation = $('.cd-secondary-nav'),
    headerHeight = mainHeader.height(),
    contentSections = $('.cd-section'),
    navigationItems = verticalNavigation.find('a');

//set scrolling variables
  let previousTop = 0,
    currentTop = 0,
    scrollDelta = 10,
    scrollOffset = 150;

  mainHeader.on('click', '.nav-trigger', function (event) {
    // open primary navigation on mobile
    event.preventDefault();
    mainHeader.toggleClass('nav-open');
  });

  $(window).on('scroll', function () {
    if (!scrolling) {
      scrolling = true;
      (!window.requestAnimationFrame)
        ? setTimeout(autoHideHeader, 250)
        : requestAnimationFrame(autoHideHeader);
    }
  });

  $(window).on('resize', function () {
    headerHeight = mainHeader.height();
  });

  function autoHideHeader() {
    const currentTop = $(window).scrollTop();

    ( belowNavHeroContent.length > 0 )
      ? checkStickyNavigation(currentTop) // secondary navigation below intro
      : checkSimpleNavigation(currentTop);

    previousTop = currentTop;


    const scrollTop = $(window).scrollTop();
    contentSections.each(function () {
      const section = $(this),
        sectionId = section.attr('id'),
        navigationItem = navigationItems.filter('[href^="#' + sectionId + '"]');
      ( (section.offset().top < scrollTop ) && ( section.offset().top + section.height() > scrollTop) )
        ? navigationItem.addClass('active')
        : navigationItem.removeClass('active');
    });


    scrolling = false;
  }

  function checkSimpleNavigation(currentTop) {
    //there's no secondary nav or secondary nav is below primary nav
    if (previousTop - currentTop > scrollDelta) {
      //if scrolling up...
      mainHeader.removeClass('is-hidden');
    } else if (currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
      //if scrolling down...
      mainHeader.addClass('is-hidden');
    }
  }

  function checkStickyNavigation(currentTop) {
    //secondary nav below intro section - sticky secondary nav
    const secondaryNavOffsetTop = belowNavHeroContent.offset().top - secondaryNavigation.height() - mainHeader.height();

    if (previousTop >= currentTop) {
      //if scrolling up...
      if (currentTop < secondaryNavOffsetTop) {
        //secondary nav is not fixed
        mainHeader.removeClass('is-hidden');
        secondaryNavigation.removeClass('fixed slide-up');
        belowNavHeroContent.removeClass('secondary-nav-fixed');
      } else if (previousTop - currentTop > scrollDelta) {
        //secondary nav is fixed
        mainHeader.removeClass('is-hidden');
        secondaryNavigation.removeClass('slide-up').addClass('fixed');
        belowNavHeroContent.addClass('secondary-nav-fixed');
      }

    } else {
      //if scrolling down...
      if (currentTop > secondaryNavOffsetTop + scrollOffset) {
        //hide primary nav
        mainHeader.addClass('is-hidden');
        secondaryNavigation.addClass('fixed slide-up');
        belowNavHeroContent.addClass('secondary-nav-fixed');
      } else if (currentTop > secondaryNavOffsetTop) {
        //once the secondary nav is fixed, do not hide primary nav if you haven't scrolled more than scrollOffset
        mainHeader.removeClass('is-hidden');
        secondaryNavigation.addClass('fixed').removeClass('slide-up');
        belowNavHeroContent.addClass('secondary-nav-fixed');
      }

    }
  }

  verticalNavigation.on('click', 'a', function (event) {
    event.preventDefault();
    smoothScroll($(this.hash));
    verticalNavigation.removeClass('open');
  });

  function smoothScroll(target) {
    $('body,html').animate(
      {'scrollTop': target.offset().top},
      300
    );
  }

  // -------------------
});

Meteor.startup(function () {

//   var contentSections = $('.cd-section'),
//     verticalNavigation = $('.cd-vertical-nav'),
//     navigationItems = verticalNavigation.find('a'),
//     navTrigger = $('.cd-nav-trigger'),
//     scrollArrow = $('.cd-scroll-down');
//
//   $(window).on('scroll', checkScroll);
//
// //smooth scroll to the selected section
//   verticalNavigation.on('click', 'a', function (event) {
//     event.preventDefault();
//     smoothScroll($(this.hash));
//     verticalNavigation.removeClass('open');
//   });
//
// //smooth scroll to the second section
//   scrollArrow.on('click', function (event) {
//     event.preventDefault();
//     smoothScroll($(this.hash));
//   });
//
// // open navigation if user clicks the .cd-nav-trigger - small devices only
//   navTrigger.on('click', function (event) {
//     event.preventDefault();
//     verticalNavigation.toggleClass('open');
//   });
//
//   function checkScroll() {
//     if (!scrolling) {
//       scrolling = true;
//       (!window.requestAnimationFrame) ? setTimeout(updateSections, 300) : window.requestAnimationFrame(updateSections);
//     }
//   }
//
//   function updateSections() {
//     var halfWindowHeight = $(window).height() / 2,
//       scrollTop = $(window).scrollTop();
//     contentSections.each(function () {
//       var section = $(this),
//         sectionId = section.attr('id'),
//         navigationItem = navigationItems.filter('[href^="#' + sectionId + '"]');
//       ( (section.offset().top - halfWindowHeight < scrollTop ) && ( section.offset().top + section.height() - halfWindowHeight > scrollTop) )
//         ? navigationItem.addClass('active')
//         : navigationItem.removeClass('active');
//     });
//     scrolling = false;
//   }
//
//   function smoothScroll(target) {
//     $('body,html').animate(
//       {'scrollTop': target.offset().top},
//       300
//     );
//   }
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