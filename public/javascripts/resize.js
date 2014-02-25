$(document).ready(function(){

    //START 유경
    //채팅창 전체 브라우저 크기에 따라 높이 조절 
    var winHeight = $(window).height();
    var headerHeight = $("header").height();
    var videoHeight = $("#user-video-wrap").height();
    var textHeight = $("#local-msg").height() + 15;

    var newHeight = winHeight - (textHeight + headerHeight + videoHeight);
    $("#chat-wrap").css("height", newHeight + "px");
    
    $(window).resize(function(){
	winHeight = $(window).height();
	headerHeight = $("header").height();
	videoHeight = $("#user-video-wrap").height();
	textHeight = $("#local-msg").height() + 15;
	if(headerHeight == 0){
	    headerHeight = 50;
	}
	if(videoHeight == 0){
	    videoHeight = 165;
	}
	if(textHeight == 0){
	    textHeight = 20 + 15;
	}

	newHeight = winHeight - (textHeight + headerHeight + videoHeight);
	console.log("winHeight : " + winHeight);
	console.log("headerHeight : " + headerHeight);
	console.log("videoHeight : " + videoHeight);
	console.log("textHeight : " + textHeight);
	console.log("newChatHeight : " + newHeight);

	$("#chat-wrap").css("height", newHeight + "px");
    });

    $(window).trigger('resize');
    
    $('textarea').autosize();   

    //END 유경




    $("#button-mirror").css("margin-left", parseInt($('#video-wrap').css("width"))/2 - 30 + "px" );
    
    $('.big').css("width", "90%");
    $('.big').css("height", parseInt($('.big').css("width"))*0.6 + "px");
    $('.big').css("margin-top", (parseInt($('#video-wrap2').css("height")) - parseInt($('.big').css("height")))/2 + "px");
    


    /*---------------------------- Resize ---------------------------------*/
    $('#video-wrap').css("margin-left", "50px");
    $('#video-wrap').css("margin-left", "310px");
    $('#video-wrap').css("height", (parseInt($('#content').css("height")))-54 + "px");
    
    $('.big').css("width", "90%");
    $('.big').css("height", parseInt($('.big').css("width"))*0.6 + "px");
    
    if(parseInt($('.big').css("height")) > parseInt($('#video-wrap').css("height"))) {
	$('.big').css("height", $('#video-wrap').css("height"));
    }
    
    $('.big').css("margin-top", (parseInt($('#video-wrap').css("height")) - parseInt($('.big').css("height")))/2 + "px");
    
    if(parseInt($('.big').css("margin-top")) <= 0) {
	$('.big').css("margin-top", "0px");
    }
    
    $('#button-mirror').css("margin-top", -5-(parseInt($('#local-video-cover').css("height")) + parseInt($('#button-mirror').css("height")))/2 + "px");
    $('#button-mirror').css("margin-left", parseInt($('#video-wrap').css("width"))/2 - 30 + "px" );
    
    ////////////////////////////////// newcode ///////////////////////////////////////




    //aside button event

    /*----------------------- snap.js ----------------------------------*/
    snapper = new Snap({
        element: document.getElementById('aside'),
        dragger: 'none'
    });
    
    snapper.off('close');



    snapper.close();
    // $('#aside-button').css("right", "255px");
    /*-------------------aside slide button------------------*/

    $("#aside-button").click(function() {
        if( snapper.state().state=="left" ){
            snapper.close();
	    
	    $(this).animate({ "right": "235px" },"fast");

	    $(".ab-arrow").addClass("ab-ltr");
	    $(".ab-arrow").removeClass("ab-rtl");
            $('#video-wrap2').css("margin-left", "310px");
            $('#video-wrap').css("margin-left", "310px");
            $('#content').css("right", "260px");
            $('#content2').css("right", "260px");
        }
        else {
            snapper.open('left');

	    $(this).css({ "right": "-25px" });
	    $(".ab-arrow").removeClass("ab-ltr");
	    $(".ab-arrow").addClass("ab-rtl");
            $('#video-wrap2').css("margin-left", "50px");
            $('#video-wrap').css("margin-left", "50px");
            $('#content').css("right", "0");
            $('#content2').css("right", "0");

        }


        $('#video-wrap2').css("height", (parseInt($('#content').css("height")))-54 + "px");
        $('#video-wrap').css("height", (parseInt($('#content').css("height")))-54 + "px");
        $('#content2').css("width", $('#video-wrap2').css("width"));
        $('#sharecover').css("top", (parseInt($('#video-wrap2').css("height"))/2) - (parseInt($('#sharecover').css("height"))/2) + "px");

        if(video_flag == 0){
            $('.mid_video').css("width", "49%");
            $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");

            $('#non-midium-set').hide();
            $('.br').hide();

            $('#midium-set').css("top", (parseInt($('#video-wrap2').css("height")) - parseInt($('#midium-set').css("height")))/2+"px");
            if(parseInt($('#midium-set').css("top")) < 0)
            {$('#midium-set').css("top", "0px");}
        }
        else if(video_flag != 0){
            $('#non-midium-set').css("height", (parseInt($('#content').css("height"))-58) + "px");

            $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
            $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
        }

        $('.large').css("width", parseInt($('#non-midium-set').css("width"))*0.98 + "px");
        $('.large').css("height", parseInt($('.large').css("width"))*0.6 + "px");

        $('.big').css("width", "90%");
        $('.big').css("height", parseInt($('.big').css("width"))*0.6 + "px");

        if(parseInt($('.big').css("height")) > parseInt($('#video-wrap').css("height"))){
            $('.big').css("height", $('#video-wrap').css("height"));
        }

        $('.big').css("margin-top", (parseInt($('#video-wrap').css("height")) - parseInt($('.big').css("height")))/2 + "px");

        if(parseInt($('.big').css("margin-top")) <= 0){
            $('.big').css("margin-top", "0px");
        }

        $('#button-mirror').css("margin-left", parseInt($('#video-wrap').css("width"))/2 - 30 + "px" );
        $('#button-mirror').css("margin-top", -5-(parseInt($('#local-video-cover').css("height")) + parseInt($('#button-mirror').css("height")))/2 + "px");

        $('#small_video').css("top", parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height")) + "px"    );
        $('#large_video').css("top", (parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height"))-8)/2 + "px");

        if(parseInt($('#large_video').css("top")) < 10)
        {$('#large_video').css("top", "10px");}

    });





    window.onresize = function(){
    	//$('#video-wrap').css("width", (parseInt($('#content').css("width"))-315) + "px");
    	//$('#video-wrap').css("height", (parseInt($('#content').css("height")))-54 + "px");
	
    	if( snapper.state().state=="left" ){
            $('#aside-button').css("right", "-25px");
            
    	    $('#video-wrap2').css("margin-left", "50px");
    	    $('#video-wrap').css("margin-left", "50px");
    	    $('#content').css("right", "0");
    	    $('#content2').css("right", "0");
    	}
    	else {
    	    $('#aside-button').css("right", "235px");
            
    	    $('#video-wrap2').css("margin-left", "310px");
    	    $('#video-wrap').css("margin-left", "310px");
    	    $('#content').css("right", "260px");
    	    $('#content2').css("right", "260px");

    	}
	
    	$('#video-wrap2').css("height", (parseInt($('#content').css("height")))-54 + "px");
    	$('#video-wrap').css("height", (parseInt($('#content').css("height")))-54 + "px");
    	$('#content2').css("width", $('#video-wrap2').css("width"));
    	$('#sharecover').css("top", (parseInt($('#video-wrap2').css("height"))/2) - (parseInt($('#sharecover').css("height"))/2) + "px");
	
    	if(video_flag == 0)
    	{
    	    $('.mid_video').css("width", "49%");
    	    $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
	    
    	    $('#non-midium-set').hide();
    	    $('.br').hide();
	    
    	    $('#midium-set').css("top", (parseInt($('#video-wrap2').css("height")) - parseInt($('#midium-set').css("height")))/2+"px");
    	    if(parseInt($('#midium-set').css("top")) < 0)
    	    {$('#midium-set').css("top", "0px");}
    	}
    	else if(video_flag != 0)
    	{
    	    $('#non-midium-set').css("height", (parseInt($('#content').css("height"))-58) + "px");
    	    $('#small_video').css("top", parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height")) + "px"    );
    	    $('#large_video').css("top", (parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height"))-8)/2 + "px");
	    
    	    $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
    	    $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
	    
    	    if(parseInt($('#large_video').css("top")) < 10)
    	    {
    		$('#large_video').css("top", "10px");
    	    }
    	}
    	$("#button-mirror").css("margin-left", parseInt($('#video-wrap').css("width"))/2 - 30 + "px" );
	
    	$('.large').css("width", parseInt($('#non-midium-set').css("width"))*0.98 + "px");
    	$('.large').css("height", parseInt($('.large').css("width"))*0.6 + "px");
	
	
	
    	$('.big').css("width", "90%");
    	$('.big').css("height", parseInt($('.big').css("width"))*0.6 + "px");
	
    	if(parseInt($('.big').css("height")) > parseInt($('#video-wrap').css("height")))
    	{
    	    $('.big').css("height", $('#video-wrap').css("height"));
    	}
	
    	$('.big').css("margin-top", (parseInt($('#video-wrap').css("height")) - parseInt($('.big').css("height")))/2 + "px");
	
    	if(parseInt($('.big').css("margin-top")) <= 0)
    	{
    	    $('.big').css("margin-top", "0px");
    	}
    	$('#button-mirror').css("margin-top", -5-(parseInt($('#local-video-cover').css("height")) + parseInt($('#button-mirror').css("height")))/2 + "px");
	
    };










    
    

});


