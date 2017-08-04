//trigger the animation - open modal window
jQuery('[data-type="modal-trigger"]').on('click', function () {
    var actionBtn = jQuery(this),
        scaleValue = retrieveScale(actionBtn.next('.cd-modal-bg'));

    actionBtn.addClass('to-circle');
    actionBtn.next('.cd-modal-bg').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
        animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue, true);
    });

    //if browser doesn't support transitions...
    if (actionBtn.parents('.no-csstransitions').length > 0) animateLayer(actionBtn.next('.cd-modal-bg'), scaleValue, true);
});

//trigger the animation - close modal window
jQuery('.cd-section.cd-modal-close').on('click', function () {
    closeModal();
});
jQuery(document).keyup(function (event) {
    if (event.which == '27') closeModal();
});

jQuery(window).on('resize', function () {
    //on window resize - update cover layer dimention and position
    if (jQuery('.cd-section.modal-is-visible').length > 0) window.requestAnimationFrame(updateLayer);
});

function retrieveScale(btn) {
    var btnRadius = btn.width() / 2,
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
    var maxDistHor = ( leftValue > windowW / 2) ? leftValue : (windowW - leftValue),
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
    var layer = jQuery('.cd-section.modal-is-visible').find('.cd-modal-bg'),
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
    var section = jQuery('.cd-section.modal-is-visible');
    section.removeClass('modal-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
        animateLayer(section.find('.cd-modal-bg'), 1, false);
    });
    //if browser doesn't support transitions...
    if (section.parents('.no-csstransitions').length > 0) animateLayer(section.find('.cd-modal-bg'), 1, false);
}