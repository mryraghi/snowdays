import './home.html'

// Flickity
const Flickity = require('flickity');
import 'flickity/css/flickity.css';


Template.Home.onRendered(function () {

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

  //set animation timing
  const animationDelay = 2500,    //loading bar effect
    barAnimationDelay = 3800,
    barWaiting = barAnimationDelay - 3000, //3000 is the duration of the transition on the loading bar - set in the scss/css file
    //letters effect
    lettersDelay = 50,    //type effect
    typeLettersDelay = 150,
    selectionDuration = 500,
    typeAnimationDelay = selectionDuration + 800,    //clip effect
    revealDuration = 600,
    revealAnimationDelay = 1500;

  initHeadline();


  function initHeadline() {
    //insert <i> element for each letter of a changing word
    singleLetters($('.cd-headline.letters').find('b'));
    //initialise headline animation
    animateHeadline($('.cd-headline'));
  }

  function singleLetters($words) {
    $words.each(function () {
      const word = $(this),
        letters = word.text().split(''),
        selected = word.hasClass('is-visible');
      for (i in letters) {
        if (word.parents('.rotate-2').length > 0) letters[i] = '<em>' + letters[i] + '</em>';
        letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>' : '<i>' + letters[i] + '</i>';
      }
      const newLetters = letters.join('');
      word.html(newLetters).css('opacity', 1);
    });
  }

  function animateHeadline($headlines) {
    let duration = animationDelay;
    $headlines.each(function () {
      const headline = $(this);

      if (headline.hasClass('loading-bar')) {
        duration = barAnimationDelay;
        setTimeout(function () {
          headline.find('.cd-words-wrapper').addClass('is-loading')
        }, barWaiting);
      } else if (headline.hasClass('clip')) {
        const spanWrapper = headline.find('.cd-words-wrapper'),
          newWidth = spanWrapper.width() + 10;
        spanWrapper.css('width', newWidth);
      } else if (!headline.hasClass('type')) {
        //assign to .cd-words-wrapper the width of its longest word
        let words = headline.find('.cd-words-wrapper b'),
          width = 0;
        words.each(function () {
          const wordWidth = $(this).width();
          if (wordWidth > width) width = wordWidth;
        });
        headline.find('.cd-words-wrapper').css('width', width);
      }

      //trigger animation
      setTimeout(function () {
        hideWord(headline.find('.is-visible').eq(0))
      }, duration);
    });
  }

  function hideWord($word) {
    const nextWord = takeNext($word);

    if ($word.parents('.cd-headline').hasClass('type')) {
      const parentSpan = $word.parent('.cd-words-wrapper');
      parentSpan.addClass('selected').removeClass('waiting');
      setTimeout(function () {
        parentSpan.removeClass('selected');
        $word.removeClass('is-visible').addClass('is-hidden').children('i').removeClass('in').addClass('out');
      }, selectionDuration);
      setTimeout(function () {
        showWord(nextWord, typeLettersDelay)
      }, typeAnimationDelay);

    } else if ($word.parents('.cd-headline').hasClass('letters')) {
      const bool = ($word.children('i').length >= nextWord.children('i').length);
      hideLetter($word.find('i').eq(0), $word, bool, lettersDelay);
      showLetter(nextWord.find('i').eq(0), nextWord, bool, lettersDelay);

    } else if ($word.parents('.cd-headline').hasClass('clip')) {
      $word.parents('.cd-words-wrapper').animate({width: '2px'}, revealDuration, function () {
        switchWord($word, nextWord);
        showWord(nextWord);
      });

    } else if ($word.parents('.cd-headline').hasClass('loading-bar')) {
      $word.parents('.cd-words-wrapper').removeClass('is-loading');
      switchWord($word, nextWord);
      setTimeout(function () {
        hideWord(nextWord)
      }, barAnimationDelay);
      setTimeout(function () {
        $word.parents('.cd-words-wrapper').addClass('is-loading')
      }, barWaiting);

    } else {
      switchWord($word, nextWord);
      setTimeout(function () {
        hideWord(nextWord)
      }, animationDelay);
    }
  }

  function showWord($word, $duration) {
    if ($word.parents('.cd-headline').hasClass('type')) {
      showLetter($word.find('i').eq(0), $word, false, $duration);
      $word.addClass('is-visible').removeClass('is-hidden');

    } else if ($word.parents('.cd-headline').hasClass('clip')) {
      $word.parents('.cd-words-wrapper').animate({'width': $word.width() + 10}, revealDuration, function () {
        setTimeout(function () {
          hideWord($word)
        }, revealAnimationDelay);
      });
    }
  }

  function hideLetter($letter, $word, $bool, $duration) {
    $letter.removeClass('in').addClass('out');

    if (!$letter.is(':last-child')) {
      setTimeout(function () {
        hideLetter($letter.next(), $word, $bool, $duration);
      }, $duration);
    } else if ($bool) {
      setTimeout(function () {
        hideWord(takeNext($word))
      }, animationDelay);
    }

    if ($letter.is(':last-child') && $('html').hasClass('no-csstransitions')) {
      const nextWord = takeNext($word);
      switchWord($word, nextWord);
    }
  }

  function showLetter($letter, $word, $bool, $duration) {
    $letter.addClass('in').removeClass('out');

    if (!$letter.is(':last-child')) {
      setTimeout(function () {
        showLetter($letter.next(), $word, $bool, $duration);
      }, $duration);
    } else {
      if ($word.parents('.cd-headline').hasClass('type')) {
        setTimeout(function () {
          $word.parents('.cd-words-wrapper').addClass('waiting');
        }, 200);
      }
      if (!$bool) {
        setTimeout(function () {
          hideWord($word)
        }, animationDelay)
      }
    }
  }

  function takeNext($word) {
    return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
  }

  function takePrev($word) {
    return (!$word.is(':first-child')) ? $word.prev() : $word.parent().children().last();
  }

  function switchWord($oldWord, $newWord) {
    $oldWord.removeClass('is-visible').addClass('is-hidden');
    $newWord.removeClass('is-hidden').addClass('is-visible');
  }
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

// -------------------------


});