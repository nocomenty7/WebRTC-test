"use strict";

$(document).ready(function(){

    //친구 목록 열고 닫기
    $(".flist-group-name").click(function(){
	    var list = $(this).siblings(".flist");
	    var arrow = $(this).children(".flist-arrow");
	    
	    if(list.hasClass("close")){
		list.slideDown( "slow" );
		list.removeClass("close");
		arrow.addClass("flist-arrow-up-hover");
	    }
	    else{
		list.slideUp("slow");
		list.addClass("close");
		arrow.removeClass("flist-arrow-up-hover");
		arrow.removeClass("flist-arrow-up");
	    }
	});

    $(".flist-group-name").mouseover(function(){
	    var arrow = $(this).children(".flist-arrow");
	    if(arrow.hasClass("flist-arrow-up")){
		arrow.addClass("flist-arrow-up-hover");
	    }
	    else if(arrow.hasClass("flist-arrow-up-hover")){}
	    else{
		arrow.addClass("flist-arrow-hover");
	    }
	}).mouseout(function(){
	    var arrow = $(this).children(".flist-arrow");
	    if(arrow.hasClass("flist-arrow-up")){
		arrow.removeClass("flist-arrow-up-hover");
	    }
	    else if(arrow.hasClass("flist-arrow-up-hover")){
		arrow.removeClass("flist-arrow-up-hover");
		arrow.addClass("flist-arrow-up");
	    }
	    else{
		arrow.removeClass("flist-arrow-hover");
	    }
	});


    //왼쪽 side buttons 마우스 이벤트
    $(".button-wrap").children(".button, .exception").mouseover(function(){
	    if($(this).siblings(".popup").hasClass("popup")){
		if($(this).siblings(".popup").hasClass("close")){
		    $(this).siblings(".caption").removeClass("hidden");		
		}
	    }
	    else{
		$(this).siblings(".caption").removeClass("hidden");		
	    }
	}).mouseout(function(){
	    $(this).siblings(".caption").addClass("hidden");
	}).click(function(){

	    $(this).siblings(".caption").addClass("hidden");
	});



    //screen-share
    $(".button-screen-share").click(function(){
	if($(this).hasClass("close")){
	    $(this).addClass("button-focus");
	    $(this).removeClass("close");
	}
	else{
	    $(this).removeClass("button-focus");
	    $(this).addClass("close");
	}
	
    });


    //framerate
    $(".button-framerate").click(function(){
	var target = $(".frames-wrap");
	if(target.hasClass("close")){
	    $(this).addClass("button-focus");
	    target.fadeIn("fast");
	    target.removeClass("close");
	}
	else{
	    $(this).removeClass("button-focus");
	    target.fadeOut("fast");
	    target.addClass("close");
	}
    });


    $(".each-frame").click(function(){

	var target = $(this).parent().siblings(".button");
	if($(this).hasClass("frame-720")){
	    target.removeClass("frame-720 frame-480 frame-360 frame-240");
	    target.addClass("frame-720");
	}
	else if($(this).hasClass("frame-480")){
	    target.removeClass("frame-720 frame-480 frame-360 frame-240");
	    target.addClass("frame-480");
	}
	else if($(this).hasClass("frame-360")){
	    target.removeClass("frame-720 frame-480 frame-360 frame-240");
	    target.addClass("frame-360");
	}
	else if($(this).hasClass("frame-240")){
	    target.removeClass("frame-720 frame-480 frame-360 frame-240");
	    target.addClass("frame-240");
	}

	target.removeClass("button-focus");
	$(".frames-wrap").fadeOut("fast");
	$(".frames-wrap").addClass("close");
    });




    // 알림 메시지 이벤트

    $("#notification-number, .header-notifications").click(function(){
	$(".popup").fadeOut("fast").addClass("close");
	//뒷배경 비활성화
	$("#disable").addClass("disable_window");
	$("#header-notifications").addClass("button-focus");
	$("#popover-notifications-wrap").fadeIn("fast");
    });


    $("#profile-edit-button-delete, .button-cancel").click(function(){
	//뒷배경 활성화
	$("#disable").removeClass("disable_window");
	
	$("#popover-profile-edit-wrap").fadeOut("fast");
	$(".textfield-pwd").val("");
    });


    // 메시지 알림창 꺼짐
    $("#notification-button-delete").click(function(){
    	//뒷배경 활성화
	$("#disable").removeClass("disable_window");
	$("#popover-notifications-wrap").fadeOut("fast");
    });



    
    //popup 끄기
    // If an event gets to the body
    $("body").click(function(){
		$(".popup").fadeOut("fast").addClass("close");
    });

    // Prevent events from getting pass .popup
    $(".popup, #header-button-add-friends, #hun-subwrap, #button-invite, .button-framerate").click(function(e){
    	e.stopPropagation();
    });

    
    //드래그 방지
    $("#popover-notifications-wrap").bind("mousedown",function(){return false;});
    $("#flist-mode-wrap").bind("mousedown",function(){return false;});
    $("#popover-invite-content-wrap").bind("mousedown",function(){return false;});


    
    //header user name 클릭 이벤트
    $("#hun-subwrap").click(function(){
	var target = $("#hun-popover");
	if(target.hasClass("close")){
	    target.fadeIn("fast");
	    target.removeClass("close");	}
	else{
	    target.fadeOut("fast");
	    target.addClass("close");
	}
    });


    // //START 프로필 수정 팝오버 코드
    // $(".friend-name-wrap").mouseover(function(){
    // 	    $(this).children(".button-delete").removeClass("hidden");
    // 	}).mouseout(function(){
    // 	    $(this).children(".button-delete").addClass("hidden");
    // 	});

    // // END 프로필 수정 팝오버 코드 

    $(document).on("mouseover", ".friend-name-wrap", function() {
	$(this).children(".button-delete").removeClass("hidden");
    });



    
    $(document).on("mouseout", ".friend-name-wrap", function() {
	$(this).children(".button-delete").addClass("hidden");
    });

    
    //초대장 부분 
    $("#button-invite").click(function(){
	var target = $("#popover-invite-wrap");
	if(target.hasClass("close")){
	    $("#button-invite").addClass("button-focus");
	    target.removeClass("close");
	    target.fadeIn("fast");
	}
	else{
	    $("#button-invite").removeClass("button-focus");
	    target.addClass("close");
	    target.fadeOut("fast");

	}
    });

    $("#invite-button-delete").click(function(){
	$("#popover-invite-wrap").fadeOut("fast");
	$("#popover-invite-wrap").addClass("close");
	$("#button-invite").removeClass("button-focus");
	$("#invite-flist-wrap").children("").children(".flist").slideDown();
	$("#invite-flist-wrap").children("").children(".flist").removeClass("close");
    });





    // 메시지 알림창 꺼짐
    $("#notification-button-delete").click(function(){
	$("#header-notifications").removeClass("button-focus");
	$("#popover-notifications-wrap").fadeOut("fast");
    });

    //알림 메시지 마우스 오버
    $("tbody tr").mouseover(function(){
	$(this).css("background-color","#FFF");
    }).mouseout(function(){
	$(this).css("background-color","#F8F8F8");
    });





    $( " .header-arrow " ).click(function(){
    	alert("dd");
    });


    
    // $(".name").click($.nameClick(e););
    // $.nameClick = function(e){
    // 	var target = $("#popover-name");
    // 	var divLeft, divTop;
    // 	alert("dd");
    // 	if($(window).width() - e.clientX < 140)
    // 	{    divLeft = $(window).width() - 175;	}
    // 	else
    // 	{    divLeft = e.clientX - 30;}

    // 	if($(window).height() - e.clientY < 120)
    // 	{    divTop = e.clientY - 120;}
    // 	else
    // 	{    divTop = e.clientY + 13; }

    // 	if(target.hasClass("close")){
    // 	    target.css({
    // 		"top": divTop,
    // 		"left": divLeft
    // 	    }).fadeIn("fast");
	    
    // 	    target.removeClass("close");
    // 	}
    // 	else{
    // 	    target.fadeOut("fast");
    // 	    target.addClass("close");
    // 	}
    // };
		  

    
//    친구 이름 클릭시
    
	$("#pn-delete").click(function(){
	    var target = $("#popover-name");
	    target.fadeOut("fast");
	    target.addClass("close");
	});

    

});


