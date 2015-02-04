/**
 * Created by ross on 11/04/14.
 */
//  $(function () {
//    $('#myTab a:last').tab('show')
//  })

//$('#myTab a[href="#home"]').tab('show');
//$('#rosspopover').popover({'trigger':'focus', 'delay': 100});

$( document ).ready(function() {

    //need to see that this selector is only ever looked up once - only reason to have within .ready()
    var mobile_nav = $("#mobile-nav");
    var mobile_nav_collapse = $('#mobile-nav-collapse');
    var nav_expand = "fa-angle-double-down";
    var nav_collapse = "fa-angle-double-up";

    //remove mobile expanded class when going larger (to close mobile nav when portrait to landscape on some devices)
    //bad as it hardcodes a media query breakpoint. Must remember to change in JS if SASS variable changes.
    $(window).resize(function(){
        if($( window ).width() > 768){
            (mobile_nav.removeClass("in"));
            toggle_nav_button_down()
        }
    });

    //Change to work with classToggle
    mobile_nav.on('show.bs.collapse', function () {
        toggle_nav_button_up();
    });
    mobile_nav.on('hide.bs.collapse', function () {
        toggle_nav_button_down()
    });

    //Change to work with classToggle
    function toggle_nav_button_up(){
        //mobile_nav_collapse.toggleClass(nav_expand);
        mobile_nav_collapse.removeClass(nav_expand);
        mobile_nav_collapse.addClass(nav_collapse);
    }
    function toggle_nav_button_down(){
        //mobile_nav_collapse.toggleClass(nav_collapse);
        mobile_nav_collapse.removeClass(nav_collapse);
        mobile_nav_collapse.addClass(nav_expand);
    }

    var nav_auth_dropdown = $("#nav-auth-dropdown");
    var nav_logged_in_button = $("#nav-logged-in-button");

    nav_auth_dropdown.on('hide.bs.collapse', function () {
        nav_logged_in_button.toggleClass('fa-caret-up', 'fa-caret-down')
    })
    nav_auth_dropdown.on('show.bs.collapse', function () {
        nav_logged_in_button.toggleClass('fa-caret-down', 'fa-caret-up')
    })

});


