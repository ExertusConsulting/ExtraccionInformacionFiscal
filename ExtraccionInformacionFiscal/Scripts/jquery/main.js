
/*
* Ajax overlay 1.0
* Author: Simon Ilett @ aplusdesign.com.au
* Descrip: Creates and inserts an ajax loader for ajax calls / timed events 
* Date: 03/08/2011 
*/
function ajaxLoader(el, options) {
    // Becomes this.options
    var defaults = {
        bgColor: '#fff',
        duration: 0,
        opacity: 0.95,
        classOveride: false
    }
    this.options = jQuery.extend(defaults, options);
    this.container = $(el);

    this.init = function () {
        var container = this.container;
        // Delete any other loaders
        this.remove();
        // Create the overlay 
        
        var overlay = $('<div>' + Ex.GetGlobalResourceValue("lblLoading") + '</div>').css({
            'background-color': this.options.bgColor,
            'opacity': this.options.opacity,
            'width': '100%',//container.width(),
            'height': '100%',//container.height(),
            'position': 'fixed',
            'top': '0px',
            'left': '0px',
            'z-index': 99999
        }).addClass('ajax_overlay');
        // add an overiding class name to set new loader style 
        if (this.options.classOveride) {
            overlay.addClass(this.options.classOveride);
        }
        // insert overlay and loader into DOM 
        container.append(
			overlay.append(
				$('<div></div>').addClass('circle')
			).show()
		);
    };

    this.remove = function () {
        var overlay = this.container.children(".ajax_overlay");
        if (overlay.length) {
            overlay.hide();
        }
    }

    this.init();
}


jQuery(function ($) {

    //Ajax contact
    var form = $('.contact-form');
    form.submit(function () {
        $this = $(this);
        $.post($(this).attr('action'), function (data) {
            $this.prev().text(data.message).fadeIn().delay(3000).fadeOut();
        }, 'json');
        return false;
    });

    //Goto Top
    $('.gototop').click(function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 500);
    });

    //End goto top		

    var windowH = $(window).height();
    var alturaUsada = $('#mainHeader').height() + $('#mainFooter').height() + $('#contenHeader').height() + 85

    if ($('#contenHeader').height() > 45) {
        alturaUsada = alturaUsada - 15
    }

    windowH = windowH - alturaUsada;

    if (GetHeightFormContent() < windowH + 15) { 
        $('#Form-Conent').css({ 'min-height': (windowH) + 'px' });
    }

});

function GetHeightFormContent() {
    return $('#Form-Conent').height();
}

$(window).resize(function () {
    var windowH = $(window).height();
    var alturaUsada = $('#mainHeader').height() + $('#mainFooter').height() + $('#contenHeader').height() + 90
    if ($('#contenHeader').height() > 45) {
        alturaUsada = alturaUsada - 15
    }
    windowH = windowH - alturaUsada;

    if (windowH > 400) {
        if (GetHeightFormContent() < windowH + 15) {
            $('#Form-Conent').css({ 'min-height': (windowH) + 'px' });
    }
    }
});

var strAplicacionName = document.location.pathname.split("/")
var domainURL = document.location.protocol + "//" + ((document.location.host == null) ? document.domain : document.location.host) + "/" + strAplicacionName[1] + "/";

jQuery.fn.filterByText = function (textbox, selectSingleMatch) {
    return this.each(function () {
        var select = this;
        var options = [];
        $(select).find('option').each(function () {
            options.push({ value: $(this).val(), text: $(this).text() });
        });
        $(select).data('options', options);
        $(textbox).bind('change keyup', function () {
            var options = $(select).empty().scrollTop(0).data('options');
            var search = $.trim($(this).val());
            var regex = new RegExp(search, 'gi');

            $.each(options, function (i) {
                var option = options[i];
                if (option.text.match(regex) !== null) {
                    $(select).append(
                       $('<option>').text(option.text).val(option.value)
                    );
                }
            });
            if (selectSingleMatch === true &&
                $(select).children().length === 1) {
                $(select).children().get(0).selected = true;
            }
        });
    });
};


