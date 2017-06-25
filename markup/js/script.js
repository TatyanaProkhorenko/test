
$(function() {

    $(".js-openMob").click(function () {
        $(".mobMenu").show();
    });
    $(".js-btnClose").click(function () {
        $(".mobMenu").hide();
    });

    $('select').styler();


    // tabs
    $('.nav__steps .steps .steps__li').click(function(){
        var number = $(this).index();
        $('.infoForm__step').hide().eq(number).show();
        $(this).toggleClass('active');
        $('.nav__steps .steps .steps__li').not(this).removeClass('active');
    });


});
