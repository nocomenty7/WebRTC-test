
var browser = null;
var isjoined = false;
var firefoxusers = 0;
var socket;
var myName;
var myRowid;
var myProfile;
var onCheckedFriends=[];
var offCheckedFriends=[];
var userList=[];


var video_flag;		//0 - midium size;    		1/2/3/4 - large/small size;
var screen_flag = 0;	//0 - not shared;			1 - shared;

var pc = [];
//var pc;

var isStart = false;
var id, member;

var mirrorVideo;
var localStream, remoteStream;
var localVideo;

var mid_remoteVideo = [];
var large_remoteVideo = [];
var small_remoteVideo = [];

var inviteTime2;
var inviteTime3;

var webcamallow = false;

var offerflag;
var completeoffer = [];
var completeanswer = [];


$(document).ready(function(){
    completeoffer[1] = false;
    completeoffer[2] = false;
    completeoffer[3] = false;
    completeoffer[4] = false;
    completeanswer[1] = false;
    completeanswer[2] = false;
    completeanswer[3] = false;
    completeanswer[4] = false;
    
    socket = io.connect();





    // /*----------------------- snap.js ----------------------------------*/
    
    /*------------------------ browser state ----------------------------*/
    if (navigator.mozGetUserMedia)
    {browser = "firefox";}
    else if (navigator.webkitGetUserMedia)
    {browser = "chrome";}
    
    /*---------------------------- pc -----------------------------------*/
    for(var i=1; i<=4; i++) {
	pc[i] = "null";
    }
    
    mirrorVideo = document.getElementById("local-video");

    localVideo = document.getElementById("small-local-video");
    for(var i=1; i<=4; i++){
	mid_remoteVideo[i] = document.getElementById("mid_vid"+i);
	large_remoteVideo[i] = document.getElementById("large_vid"+i);
	small_remoteVideo[i] = document.getElementById("small_vid"+i);
    }
    
    
    /*---------------------------- Resize ---------------------------------*/
    
    /*---------------------------- Common Functions ---------------------------------*/
    $.checkNotiNum = function(){
    	$("#notification-number").css("display","inline");
	var tableLength = $("tbody tr").length;
	$("#notification-number").text(tableLength);
	$(".empty-msg").addClass("hidden");
	if(tableLength == 0){
	    //메시지함이 비어있을 경우
	    $("#notification-number").css("display","none");
	    $(".empty-msg").removeClass("hidden");
	}
    };


    
    $.switchContent = function(content, tab){
	$(content).parent().children().addClass("hidden");
	$(content).removeClass("hidden");
	$(tab).parent().children().removeClass("selected");
	$(tab).addClass("selected");
    };

    
    /*------------------------- Chatting & Room ----------------------------*/

    
    $.map([
	".vid1", ".vid2", ".vid3", ".vid4"
    ], function(vid, i){
	$(vid).click(function(){
	    var num = vid.replace(".vid", "");
	    
	    $('#non-midium-set').css("height", (parseInt($('#content').css("height"))-58) + "px");
	    
	    if(video_flag != num)
	    {
		$('#midium-set').hide();
		$('#non-midium-set').show();
		
                $('#small-vid'+num+'').addClass("hidden");
                $('#small-vid'+num+'-cover').addClass("hidden");
		for(var i=1; i<5; i++)
		{
                    if(i == num) {
                        $('#large-vid'+num+'').removeClass("hidden");
                        $('#large-vid'+num+'-cover').removeClass("hidden");
                    }
                    else {
                        $('#large-vid'+i+'').addClass("hidden");
                        $('#large-vid'+i+'-cover').addClass("hidden");
                    }
		    
                    if(i != num) {
                        $('#small-vid'+i+'').removeClass("hidden");
                        $('#small-vid'+i+'-cover').removeClass("hidden");
                    }
		    
		    $('.large').css("width", parseInt($('#non-midium-set').css("width"))*0.98 + "px");
		    $('.large').css("height", parseInt($('.large').css("width"))*0.6 + "px");
		    
		    $('#small_video').css("top", parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height")) + "px");
		    $('#large_video').css("top", (parseInt($('#non-midium-set').css("height"))-parseInt($('#large_video').css("height"))-parseInt($('#small_video').css("height"))-8)/2 + "px");
		    if(parseInt($('#large_video').css("top")) < 10)
		    {$('#large_video').css("top", "10px");}
		    
		    video_flag = num;
		}
	    }
	    else if(video_flag == num)
	    {
                $('#small-vid'+num+'').removeClass("hidden");
                $('#small-vid'+num+'-cover').removeClass("hidden");
		$('#non-midium-set').hide();
                $('#midium-set').show();
                
                //$('.mid_video').css("width", "49%");
                $('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
                $('#midium-set').css("top", (parseInt($('#video-wrap2').css("height")) - parseInt($('#midium-set').css("height")))/2+"px");
                
		video_flag = 0;
	    }
	});
    });
    
    
    
    /*------------------------- In Room, Invite Friends ----------------------------*/
    $(".button-friend-invite").click(function(){
    	

	var date = new Date();
        var out_year = date.getFullYear();
        var out_month = date.getMonth() + 1;
        var out_date = date.getDate();
	var out_hour = date.getHours();
        var out_minute = date.getMinutes();
        var out_second = date.getSeconds();
        
        //이때는 time_str과 time_int만 바꾸자, 그리고 roomid는 당연히 바꾸면 안되고
        var inviteTime = out_year + leadingZeros(out_month, 2) + leadingZeros(out_date, 2) + leadingZeros(out_hour, 2) + leadingZeros(out_minute, 2) + leadingZeros(out_second, 2);
    	
    	if(onCheckedFriends.length!=0){
    	    socket.emit('inRoomOnInvite', {friends:onCheckedFriends, time:inviteTime});
    	    $('.onCheck').attr('checked', false);
    	    onCheckedFriends = [];
    	}
    	
    	if(offCheckedFriends.length!=0){
    	    socket.emit("inRoomOffInvite", {friends:offCheckedFriends, time:inviteTime});
    	    $('.offCheck').attr("checked", false);
    	    offCheckedFriends = [];
    	}
    	
    	
    	$("#invite-flist-wrap").children(".online .flist").slideDown();
		$("#invite-flist-wrap").children(".offline .flist").slideUp();
    	$("#popover-invite-wrap").fadeOut("fast");
    	
    });
    
    
    /*------------------------ lobby video stream -------------------------------*/
    var video = document.getElementById("local-video");
    $("#button-mirror").click(function(){
	getUserMedia({video:true}, gotStream, function() {});
    });

    function gotStream(stream){
        $('#local-video-cover').addClass("hidden");
        $('#button-mirror').addClass("hidden");
        $('#local-video').removeClass("hidden");
        
        attachMediaStream(mirrorVideo, stream);
	$('.big').css("margin-top", (parseInt($('#video-wrap').css("height")) - parseInt($('.big').css("height")))/2 + "px");
    }

    // $("#notification-number, .header-notifications").click(function(){
    // 	$(".popup").fadeOut("fast").addClass("close");
    // 	//뒷배경 비활성화
    // 	$("#disable").addClass("disable_window");
    // 	$("#popover-notifications-wrap").fadeIn("fast");
    // });

    // //START 프로필 수정 팝오버 코드


    //프로필 수정 창 tab 바꾸기
    $("#basic-tab").click(function(){
	$.switchContent("#profile-basic-edit","#basic-tab");
    });

    $("#password-tab").click(function(){
	$.switchContent("#profile-password-edit","#password-tab");
    });

    $("#withdrawal-tab").click(function(){
	$.switchContent("#profile-withdrawal","#withdrawal-tab");
    });


    $("#hunp-profile-edit").click(function(){
    	//뒷배경 비활성화
	$("#disable").addClass("disable_window");
	
	$.switchContent("#profile-basic-edit","#basic-tab");
	$(".textfield").val("");
	$("#popover-profile-edit-wrap").fadeIn("fast");
	
	$('#profile_name').val(myName);
	$('#profile_profile').val(myProfile);
	
	//비밀번호변경에서 input에 빨간테두리치는 error-text클래스를 제거하고, 에러text도 hide()
	$('#current-pwd, #new-pwd, #confirm-pwd').removeClass("error-text");
	$("#pwd-error-dis, #pwd-error-short, #pwd-error-confirm").hide();
	
	
	//프로필수정 누르면 프로필수정 눌러서 나왔던거 없어지게
	$("#hun-popover").fadeOut("fast");
	$("#hun-popover").addClass("close");
    });
    
    //hyunwoo's addition - 로그아웃
    $("#hunp-logout").click(function(){
    	socket.disconnect();
	//location.href = "/logout";
    });
    
    
    // $("#profile-edit-button-delete, .button-cancel").click(function(){
    // 	//뒷배경 활성화
    // 	$("#disable").removeClass("disable_window");
	
    // 	$("#popover-profile-edit-wrap").fadeOut("fast");
    // 	$(".textfield-pwd").val("");
    // });
    

    // //popup 끄기
    // // If an event gets to the body
    // $("body").click(function(){
    // 	$(".popup").fadeOut("fast").addClass("close");
    // });

    // // Prevent events from getting pass .popup
    // $(".popup, #header-button-add-friends, #hun-subwrap, #button-invite, .button-framerate").click(function(e){
    // 	e.stopPropagation();
    // });



    // START 메시지 알림창 클릭 이벤트

    
    
    //접속회원수에 따른 수락 버튼 비활성화
    $.disableButton = function(){
	var tableLength = $("tbody tr").length;
	for(var i = 1; i <= tableLength; i++){
	    var tr = $("tbody tr:nth-child("+i+")");
	    var count = tr.children(".noti-count").text();
	    var target = tr.children(".noti-buttons").children(".noti-button-ok");
	    if (count == 0){
		target.removeClass("noti-button-active");
		target.addClass("noti-button-disable");
	    } else if(count > 0) {
		target.addClass("noti-button-active");
		target.removeClass("noti-button-disable");
	    }
	}
    };

    // //드래그 방지
    // $("#popover-notifications-wrap").bind("mousedown",function(){return false;});
    // $("#flist-mode-wrap").bind("mousedown",function(){return false;});
    // $("#popover-invite-content-wrap").bind("mousedown",function(){return false;});

    $("#notification-number").css("display","none");
    
    //알림 개수 확인하기

    //알림 수락, 거절시 삭제와 알림개수 확인
    $(".noti-button-ok, .noti-button-cancel").click(function(){
	$(this).parent().parent().remove();
	jQuery.checkNotiNum();
    });
    
    //친구 추가 버튼 클릭 이벤트
    $("#header-button-add-friends").click(function(){
	var target = $("#hf-search-wrap");
	if(target.hasClass("close")){
	    
	    
	    //친구추가의 자동완성목록에 뜨게될 전체유저목록을 요청하는 ajax
	    $.ajax({
	    	url: '/userList',
	       	type: "POST",
	        success: function(data) {
	            
	            $( "#friends-search-input" ).autocomplete({
		   	minLength: 1,
		    	source: data,
		    	focus: function( event, ui ) {
			    $( "#friends-search-input" ).val( ui.item.label );
			    return false;
			},
			select: function( event, ui ) {
			    $( "#friends-search-input" ).val( ui.item.label );
			    $( "#friends-search-input-id" ).val( ui.item.value );
			    return false;
			}
		    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			return $( "<li class=auto-user-list>" ).append( "<a class=''><div class='thin-box'></div><div class='s-content '><span class='s-mark'>친구</span><p class='name'>" + item.desc + "</p><p class='email'>" + item.label + "</p></div></a>" ).appendTo( ul );
		    };
		    
		},
		error: function(jqXHR, textStatus, errorThrown) {
		    alert('error ' + textStatus + " " + errorThrown);
		}
	    });
	    
	    $(".popup").fadeOut("fast").addClass("close"); //친구추가 자동완성을 열때 다른 팝업창은 닫아버리자.
	    $(this).addClass("button-focus");
	    target.fadeIn("fast");
	    target.removeClass("close");
	} else {
	    $(this).removeClass("button-focus");
	    target.fadeOut("fast");
	    target.addClass("close");
	}
    });
    
    /*---------------------------------- Seungho ---------------------------------------*/

    $('#button-file-attach').click(function() {
        document.getElementById('myfile').click();
    });

    $('#myfile').change(function() {
        if(this.value == "") {
        }
        else {
            document.form_upload.submit();
        }
    });
    

    /*---------------------------------- Hyunwoo ---------------------------------------*/
    
    $.ajax({	//자신의 이름과 프로필을 요청하는 ajax
    	url: '/myinfo',
        dataType: "jsonp",
        success: function(data) {
            myName = data.name;
            myRowid = data.rowid;
            myProfile = data.profile;
            //alert(myProfile);
            $('#username').text(data.name);
            
            socket.on('connect', function (){ //아무래도 여기서 처리해야 로그인할때 myName에 null이 들어가는 경우가 없는듯.. 밖에놔뒀을때 가끔 그런경우가 있었음
            	socket.emit('addUser', {name:myName, rowid:myRowid});
	    });
	},
        
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
    
    
    //접속한 순간의 메세지 알림창을 구성한다.
    socket.on('firstMessageBox', function(messages) {
	
	$('#noti-table tbody').children().remove();
        
        var a = 0;
        var textToInsert = [];
        for(var i=0; i<messages.length; i++) {
            textToInsert[a++] = '<tr><td class="noti-date">';
            textToInsert[a++] = messages[i].time;
            textToInsert[a++] = '</td><td class="noti-msg"><span class="name">';
            textToInsert[a++] = messages[i].name;
            textToInsert[a++] = '</span>님이 초대하셨습니다. </td><td class="noti-count ';
            textToInsert[a++] = messages[i].roomid;
            textToInsert[a++] = '">';
	    	textToInsert[a++] =	messages[i].count;
            textToInsert[a++] = '</td><td class="noti-buttons"><a class="noti-button-ok noti-button-active" roomid="';
            textToInsert[a++] = messages[i].roomid;
	    	textToInsert[a++] = '" realtime="';
	    	textToInsert[a++] = messages[i].realtime;
	    	textToInsert[a++] = '" fromRowid="';
	  		textToInsert[a++] = messages[i].rowid;
            textToInsert[a++] = '">수락</a><a class="noti-button-cancel noti-button-active" roomid="';
            textToInsert[a++] = messages[i].roomid;
            textToInsert[a++] = '" realtime="';
            textToInsert[a++] = messages[i].realtime;
            textToInsert[a++] = '" fromRowid="';
            textToInsert[a++] = messages[i].rowid;
            textToInsert[a++] = '">거절</a></td></tr>';
	}
        
        $('#noti-table tbody').append(textToInsert.join(''));
        
        jQuery.checkNotiNum();
        jQuery.disableButton();
        
        
        //수락버튼을 누른경우 DB에서 기록을 지우고, 방에 입장한다.
        $('.noti-button-ok').on('click',function(){
            
            if($(this).parent().parent().children(".noti-count").text()!=0){ //0이 아니면 수락버튼의 활성화
        	socket.emit('deleteMessage', {roomid: $(this).attr('roomid'), fromRowid: $(this).attr('fromRowid'), realtime: $(this).attr('realtime')});
        	
        	//메세지창이 뜨면서 뒤에 비활성화 되있던거 지워주기
        	$("#disable").removeClass("disable_window");
        	
        	inviteTime3 = {roomid: $(this).attr('roomid')};
                getUserMedia(res480Constraints, MediaSuccess2, MediaError2);
        	
    		$("#popover-notifications-wrap").fadeOut("fast");
    		
    		//수락한 메세지를 삭제한다.
		$(this).parent().parent().remove();
    		
    		joinRoom();
    		jQuery.checkNotiNum();
    	    } else { //0이면 수락버튼의 비활성화(아무것도 안한다)
    		return;
    	    }
	});
	
	//거절버튼을 누른경우 DB에서 기록을 지운다. (거절이라기보단 삭제에 가까운듯)
	$('.noti-button-cancel').on('click',function(){
	    
	    socket.emit('deleteMessage', {roomid: $(this).attr('roomid'), fromRowid: $(this).attr('fromRowid'), realtime: $(this).attr('realtime')});
            
            //거절한 메세지를 삭제한다.
            $(this).parent().parent().remove();
            
            jQuery.checkNotiNum();
	});

	
    });
    
    
    socket.on('updateMessageBox', function(message) {
	
	var a = 0;
       	var textToInsert = [];
        textToInsert[a++] = '<tr><td class="noti-date">';
        textToInsert[a++] = message.time;
        textToInsert[a++] = '</td><td class="noti-msg"><span class="name">';
        textToInsert[a++] = message.name;
        textToInsert[a++] = '</span>님이 초대하셨습니다. </td><td class="noti-count ';
        textToInsert[a++] = message.roomid;
        textToInsert[a++] = '">';
		textToInsert[a++] =	message.count;
        textToInsert[a++] = '</td><td class="noti-buttons"><a class="noti-button-ok noti-button-active" roomid="';
        textToInsert[a++] = message.roomid;
        textToInsert[a++] = '" realtime="';
        textToInsert[a++] = message.realtime;
        textToInsert[a++] = '" fromRowid="';
        textToInsert[a++] = message.rowid;
        textToInsert[a++] = '">수락</a><a class="noti-button-cancel noti-button-active" roomid="';
        textToInsert[a++] = message.roomid;
        textToInsert[a++] = '" realtime="';
        textToInsert[a++] = message.realtime;
        textToInsert[a++] = '" fromRowid="';
        textToInsert[a++] = message.rowid;
        textToInsert[a++] = '">거절</a></td></tr>';
	
        $('#noti-table tbody').prepend(textToInsert.join(''));
        
        jQuery.checkNotiNum();
        jQuery.disableButton();
        
        
        //수락버튼을 누른경우 DB에서 기록을 지우고, -----위와 다르게 있던방을 나가고,---- 방에 입장한다.
        $('.noti-button-ok').on('click',function(){

	    //alert($(this).parent().parent().children(".noti-count").text());

            if($(this).parent().parent().children(".noti-count").text()!=0){ //0이 아니면 수락버튼의 활성화
        	socket.emit('deleteMessage', {roomid: $(this).attr('roomid'), fromRowid: $(this).attr('fromRowid'), realtime: $(this).attr('realtime')});
        	
        	//메세지창이 뜨면서 뒤에 비활성화 되있던거 지워주기
        	$("#disable").removeClass("disable_window");
        	
        	socket.emit("leave");
        	leaveRoom();
        	
        	inviteTime3 = {roomid: $(this).attr('roomid')};
                getUserMedia(res480Constraints, MediaSuccess2, MediaError2);
        	
    		$("#popover-notifications-wrap").fadeOut("fast");
    		
    		//수락한 메세지를 삭제한다.
    		$(this).parent().parent().remove();
    		
    		joinRoom();
    		jQuery.checkNotiNum();
    	    } else { //0이면 수락버튼의 비활성화(아무것도 안한다)
    		return;
    	    }
	});
	
	//거절버튼을 누른경우 DB에서 기록을 지운다. (거절이라기보단 삭제에 가까운듯)
	$('.noti-button-cancel').on('click',function(){
	    
	    socket.emit('deleteMessage', {roomid: $(this).attr('roomid'), fromRowid: $(this).attr('fromRowid'), realtime: $(this).attr('realtime')});
            
            //거절한 메세지를 삭제한다.
            $(this).parent().parent().remove();
            jQuery.checkNotiNum();
	});
        
    });
    

    //메세지 알림창 내의 방목록중 count가 변하게 되면 업데이트 시킨다.
    socket.on('updatedCount', function(data) {
	$('.'+data.roomid).empty(); // 우선 기존의 숫자를 지우고	
	$('.'+data.roomid).append(data.count); // 업데이트한 숫자로 대체한다.
	jQuery.disableButton(); // 바뀐게 0이라면 버튼을 disable시킨다.
    });
    
    
    //친구가 접속했거나 나갔거나 이름을 바꾸었을때 받게되는 inform
    socket.on('inform', function (data){
    	socket.emit('updatedFriends', {friendRowid:data.rowid, friendName:data.name, status:data.status});
    });
    
    //서버로부터 친구list를 받는다.
    socket.on('friendsList', function (friends){
        
	//$('.online ul').append('<li class="friend-name-wrap"><input id="online-name00" type="checkbox" name="frnd-name" value="online-name00"><label class="friend-name" for="online-name00">'+friends.online[0]+'</label><a class="button-delete-friend button hidden"></a></li>');                        
    	$('.friend-name-wrap-real').remove();
        
        // 메인메뉴에서의 친구목록
        var a = 0;
        var textToInsert = [];
        for(var i=0; i<friends.online.length; i++) {
            textToInsert[a++] = '<li class="friend-name-wrap friend-name-wrap-real"><input class="onCheck" id="online-name';
            textToInsert[a++] = i;
            textToInsert[a++] = '" type="checkbox" name="frnd-name" value="';
            textToInsert[a++] = friends.online[i].rowid;
            textToInsert[a++] = '"><label class="friend-name" for="online-name';
	    textToInsert[a++] =	i;
            textToInsert[a++] = '">';
            textToInsert[a++] = friends.online[i].name;
            textToInsert[a++] = '</label><a class="button-delete-friend button-delete button hidden"></a></li>';
	}
        
        $('.online ul').append(textToInsert.join(''));
        
        a = 0;
        var textToInsert = [];
        for(var i=0; i<friends.offline.length; i++) {
            textToInsert[a++] = '<li class="friend-name-wrap friend-name-wrap-real"><input class="offCheck" id="invite-offline-name';
            textToInsert[a++] = i;
            textToInsert[a++] = '" type="checkbox" name="frnd-name" value="';
            textToInsert[a++] = friends.offline[i].rowid;
            textToInsert[a++] = '"><label class="friend-name" for="invite-offline-name';
            textToInsert[a++] =	i;
            textToInsert[a++] = '">';
            textToInsert[a++] = friends.offline[i].name;
            textToInsert[a++] = '</label><a class="button-delete-friend button-delete button hidden"></a></li>';
	}
        
        $('.offline ul').append(textToInsert.join(''));
        
        
        // invite popover에서의 친구목록
        a = 0;
        var textToInsert = [];
        for(var i=0; i<friends.online.length; i++) {
            textToInsert[a++] = '<li class="friend-name-wrap friend-name-wrap-real"><input class="onCheck" id="invite-online-name';
            textToInsert[a++] = i;
            textToInsert[a++] = '" type="checkbox" name="frnd-name" value="';
            textToInsert[a++] = friends.online[i].rowid;
            textToInsert[a++] = '"><label class="friend-name" for="invite-online-name';
	    textToInsert[a++] =	i;
            textToInsert[a++] = '">';
            textToInsert[a++] = friends.online[i].name;
            textToInsert[a++] = '</label></li>';
	}
        
        $('.invite-online ul').append(textToInsert.join(''));
        
        a = 0;
        var textToInsert = [];
        for(var i=0; i<friends.offline.length; i++) {
            textToInsert[a++] = '<li class="friend-name-wrap friend-name-wrap-real"><input class="offCheck" id="offline-name';
            textToInsert[a++] = i;
            textToInsert[a++] = '" type="checkbox" name="frnd-name" value="';
            textToInsert[a++] = friends.offline[i].rowid;
            textToInsert[a++] = '"><label class="friend-name" for="offline-name';
            textToInsert[a++] =	i;
            textToInsert[a++] = '">';
            textToInsert[a++] = friends.offline[i].name;
            textToInsert[a++] = '</label></li>';
	}
        
        $('.invite-offline ul').append(textToInsert.join(''));
        
        
        
        
        //친구삭제 버튼을 눌렀을경우
        $('.button-delete-friend').on('click',function(){
            socket.emit('deleteFriend', {friendRowid:$(this).prev().prev().val(), friendName:$(this).prev().text()});
            alert($(this).prev().text()+" 삭제되었습니다.");
	});
        
        //online친구 checkbox 상태 실시간으로 얻어오기
        $('.onCheck').on('change',function(){		
            onCheckedFriends = $.map($('.onCheck:checked'), function(e, i) {
            	//alert(friends.offline[e.value.substring(12)]);
                //return friends.online[e.value.substring(11)];
		return e.value;
	    });
            //alert(onCheckedFriends.join(','));
	});

        //offline친구 checkbox 상태 실시간으로 얻어오기
        $('.offCheck').on('change',function(){
            offCheckedFriends = $.map($('.offCheck:checked'), function(e, i) {
        	//alert(e.value);
            	//alert(friends.offline[e.value.substring(12)]);
                //return friends.offline[e.value.substring(12)];
                return e.value;
	    });
	    //alert(offCheckedFriends.join(','));
        });
        
    });
    
    //접속해 있는 상태에서 누군가에게 초대를 받은경우
    socket.on('invitation', function (data){
    	if(data.inRoom){ //방에 있는상태에서 초대를 받았다면
    	    //alert('inRoom!');
    	} else { //대기실에서 초대를 받았다면
    	    //alert('inLobby!');
    	    if(confirm(data.name+"님으로부터 초대가 들어왔습니다.")){
    		socket.emit('deleteMessage', {roomid: data.roomid, fromRowid: data.fromRowid});
                inviteTime3 = data;

                getUserMedia(res480Constraints, MediaSuccess2, MediaError2);
    	    } else {
    		return;
    	    }
    	}
    });
    


    //친구 추가하기
    $('#friends-search-input').on('keypress', function (e) {
    	if (e.keyCode == 13 && this.value!="") {
       	    
       	    //$.get("./addFriend",{ mail: addmail});
            //socket.emit('addFriend', {mail: addmail});
       	    
       	    $.ajax({	//친구추가를 요청하는 ajax
    	    	url: '/addFriend',
       	    	data: { mail: this.value},
       		dataType: "jsonp",
       		success: function(data) {
           	    alert(data.result);
                    if(data.friendName){ //data에 friendName이 같이 넘어온경우 (즉 친구추가가 성공한 경우)
                	socket.emit('addFriend', {friendRowid:data.friendRowid, friendName:data.friendName});
                    }
            	},
            	error: function(jqXHR, textStatus, errorThrown) {
            	    alert('error ' + textStatus + " " + errorThrown);
            	}
	    });
	    this.value="";
    	}
    });
    
    
    socket.on("someoneJoin", function(data){
        var a = 0;
        var textToInsert = [];

        textToInsert[a++] = '<p class="enter"><span class="name">';
        textToInsert[a++] = data;
        textToInsert[a++] = '</span> 님이 입장했습니다.</p>';
        $('#chat-wrap').append(textToInsert.join(''));

        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;


	// $(".name").click(function(){alert("dd");});
        /*
    	  document.getElementById('chat-wrap').innerHTML += (
          "<p class=\"enter\"><span>"+ data+"</span> 님이 입장했습니다.</p>"
    	  );
    	  document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        */
    });
    
    socket.on("someoneLeave", function(data){
        var a = 0;
        var textToInsert = [];

        textToInsert[a++] = '<p class=\"enter\"><span class=\"name\">';
        textToInsert[a++] = data;
        textToInsert[a++] = '</span> 님이 퇴장했습니다.</p>';
        $('#chat-wrap').append(textToInsert.join(''));

        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
    	
        /*
    	  document.getElementById('chat-wrap').innerHTML += (
          "<p class=\"enter\"><span>"+ data+"</span> 님이 퇴장했습니다.</p>"
    	  );
    	  document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        */
    });
    
    socket.on("message", function(data){
        
        var a = 0;
        var textToInsert = [];

        textToInsert[a++] = '<div class="msg-wrap">';
        textToInsert[a++] = '<span class="name">';
        textToInsert[a++] = data.name;
        textToInsert[a++] = '</span>';
        textToInsert[a++] = '<span class="msg-time"><time>';
        textToInsert[a++] = data.time;
        textToInsert[a++] = '</time></span>';
        textToInsert[a++] = '<span class="msg-arrow"></span>';
        textToInsert[a++] = '<p>';
        textToInsert[a++] = data.chat;
        textToInsert[a++] = '</p>';
        textToInsert[a++] = '</div>';
        $('#chat-wrap').append(textToInsert.join(''));

        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;

        
        /*
    	  var chat="";
	  document.getElementById('chat-wrap').innerHTML += (
          "<div class=\"msg-wrap\">" +
          "<span class=\"name\">" +
          data.name +
          "</span>" +
          "<span class=\"msg-time\"><time>" +
          data.time +
          "</time></span>" +
          "<span class=\"msg-arrow\"></span>" +
          "<p>" +
          data.chat +
          "</p>" +
          "</div>"
	  );

          document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        */
    });
    
    //프로필수정 - 기본정보수정
    $('#changeInfo').submit(function(event){
	event.preventDefault();
	
	var $form = $(this),
	name = $form.find("input[name='name']").val(),
	profile = $form.find("textarea[name='profile']").val(),
	url = $form.attr("action");
	
	var nameChanged = false;
	var profileChanged = false;
	
	//이름이 기존이름에서 바뀌었다면 nameChanged를 true로 보내서 DB에 적용시키게하자
	if(name!=myName){
	    nameChanged = true;
	}
	
	//설명이 기존설명에서 바뀌었다면 profileChanged를 true로 보내서 DB에 적용시키게하자
	//설명이 아무것도 없었다면 null이 저장되어 있는데 textArea안에는 ""으로 저장되어 있음.
	if((profile!=myProfile) && !((myProfile==null)&&(profile==""))){
	    profileChanged = true;
	}
	
	var posting = $.post(url, {name: name, profile: profile, nameChanged: nameChanged, profileChanged: profileChanged});
	
	posting.done(function(data){
	    if(data.changedName){
		myName = data.changedName;
		$('#username').text(myName);
		//socket으로 socket.name값도 바꾸고 친구들에게 알려줄필요가 있음..
		socket.emit('nameChanged', {changedName: myName});
	    }
	    
	    if(data.changedProfile){
		myProfile = data.changedProfile;
	    }
	    
	    alert(data.result);
	});
    });
    
    //프로필수정 - 비밀번호변경
    $('#changePassword').submit(function(event){
	$('#current-pwd, #new-pwd, #confirm-pwd').removeClass("error-text");
	$("#pwd-error-dis, #pwd-error-short, #pwd-error-confirm").hide();
	event.preventDefault();
	
	var $form = $(this),
	currentPwd = $form.find("input[name='current-pwd']").val(),
	newPwd = $form.find("input[name='new-pwd']").val(),
	confirmPwd = $form.find("input[name='confirm-pwd']").val(),
	url = $form.attr("action");
	
	var posting = $.post(url, {currentPwd: currentPwd, newPwd: newPwd, confirmPwd: confirmPwd});
	
	posting.done(function(data){
	    
	    if(data.errorCode==1){
		$('#current-pwd').val("");
		$('#current-pwd').addClass("error-text");
		$("#pwd-error-dis").show();
	    }
	    else if(data.errorCode==2){
		$('#new-pwd').val("");
		$('#confirm-pwd').val("");
		$('#new-pwd').addClass("error-text");
		$("#pwd-error-short").show();
	    }
	    else if(data.errorCode==3){
		$('#confirm-pwd').val("");
		$('#confirm-pwd').addClass("error-text");
		$("#pwd-error-confirm").show();
	    }
	    else if(data.changeSuccess){
		$('#current-pwd').val("");
		$('#new-pwd').val("");
		$('#confirm-pwd').val("");
	    }
	    
	    if(data.notice){
		alert(data.result);
	    }
	});
    });
    
    
    //프로필수정 - 탈퇴요청
    $('#withdrawal').on('click',function(){
	socket.emit('withdrawal');
	alert("탈퇴 완료되었습니다.");
    });
    
    
    
    //접속해 있는 상황인데 다른곳에서 같은 계정으로 접속을 시도하면서 강제접속을 눌렀을때
    socket.on('dupLogin', function(data){
	var timeout = setTimeout(function(){
	    window.location.href = data.url;
	}, 3000);
	
	var leftSecond = 3;
	
	setInterval(function() {
	    $('#leftSecond').empty();
	    $('#leftSecond').append(--leftSecond);
	}, 1000);
	
	
	$("#disable").addClass("disable_window");
	$("#dupNotify").css("display","");
	//이부분은 반드시 alert이 아니라 popover가 되어야만함!
	//alert('동일한 계정이 접속하였습니다. 3초후 강제종료됩니다.'); 
	socket.disconnect();
	$.get("/logout");
    });

    
    //새로운 탭을 열어서 추가시킨경우(이미 서버에서 처리를 해놔서 소켓관련해서는 아무것도 못하는상황임)
    socket.on('zombie', function(data){
	alert("한 브라우저당 하나의 탭에서만 사용이 가능합니다. \n확인을 누르시면 종료됩니다.");
	$("#disable").addClass("disable_window"); //파폭에선 탭종료가 불가능해서.. 이렇게라도 막는게
	window.open('', '_self').close();
    });
    

    
    
    /*-----------------------upload / download part----------------------*/
    socket.on('upload_fail', function(data) {
        var date = new Date(),
        hours = date.getHours(),
        minutes = leadingZeros(date.getMinutes(), 2),
        ampm = "";

        if(hours < 12){
            ampm = " am";
        } else {
            hours -= 12;
            ampm = " pm";
        }

        a = 0;
        textToInsert = [];

        textToInsert[a++] = '<div class=\"msg-wrap local-msg-sended\">';
        textToInsert[a++] = '<span class=\"name\">' + myName + '</span>';
        textToInsert[a++] = '<span class=\"msg-time\"><time>';
        textToInsert[a++] = hours + ":" + minutes + ampm;
        textToInsert[a++] =	'</time></span>';
        textToInsert[a++] = '<span class=\"msg-arrow\"></span>';
        textToInsert[a++] = '<p>';
        textToInsert[a++] = data.file_name;
        textToInsert[a++] = '의 파일 용량이 초과하였습니다. (~5MB)';
        textToInsert[a++] = '</p>';
        textToInsert[a++] = '</div>';
        $('#chat-wrap').append(textToInsert.join(''));



        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        $('#local-msg').css("height", "20px");
    });
    
    socket.on('upload_local', function(data) {
        var date = new Date(),
        hours = date.getHours(),
        minutes = leadingZeros(date.getMinutes(), 2),
        ampm = "",
        file_size;

        if(hours < 12){
            ampm = " am";
        } else {
            hours -= 12;
            ampm = " pm";
        }

        if(data.file_size/1024 >= 1024)
	{file_size = (data.file_size/1024/1024).toFixed(1) + "MB";}
        else
	{file_size = (data.file_size/1024).toFixed(0) + "KB";}


        a = 0;
        textToInsert = [];

        textToInsert[a++] = '<div class=\"msg-wrap local-msg-sended\">';
        textToInsert[a++] = '<span class=\"name\">' + myName + '</span>';
        textToInsert[a++] = '<span class=\"msg-time\"><time>';
        textToInsert[a++] = hours + ":" + minutes + ampm;
        textToInsert[a++] =	'</time></span>';
        textToInsert[a++] = '<span class=\"msg-arrow\"></span>';
        textToInsert[a++] = '<p>';
        textToInsert[a++] = '<a id=\'uploadedfile_'+data.file_date+'\' style=\'color: blue; cursor: pointer\' >' + data.file_name + '</a>';
        textToInsert[a++] = ' (' + file_size + ') 파일 업로드가 완료되었습니다.';
        textToInsert[a++] = '</p>';
        textToInsert[a++] = '</div>';
        $('#chat-wrap').append(textToInsert.join(''));



        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        $('#local-msg').css("height", "20px");

        $('#uploadedfile_'+data.file_date).click(function() {
            var form = document.createElement("form");
            form.setAttribute("name", "form_download");
            form.setAttribute("target", "download_target");
            form.setAttribute("method", "post");
            form.setAttribute("action", "/download");

            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", "down_file");
            hiddenField.setAttribute("value", data.file_date + "_" + data.file_name);

            form.appendChild(hiddenField);
            document.body.appendChild(form);


            form.submit();
            document.body.removeChild(form);
        });
    });

    socket.on('upload_remote', function(data) {
        var date = new Date(),
        hours = date.getHours(),
        minutes = leadingZeros(date.getMinutes(), 2),
        ampm = "",
        file_size;

        if(hours < 12){
            ampm = " am";
        } else {
            hours -= 12;
            ampm = " pm";
        }

        if(data.file_size/1024 >= 1024)
        {file_size = (data.file_size/1024/1024).toFixed(1) + "MB";}
        else
        {file_size = (data.file_size/1024).toFixed(0) + "KB";}

        a = 0;
        textToInsert = [];

        textToInsert[a++] = '<div class=\"msg-wrap\">';
        textToInsert[a++] = '<span class=\"name\">' + data.user_name + '</span>';
        textToInsert[a++] = '<span class=\"msg-time\"><time>';
        textToInsert[a++] = hours + ":" + minutes + ampm;
        textToInsert[a++] =	'</time></span>';
        textToInsert[a++] = '<span class=\"msg-arrow\"></span>';
        textToInsert[a++] = '<p>';
        textToInsert[a++] = '<a id=\'uploadedfile_'+data.file_date+'\' style=\'color: blue; cursor: pointer\' >' + data.file_name + '</a>';
        textToInsert[a++] = ' (' + file_size + ')';
        textToInsert[a++] = '</p>';
        textToInsert[a++] = '</div>';

        $('#chat-wrap').append(textToInsert.join(''));



        document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
        $('#local-msg').css("height", "20px");

        $('#uploadedfile_'+data.file_date).click(function() {
            var form = document.createElement("form");
            form.setAttribute("name", "form_download");
            form.setAttribute("target", "download_target");
            form.setAttribute("method", "post");
            form.setAttribute("action", "/download");

            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", "down_file");
            hiddenField.setAttribute("value", data.file_date + "_" + data.file_name);

            form.appendChild(hiddenField);
            document.body.appendChild(form);


            form.submit();
            document.body.removeChild(form);
        });
    });







    /*----------------------Video Resolution --------------------*/
    var res240Constraints = {
	video: {
	    mandatory: {
		maxWidth: 320,
		maxHeight: 240,
		minWidth: 240,
		minHeight: 180
	    }
	}, audio: true
    };
    
    var res360Constraints = {
	video: {
	    mandatory: {
		maxWidth: 480,
		maxHeight: 360,
		minWidth: 320,
		minHeight: 180
	    }
	}, audio: true
    };
    
    //default resolution
    var res480Constraints = {
	video: {
	    mandatory: {
		maxWidth: 640,
		maxHeight: 480,
		minWidth: 320,
		minHeight: 240
	    }
	}, audio: true
    };
    
    var res720Constraints = {
	video: {
	    mandatory: {
		maxWidth: 1280,
		maxHeight: 720,
		minWidth: 1280,
		minHeight: 720
	    }
	}, audio: true
    };


    //resolution buttons action
    $('#frame-240').on('click',function(){
	if (!!localStream) {
    	    //video.src = null;
    	    localStream.stop();
  	}

  	getUserMedia(res240Constraints, MediaSuccess3, MediaError);
    });

    $('#frame-360').on('click',function(){
	if (!!localStream) {
    	    //video.src = null;
    	    localStream.stop();
  	}

  	getUserMedia(res360Constraints, MediaSuccess3, MediaError);
    });
    
    $('#frame-480').on('click',function(){
	if (!!localStream) {
    	    //video.src = null;
    	    localStream.stop();
  	}

  	getUserMedia(res480Constraints, MediaSuccess3, MediaError);
    });
    
    $('#frame-720').on('click',function(){
	if (!!localStream) {
    	    //video.src = null;
    	    localStream.stop();
  	}

  	getUserMedia(res720Constraints, MediaSuccess3, MediaError);
    });


    function MediaSuccess3(stream){
        for(var i=1; i<=4; i++) {
            if(pc[i] != "null") {
                if(i < id) {
                    pc[i].close();
                    pc[i] = "null";

                    sendMessage({
                        type: "share",
                        fromtag: id,
                        totag: i
                    });
                }
                else if(i >= id) {
                    pc[i].close();
                    pc[i] = "null";

                    sendMessage({
                        type: "share",
                        fromtag: id,
                        totag: i+1
                    });
                }
            }
        }
        
	localStream = stream;
	attachMediaStream(localVideo, stream);
	
	if(member == id) {
	    for(var i=1; i<=member-1; i++) {
		if(i == 1) {
		    pc[1] = new RTCPeerConnection(null, pc_constraints);
		    pc[1].onicecandidate = handleIceCandidate1;
		    pc[1].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[1].onaddstream = handleRemoteStreamAdded1;}
		    pc[1].createOffer(setLocalAndSendMessage1, function(){});
		}
		else if(i == 2) {
		    pc[2] = new RTCPeerConnection(null, pc_constraints);
		    pc[2].onicecandidate = handleIceCandidate2;
                    pc[2].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[2].onaddstream = handleRemoteStreamAdded2;}
		    pc[2].createOffer(setLocalAndSendMessage2, function(){});
		}
		else if(i == 3) {
		    pc[3] = new RTCPeerConnection(null, pc_constraints);
		    pc[3].onicecandidate = handleIceCandidate3;
                    pc[3].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[3].onaddstream = handleRemoteStreamAdded3;}
		    pc[3].createOffer(setLocalAndSendMessage3, function(){});
		}
		else if(i == 4) {
		    pc[4] = new RTCPeerConnection(null, pc_constraints);
		    pc[4].onicecandidate = handleIceCandidate4;
                    pc[4].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[4].onaddstream = handleRemoteStreamAdded4;}
		    pc[4].createOffer(setLocalAndSendMessage4, function(){});
		}
	    }
	}
	else if(member > id) {
	    for(var i=1; i<=member-1; i++) {
		if(i < id) {
		    if(i == 1) {
			pc[1] = new RTCPeerConnection(null, pc_constraints);
			pc[1].onicecandidate = handleIceCandidate1;
                        pc[1].addStream(localStream);
                        if(screen_flag == 0)
			{pc[1].onaddstream = handleRemoteStreamAdded1;}
			pc[1].createOffer(setLocalAndSendMessage1, function(){});
		    }
		    else if(i == 2) {
			pc[2] = new RTCPeerConnection(null, pc_constraints);
			pc[2].onicecandidate = handleIceCandidate2;
                        pc[2].addStream(localStream);
                        if(screen_flag == 0)
			{pc[2].onaddstream = handleRemoteStreamAdded2;}
			pc[2].createOffer(setLocalAndSendMessage2, function(){});
		    }
		    else if(i == 3) {
			pc[3] = new RTCPeerConnection(null, pc_constraints);
			pc[3].onicecandidate = handleIceCandidate3;
                        pc[3].addStream(localStream);
                        if(screen_flag == 0)
			{pc[3].onaddstream = handleRemoteStreamAdded3;}
			pc[3].createOffer(setLocalAndSendMessage3, function(){});
		    }
		    else if(i == 4) {
			pc[4] = new RTCPeerConnection(null, pc_constraints);
			pc[4].onicecandidate = handleIceCandidate4;
                        pc[4].addStream(localStream);
                        if(screen_flag == 0)
			{pc[4].onaddstream = handleRemoteStreamAdded4;}
			pc[4].createOffer(setLocalAndSendMessage4, function(){});
		    }
		}
		else if(i >= id) {
		    if(i == 1) {
			pc[1] = new RTCPeerConnection(null, pc_constraints);
			pc[1].onicecandidate = handleIceCandidate2;
                        pc[1].addStream(localStream);
                        if(screen_flag == 0)
			{pc[1].onaddstream = handleRemoteStreamAdded1;}
			pc[1].createOffer(setLocalAndSendMessage2_, function(){});
		    }
		    else if(i == 2) {
			pc[2] = new RTCPeerConnection(null, pc_constraints);
			pc[2].onicecandidate = handleIceCandidate3;
                        pc[2].addStream(localStream);
                        if(screen_flag == 0)
			{pc[2].onaddstream = handleRemoteStreamAdded2;}
			pc[2].createOffer(setLocalAndSendMessage3_, function(){});
		    }
		    else if(i == 3) {
			pc[3] = new RTCPeerConnection(null, pc_constraints);
                        pc[3].onicecandidate = handleIceCandidate4;
                        pc[3].addStream(localStream);
                        if(screen_flag == 0)
			{pc[3].onaddstream = handleRemoteStreamAdded3;}
			pc[3].createOffer(setLocalAndSendMessage4_, function(){});
		    }
		    else if(i == 4) {
			pc[4] = new RTCPeerConnection(null, pc_constraints);
			pc[4].onicecandidate = handleIceCandidate5;
                        pc[4].addStream(localStream);
                        if(screen_flag == 0)
			{pc[4].onaddstream = handleRemoteStreamAdded4;}
			pc[4].createOffer(setLocalAndSendMessage5_, function(){});
		    }
		}
	    }
	}
        
    }
    
    

    
    
    
    
    
    /*----------------------Peer Connection --------------------*/	
    
    var pc_constraints = {
	'optional': [
	    {'DtlsSrtpKeyAgreement': true},
	    {'RtpDataChannels': true}
	]
    };

    // Set up audio and video regardless of what devices are present.
    var sdpConstraints = {
	'mandatory': {
	    'OfferToReceiveAudio':true,
	    'OfferToReceiveVideo':true
	}
    };											 

    function sendMessage(message){

	console.log('Sending message: ', message);
	socket.emit('sndmessage', message);
    }
    
    socket.on("responsenum", function(data){
	console.log("member : " + data);
	member = data;
	
	if(!isStart && webcamallow){
            mirrorVideo.src = "";
            $('#local-video-cover').removeClass("hidden");
            $('#button-mirror').removeClass("hidden");
            $('#local-video').addClass("hidden");
            
	    id = data;
            socket.emit("userid", id);
            
	    isStart = true;
	    console.log("id : " + data);
            
            
            
            if(id >= 2) {
                for(var i=1; i<=id-1; i++) {
                    if(i == 1) {
                        pc[1] = new RTCPeerConnection(null, pc_constraints);
                        pc[1].onicecandidate = handleIceCandidate1;
                        pc[1].addStream(localStream);
                        pc[1].onaddstream = handleRemoteStreamAdded1;
                        pc[1].createOffer(setLocalAndSendMessage1, function(){});
                    }
                    else if(i == 2) {
                        pc[2] = new RTCPeerConnection(null, pc_constraints);
                        pc[2].onicecandidate = handleIceCandidate2;
                        pc[2].addStream(localStream);
                        pc[2].onaddstream = handleRemoteStreamAdded2;
                        pc[2].createOffer(setLocalAndSendMessage2, function(){});
                    }
                    else if(i == 3) {
                        pc[3] = new RTCPeerConnection(null, pc_constraints);
                        pc[3].onicecandidate = handleIceCandidate3;
                        pc[3].addStream(localStream);
                        pc[3].onaddstream = handleRemoteStreamAdded3;
                        pc[3].createOffer(setLocalAndSendMessage3, function(){});
                    }
                    else if(i == 4) {
                        pc[4] = new RTCPeerConnection(null, pc_constraints);
                        pc[4].onicecandidate = handleIceCandidate4;
                        pc[4].addStream(localStream);
                        pc[4].onaddstream = handleRemoteStreamAdded4;
                        pc[4].createOffer(setLocalAndSendMessage4, function(){});
                    }
                }
            }
            
	}
        
        else if(!isStart && !webcamallow) {
            mirrorVideo.src = "";
            $('#local-video-cover').removeClass("hidden");
            $('#button-mirror').removeClass("hidden");
            $('#local-video').addClass("hidden");
            
            id = data;
            socket.emit("userid", id);
            
            isStart = true;
            console.log("id : " + data);
        }
    });
    
    $(".button-chat-start").click(function(){
        var date = new Date();
        var out_year = date.getFullYear();
        var out_month = date.getMonth() + 1;
        var out_date = date.getDate();
        var out_hour = date.getHours();
        var out_minute = date.getMinutes();
        var out_second = date.getSeconds();

        var inviteTime = out_year + leadingZeros(out_month, 2) + leadingZeros(out_date, 2) + leadingZeros(out_hour, 2) + leadingZeros(out_minute, 2) + leadingZeros(out_second, 2);
        inviteTime2 = inviteTime;

        if(onCheckedFriends.length!=0){
            socket.emit('onInvite', {friends:onCheckedFriends, time:inviteTime});
            $('.onCheck').attr('checked', false);
            onCheckedFriends = [];
        }

        if(offCheckedFriends.length!=0){
            socket.emit("offInvite", {friends:offCheckedFriends, time:inviteTime});
            $('.offCheck').attr("checked", false);
            offCheckedFriends = [];
        }
        
	getUserMedia(res480Constraints, MediaSuccess, MediaError);
    });
    
    function MediaSuccess(stream){
        webcamallow = true;
        
	localStream = stream;
	attachMediaStream(localVideo, stream);
        
        socket.emit("makerJoin", inviteTime2);
        isjoined = true;
        joinRoom();


        socket.emit("requestnum", "");
    }
    function MediaSuccess2(stream){
        webcamallow = true;
        
        localStream = stream;
        attachMediaStream(localVideo, stream);

        socket.emit("guestJoin", inviteTime3);
        isjoined = true;
        joinRoom();


        socket.emit("requestnum", "");
    }
    
    function MediaError(){
        webcamallow = false;

        socket.emit("makerJoin", inviteTime2);
        isjoined = true;
        joinRoom();

        socket.emit("requestnum", "");
    }
    function MediaError2(){
        webcamallow = false;
        
        socket.emit("guestJoin", inviteTime3);
        isjoined = true;
        joinRoom();
        
        socket.emit("requestnum", "");
    }
    
    
    
    socket.on('rcvmessage', function (message){
	if(message.totag == id) {
	    console.log('Received message:', message);
	}
        
        if (message.type === 'offer') {
            if(message.totag == id) {
                if(message.fromtag >= id) {
                    if(message.fromtag == 2) {
                        pc[1] = new RTCPeerConnection(null, pc_constraints);
                        pc[1].onicecandidate = handleIceCandidate2;
                        pc[1].addStream(localStream);
                        pc[1].onaddstream = handleRemoteStreamAdded1;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[1].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[1].createAnswer(function(sessionDescription) {
                            pc[1].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 2
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 3) {
                        pc[2] = new RTCPeerConnection(null, pc_constraints);
                        pc[2].onicecandidate = handleIceCandidate3;
                        pc[2].addStream(localStream);
                        pc[2].onaddstream = handleRemoteStreamAdded2;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[2].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[2].createAnswer(function(sessionDescription) {
                            pc[2].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 3
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 4) {
                        pc[3] = new RTCPeerConnection(null, pc_constraints);
                        pc[3].onicecandidate = handleIceCandidate4;
                        pc[3].addStream(localStream);
                        pc[3].onaddstream = handleRemoteStreamAdded3;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[3].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[3].createAnswer(function(sessionDescription) {
                            pc[3].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 4
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 5) {
                        pc[4] = new RTCPeerConnection(null, pc_constraints);
                        pc[4].onicecandidate = handleIceCandidate5;
                        pc[4].addStream(localStream);
                        pc[4].onaddstream = handleRemoteStreamAdded4;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[4].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[4].createAnswer(function(sessionDescription) {
                            pc[4].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 5
                            });
                        }, function(){});
                    }
                }
                else if(message.fromtag < id) {
                    if(message.fromtag == 1) {
                        pc[1] = new RTCPeerConnection(null, pc_constraints);
                        pc[1].onicecandidate = handleIceCandidate1;
                        pc[1].addStream(localStream);
                        pc[1].onaddstream = handleRemoteStreamAdded1;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[1].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[1].createAnswer(function(sessionDescription) {
                            pc[1].setLocalDescription(sessionDescription);
                            sendMessage({
				sdp: sessionDescription.sdp,
				type: sessionDescription.type,
				fromtag: id,
				totag: 1
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 2) {
                        pc[2] = new RTCPeerConnection(null, pc_constraints);
                        pc[2].onicecandidate = handleIceCandidate2;
                        pc[2].addStream(localStream);
                        pc[2].onaddstream = handleRemoteStreamAdded2;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[2].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[2].createAnswer(function(sessionDescription) {
                            pc[2].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 2
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 3) {
                        pc[3] = new RTCPeerConnection(null, pc_constraints);
                        pc[3].onicecandidate = handleIceCandidate3;
                        pc[3].addStream(localStream);
                        pc[3].onaddstream = handleRemoteStreamAdded3;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[3].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[3].createAnswer(function(sessionDescription) {
                            pc[3].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 3
                            });
                        }, function(){});
                    }
                    else if(message.fromtag == 4) {
                        pc[4] = new RTCPeerConnection(null, pc_constraints);
                        pc[4].onicecandidate = handleIceCandidate4;
                        pc[4].addStream(localStream);
                        pc[4].onaddstream = handleRemoteStreamAdded4;
                        //pc[1].onremovestream = handleRemoteStreamRemoved;

                        pc[4].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));

                        pc[4].createAnswer(function(sessionDescription) {
                            pc[4].setLocalDescription(sessionDescription);
                            sendMessage({
                                sdp: sessionDescription.sdp,
                                type: sessionDescription.type,
                                fromtag: id,
                                totag: 4
                            });
                        }, function(){});
                    }
                }
            }
        }
	else if (message.type === 'answer') {
	    if(message.totag == id) {
		if(message.fromtag < id) {
		    if(message.fromtag == 1) {
			pc[1].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
                        completeanswer[1] = true;
		    }
		    else if(message.fromtag == 2) {
			pc[2].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
                        completeanswer[2] = true;
		    }
		    else if(message.fromtag == 3) {
			pc[3].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
                        completeanswer[3] = true;
		    }
		    else if(message.fromtag == 4) {
			pc[4].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
                        completeanswer[4] = true;
		    }
		}
		else if(message.fromtag > id) {
		    if(message.fromtag == 2) {
			pc[1].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
		    }
		    else if(message.fromtag == 3) {
			pc[2].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
		    }
		    else if(message.fromtag == 4) {
			pc[3].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
		    }
		    else if(message.fromtag == 5) {
			pc[4].setRemoteDescription(new RTCSessionDescription({sdp: message.sdp, type: message.type}));
		    }
		}
	    }			
	} 
	else if (message.type === 'candidate') {
	    if(message.totag == id) {
		if(message.fromtag > message.totag) {
		    if(message.fromtag == 2) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[1].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 3) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[2].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 4) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[3].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 5) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[4].addIceCandidate(candidate);
		    }
		}
		else if(message.fromtag < message.totag) {
		    if(message.fromtag == 1) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[1].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 2) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[2].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 3) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[3].addIceCandidate(candidate);
		    }
		    else if(message.fromtag == 4) {
			var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
			pc[4].addIceCandidate(candidate);
		    }
		}
	    }
	} 
	else if(message.type === 'bye' || message.type === 'share') {
            if(message.totag == id) {
                if(message.fromtag > message.totag) {
                    console.log(message.fromtag-1);
                    pc[message.fromtag-1].close();
                    pc[message.fromtag-1] = "null";
                    mid_remoteVideo[message.fromtag-1].src = "";
                    large_remoteVideo[message.fromtag-1].src = "";
                    small_remoteVideo[message.fromtag-1].src = "";
		    
                    $('#mid_vid'+(message.fromtag-1)+'_cover').removeClass("hidden");
                    $('#mid_vid'+(message.fromtag-1)).addClass("hidden");
                    $('#large_vid'+(message.fromtag-1)+'_cover').removeClass("hidden");
                    $('#large_vid'+(message.fromtag-1)).addClass("hidden");
                    $('#small_vid'+(message.fromtag-1)+'_cover').removeClass("hidden");
                    $('#small_vid'+(message.fromtag-1)).addClass("hidden");
                }
                else if(message.fromtag < message.totag) {
                    console.log(message.fromtag);
                    pc[message.fromtag].close();
                    pc[message.fromtag] = "null";
                    mid_remoteVideo[message.fromtag].src = "";
                    large_remoteVideo[message.fromtag].src = "";
                    small_remoteVideo[message.fromtag].src = "";
		    
                    $('#mid_vid'+message.fromtag+'_cover').removeClass("hidden");
                    $('#mid_vid'+message.fromtag).addClass("hidden");
                    $('#large_vid'+message.fromtag+'_cover').removeClass("hidden");
                    $('#large_vid'+message.fromtag).addClass("hidden");
                    $('#small_vid'+message.fromtag+'_cover').removeClass("hidden");
                    $('#small_vid'+message.fromtag).addClass("hidden");
                }

                if((message.fromtag > id) && (message.type === 'bye')) {
                    for(var i=message.fromtag-1; i<=4; i++) {
                        mid_remoteVideo[i].src = "";
                        large_remoteVideo[i].src = "";
                        small_remoteVideo[i].src = "";
			
                        $('#mid_vid'+i+'_cover').removeClass("hidden");
                        $('#mid_vid'+i).addClass("hidden");
                        $('#large_vid'+i+'_cover').removeClass("hidden");
                        $('#large_vid'+i).addClass("hidden");
                        $('#small_vid'+i+'_cover').removeClass("hidden");
                        $('#small_vid'+i).addClass("hidden");
                    }
                }
                else if((message.fromtag < id) && (message.type === 'bye')) {
                    id = id - 1;
                    socket.emit("userid", id);
		    
                    for(var i=1; i<=4; i++) {
                        mid_remoteVideo[i].src = "";
                        large_remoteVideo[i].src = "";
                        small_remoteVideo[i].src = "";
			
                        $('#mid_vid'+i+'_cover').removeClass("hidden");
                        $('#mid_vid'+i).addClass("hidden");
                        $('#large_vid'+i+'_cover').removeClass("hidden");
                        $('#large_vid'+i).addClass("hidden");
                        $('#small_vid'+i+'_cover').removeClass("hidden");
                        $('#small_vid'+i).addClass("hidden");
                    }

                    for(var i=1; i<=4; i++) {
                        if(pc[i] != "null") {
                            if(i < id) {
                                pc[i].close();
                                pc[i] = "null";

                                sendMessage({
                                    type: "share",
                                    fromtag: id,
                                    totag: i
                                });
                            }
                            else if(i >= id) {
                                pc[i].close();
                                pc[i] = "null";

                                sendMessage({
                                    type: "share",
                                    fromtag: id,
                                    totag: i+1
                                });
                            }
                        }
                    }


                    for(var i=1; i<=id-1; i++) {
                        if(i == 1) {
                            pc[1] = new RTCPeerConnection(null, pc_constraints);
                            pc[1].onicecandidate = handleIceCandidate1;
                            pc[1].addStream(localStream);
                            pc[1].onaddstream = handleRemoteStreamAdded1;
                            pc[1].createOffer(setLocalAndSendMessage1, function(){});
                        }
                        else if(i == 2) {
                            pc[2] = new RTCPeerConnection(null, pc_constraints);
                            pc[2].onicecandidate = handleIceCandidate2;
                            pc[2].addStream(localStream);
                            pc[2].onaddstream = handleRemoteStreamAdded2;
                            pc[2].createOffer(setLocalAndSendMessage2, function(){});
                        }
                        else if(i == 3) {
                            pc[3] = new RTCPeerConnection(null, pc_constraints);
                            pc[3].onicecandidate = handleIceCandidate3;
                            pc[3].addStream(localStream);
                            pc[3].onaddstream = handleRemoteStreamAdded3;
                            pc[3].createOffer(setLocalAndSendMessage3, function(){});
                        }
                        else if(i == 4) {
                            pc[4] = new RTCPeerConnection(null, pc_constraints);
                            pc[4].onicecandidate = handleIceCandidate4;
                            pc[4].addStream(localStream);
                            pc[4].onaddstream = handleRemoteStreamAdded4;
                            pc[4].createOffer(setLocalAndSendMessage4, function(){});
                        }
                    }

                }
            }
	}
    });
    
    function setLocalAndSendMessage1(sessionDescription) {
	pc[1].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 1
	});
    }
    function setLocalAndSendMessage2(sessionDescription) {
	pc[2].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 2
	});
    }
    function setLocalAndSendMessage3(sessionDescription) {
	pc[3].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 3
	});
    }
    function setLocalAndSendMessage4(sessionDescription) {
	pc[4].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 4
	});
    }
    
    function setLocalAndSendMessage2_(sessionDescription) {
	pc[1].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 2
	});
    }
    function setLocalAndSendMessage3_(sessionDescription) {
	pc[2].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 3
	});
    }
    function setLocalAndSendMessage4_(sessionDescription) {
	pc[3].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 4
	});
    }
    function setLocalAndSendMessage5_(sessionDescription) {
	pc[4].setLocalDescription(sessionDescription);
	sendMessage({
	    sdp: sessionDescription.sdp,
	    type: sessionDescription.type,
	    fromtag: id,
	    totag: 5
	});
    }
    
    
    function handleRemoteStreamAdded1(event) {
	attachMediaStream(mid_remoteVideo[1], event.stream);
	attachMediaStream(large_remoteVideo[1], event.stream);
	attachMediaStream(small_remoteVideo[1], event.stream);
        
        $('#mid_vid1_cover').addClass("hidden");
        $('#mid_vid1').removeClass("hidden");
        $('#large_vid1_cover').addClass("hidden");
        $('#large_vid1').removeClass("hidden");
        $('#small_vid1_cover').addClass("hidden");
        $('#small_vid1').removeClass("hidden");
    }
    function handleRemoteStreamAdded2(event) {
	attachMediaStream(mid_remoteVideo[2], event.stream);
	attachMediaStream(large_remoteVideo[2], event.stream);
	attachMediaStream(small_remoteVideo[2], event.stream);
        
        $('#mid_vid2_cover').addClass("hidden");
        $('#mid_vid2').removeClass("hidden");
        $('#large_vid2_cover').addClass("hidden");
        $('#large_vid2').removeClass("hidden");
        $('#small_vid2_cover').addClass("hidden");
        $('#small_vid2').removeClass("hidden");
    }
    function handleRemoteStreamAdded3(event) {
	attachMediaStream(mid_remoteVideo[3], event.stream);
	attachMediaStream(large_remoteVideo[3], event.stream);
	attachMediaStream(small_remoteVideo[3], event.stream);
        
        $('#mid_vid3_cover').addClass("hidden");
        $('#mid_vid3').removeClass("hidden");
        $('#large_vid3_cover').addClass("hidden");
        $('#large_vid3').removeClass("hidden");
        $('#small_vid3_cover').addClass("hidden");
        $('#small_vid3').removeClass("hidden");
    }
    function handleRemoteStreamAdded4(event) {
	attachMediaStream(mid_remoteVideo[4], event.stream);
	attachMediaStream(large_remoteVideo[4], event.stream);
	attachMediaStream(small_remoteVideo[4], event.stream);
        
        $('#mid_vid4_cover').addClass("hidden");
        $('#mid_vid4').removeClass("hidden");
        $('#large_vid4_cover').addClass("hidden");
        $('#large_vid4').removeClass("hidden");
        $('#small_vid4_cover').addClass("hidden");
        $('#small_vid4').removeClass("hidden");
    }
    
    
    function handleIceCandidate1(event) {
	if (event.candidate) {
	    sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate,
		fromtag: id,
		totag: 1});
	} 
	else {
	    console.log('End of candidates.');
	}
    }
    function handleIceCandidate2(event) {
	if (event.candidate) {
	    sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate,
		fromtag: id,
		totag: 2});
	} 
	else {
	    console.log('End of candidates.');
	}
    }
    function handleIceCandidate3(event) {
	if (event.candidate) {
	    sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate,
		fromtag: id,
		totag: 3});
	} 
	else {
	    console.log('End of candidates.');
	}
    }
    function handleIceCandidate4(event) {
	if (event.candidate) {
	    sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate,
		fromtag: id,
		totag: 4});
	} 
	else {
	    console.log('End of candidates.');
	}
    }
    function handleIceCandidate5(event) {
	if (event.candidate) {
	    sendMessage({
		type: 'candidate',
		label: event.candidate.sdpMLineIndex,
		id: event.candidate.sdpMid,
		candidate: event.candidate.candidate,
		fromtag: id,
		totag: 5});
	} 
	else {
	    console.log('End of candidates.');
	}
    }
    
    
    
    
    $(".button-screen-share").click(function(){
        if(isjoined == false){
	    return;
	}
        
        if(browser == "firefox") {
            alert("firefox는 화면공유를 지원하지 않습니다.");
        }
        else if(browser == "chrome") {
            if(member >= 2)
            {
                if(screen_flag == 0) {
                    getUserMedia({video: {mandatory:{chromeMediaSource: 'screen'}}, audio: false}, ScreenSuccess, ScreenError);
                }
                else if(screen_flag == 1) {
                    getUserMedia(res480Constraints, ScreenSuccess, ScreenError);
                }
            }
        }
    });
    
    function ScreenSuccess(stream) {
        if(screen_flag == 0) {
            screen_flag = 1;
            $("#content2").removeClass("hidden");
            $("#localcover").removeClass("hidden");
        }
        else if(screen_flag == 1) {
            screen_flag = 0;
            $("#content2").addClass("hidden");
            $("#localcover").addClass("hidden");
        }
        
        for(var i=1; i<=4; i++) {
            if(pc[i] != "null") {
                if(i < id) {
                    pc[i].close();
                    pc[i] = "null";

                    sendMessage({
                        type: "share",
                        fromtag: id,
                        totag: i
                    });
                }
                else if(i >= id) {
                    pc[i].close();
                    pc[i] = "null";

                    sendMessage({
                        type: "share",
                        fromtag: id,
                        totag: i+1
                    });
                }
            }
        }
        
        
        
        
	localStream = stream;
	attachMediaStream(localVideo, stream);
	
	if(member == id) {
	    for(var i=1; i<=member-1; i++) {
		if(i == 1) {
		    pc[1] = new RTCPeerConnection(null, pc_constraints);
		    pc[1].onicecandidate = handleIceCandidate1;
		    pc[1].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[1].onaddstream = handleRemoteStreamAdded1;}
		    pc[1].createOffer(setLocalAndSendMessage1, function(){});
		}
		else if(i == 2) {
		    pc[2] = new RTCPeerConnection(null, pc_constraints);
		    pc[2].onicecandidate = handleIceCandidate2;
                    pc[2].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[2].onaddstream = handleRemoteStreamAdded2;}
		    pc[2].createOffer(setLocalAndSendMessage2, function(){});
		}
		else if(i == 3) {
		    pc[3] = new RTCPeerConnection(null, pc_constraints);
		    pc[3].onicecandidate = handleIceCandidate3;
                    pc[3].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[3].onaddstream = handleRemoteStreamAdded3;}
		    pc[3].createOffer(setLocalAndSendMessage3, function(){});
		}
		else if(i == 4) {
		    pc[4] = new RTCPeerConnection(null, pc_constraints);
		    pc[4].onicecandidate = handleIceCandidate4;
                    pc[4].addStream(localStream);
                    if(screen_flag == 0)
		    {pc[4].onaddstream = handleRemoteStreamAdded4;}
		    pc[4].createOffer(setLocalAndSendMessage4, function(){});
		}
	    }
	}
	else if(member > id) {
	    for(var i=1; i<=member-1; i++) {
		if(i < id) {
		    if(i == 1) {
			pc[1] = new RTCPeerConnection(null, pc_constraints);
			pc[1].onicecandidate = handleIceCandidate1;
                        pc[1].addStream(localStream);
                        if(screen_flag == 0)
			{pc[1].onaddstream = handleRemoteStreamAdded1;}
			pc[1].createOffer(setLocalAndSendMessage1, function(){});
		    }
		    else if(i == 2) {
			pc[2] = new RTCPeerConnection(null, pc_constraints);
			pc[2].onicecandidate = handleIceCandidate2;
                        pc[2].addStream(localStream);
                        if(screen_flag == 0)
			{pc[2].onaddstream = handleRemoteStreamAdded2;}
			pc[2].createOffer(setLocalAndSendMessage2, function(){});
		    }
		    else if(i == 3) {
			pc[3] = new RTCPeerConnection(null, pc_constraints);
			pc[3].onicecandidate = handleIceCandidate3;
                        pc[3].addStream(localStream);
                        if(screen_flag == 0)
			{pc[3].onaddstream = handleRemoteStreamAdded3;}
			pc[3].createOffer(setLocalAndSendMessage3, function(){});
		    }
		    else if(i == 4) {
			pc[4] = new RTCPeerConnection(null, pc_constraints);
			pc[4].onicecandidate = handleIceCandidate4;
                        pc[4].addStream(localStream);
                        if(screen_flag == 0)
			{pc[4].onaddstream = handleRemoteStreamAdded4;}
			pc[4].createOffer(setLocalAndSendMessage4, function(){});
		    }
		}
		else if(i >= id) {
		    if(i == 1) {
			pc[1] = new RTCPeerConnection(null, pc_constraints);
			pc[1].onicecandidate = handleIceCandidate2;
                        pc[1].addStream(localStream);
                        if(screen_flag == 0)
			{pc[1].onaddstream = handleRemoteStreamAdded1;}
			pc[1].createOffer(setLocalAndSendMessage2_, function(){});
		    }
		    else if(i == 2) {
			pc[2] = new RTCPeerConnection(null, pc_constraints);
			pc[2].onicecandidate = handleIceCandidate3;
                        pc[2].addStream(localStream);
                        if(screen_flag == 0)
			{pc[2].onaddstream = handleRemoteStreamAdded2;}
			pc[2].createOffer(setLocalAndSendMessage3_, function(){});
		    }
		    else if(i == 3) {
			pc[3] = new RTCPeerConnection(null, pc_constraints);
                        pc[3].onicecandidate = handleIceCandidate4;
                        pc[3].addStream(localStream);
                        if(screen_flag == 0)
			{pc[3].onaddstream = handleRemoteStreamAdded3;}
			pc[3].createOffer(setLocalAndSendMessage4_, function(){});
		    }
		    else if(i == 4) {
			pc[4] = new RTCPeerConnection(null, pc_constraints);
			pc[4].onicecandidate = handleIceCandidate5;
                        pc[4].addStream(localStream);
                        if(screen_flag == 0)
			{pc[4].onaddstream = handleRemoteStreamAdded4;}
			pc[4].createOffer(setLocalAndSendMessage5_, function(){});
		    }
		}
	    }
	}
    }
    function ScreenError() {
	console.log("ScreenShare Error!");
    }
    
    //Video 멈추게 하자!
    $(".button-exit").click(function(){
        if(isjoined == false)
        {return;}
        
        if(confirm("나가시겠습니까?")){
            socket.emit("leave");
            $("#chat-mode").addClass("hidden");
            $("#flist-mode-wrap").removeClass("hidden");
            $('#midium-set').show();
            $('#non-midium-set').hide();
            $(".cb-cover").fadeIn();
        }
        else {
            return;
        }
        
        leaveRoom();
    });
    
    
    //이 코드 다른곳에서도 쓰이니까 함수로 하는게 좋을듯.
    function leaveRoom() {
	isjoined = false;
        screen_flag = 0;
        $("#content2").addClass("hidden");
        $("#localcover").addClass("hidden");
        
        completeoffer[1] = false;
        completeoffer[2] = false;
        completeoffer[3] = false;
        completeoffer[4] = false;
        completeanswer[1] = false;
        completeanswer[2] = false;
        completeanswer[3] = false;
        completeanswer[4] = false;
        
        isStart = false;
        webcamallow = false;
        
        localVideo.src = "";
        localVideo.pause();

        for(var i=1; i<=4; i++) {
            mid_remoteVideo[i].src = "";
            large_remoteVideo[i].src = "";
            small_remoteVideo[i].src = "";
            
            $('#mid_vid'+i+'_cover').removeClass("hidden");
            $('#mid_vid'+i).addClass("hidden");
            $('#large_vid'+i+'_cover').removeClass("hidden");
            $('#large_vid'+i).addClass("hidden");
            $('#small_vid'+i+'_cover').removeClass("hidden");
            $('#small_vid'+i).addClass("hidden");
        }
	
	for(var i=1; i<=4; i++) {
	    if(pc[i] != "null") {
		console.log(i);
		if(i < id) {
		    pc[i].close();
		    pc[i] = "null";
		    
		    sendMessage({
			type: "bye",
			fromtag: id,
			totag: i
		    });
		}
		else if(i >= id) {
		    pc[i].close();
		    pc[i] = "null";
		    
		    sendMessage({
			type: "bye",
			fromtag: id,
			totag: i+1
		    });
		}
	    }
	}
	
	$("#flist-wrap").removeClass("hidden");
	$("#chat-mode").addClass("hidden");
	$("#video-wrap").removeClass("hidden");
	$("#video-wrap2").addClass("hidden");
        
        // $("#button-mirror").css("margin-left", parseInt($('#video-wrap').css("width"))/2 - 30 + "px" );
        
        // $('.big').css("width", "90%");
        // $('.big').css("height", parseInt($('.big').css("width"))*0.6 + "px");
        // $('.big').css("margin-top", (parseInt($('#video-wrap2').css("height")) - parseInt($('.big').css("height")))/2 + "px");
        
        
        //default video resolution

        
        socket.emit("exit", "");
    }

    
    /*-------------------aside slide button------------------*/


    $(document).on("click", ".auto-user-list", function() {

	$.ajax({	//친구추가를 요청하는 ajax
    	    url: '/addFriend',
       	    data: { mail: $('#friends-search-input').val()},
       	    dataType: "jsonp",
       	    success: function(data) {
        	alert(data.result);
		if(data.friendName){ //data에 friendName이 같이 넘어온경우 (즉 친구추가가 성공한 경우)
            	    socket.emit('addFriend', {friendRowid:data.friendRowid, friendName:data.friendName});
		}
            },
            error: function(jqXHR, textStatus, errorThrown) {
        	alert('error ' + textStatus + " " + errorThrown);
            }
	});
	$('#friends-search-input').val("");
    });
    
    
    
    
    //---------------------------------------------------------
        //animation.js에 보면 body가 클릭되면 popover들은 전부 사라지는 코드가 있기때문에 뜨자마자 사라짐..
        //그래서 stopPropagation로 클래스 name을 눌렀을경우의 행동을 막아주면됨.. 이걸 animation.js에 넣으면 동작 안함!
        //혹은 body를 눌렀을때 사라지지 않게 다른 클래스를 준다거나 그런방법도 있어
        //또 채팅방에 들어가게되면 메세지함에서는 깜빡거리면서 사라지는 이유는 함수가 불려지면서 $(".name").click이 여러개 쌓이기때문에
        //여러개가 한번에 작동하는거였음...
        //이걸 해결하기위해 다음과같이 기존의 문제점이었던 모든 소켓이벤트 안에다가 넣어야한다는것을 극복하는 방법을 적용시킴...
        //위에도 써먹었던 방법인데도 너무 초반에 써먹은거라 잊어먹고 있었어 ㅠㅠㅠ
    //---------------------------------------------from.hyunwoo
    $(document).on("click", ".name", function(e) {
		e.stopPropagation();
		
        var target = $("#popover-name");
    	var divLeft, divTop;
    	//alert("dd");
    	if($(window).width() - e.clientX < 140)
    	{    divLeft = $(window).width() - 175;	}
    	else
    	{    divLeft = e.clientX - 30;}

    	if($(window).height() - e.clientY < 120)
    	{    divTop = e.clientY - 120;}
    	else
    	{    divTop = e.clientY + 13; }

    	if(target.hasClass("close")){
    	    target.css({
    		"top": divTop,
    		"left": divLeft
    	    }).fadeIn("fast");
	    
    	    target.removeClass("close");
    	}
    	else{
    	    target.fadeOut("fast");
    	    target.addClass("close");
    	}
    });




    /* ------------------ local function --------------------*/

});

    function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();
	
	if (n.length < digits) {
	    for (i = 0; i < digits - n.length; i++){
		zero += '0';
	    }
	}
	return zero + n;
    }

    function joinRoom(){
	var date = new Date();
        out_year = date.getFullYear();
        out_month = date.getMonth() + 1;
        out_date = date.getDate();
        out_day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];
	out_hour = date.getHours();
	out_minute = date.getMinutes();
	out_second = date.getSeconds();
        out_ampm = "";
	
	
	$("#flist-mode-wrap").addClass("hidden");
	$("#chat-mode").removeClass("hidden");
	$(".cb-cover").fadeOut();


	if(out_hour < 12) {
    	    out_ampm = " am";
	} else {
	    out_hour -= 12;
	    out_ampm = " pm";
	}
	
	document.getElementById('chat-wrap').innerHTML = "";
	
	a = 0;
	textToInsert = [];
	
	textToInsert[a++] = '<p id=\"date\"><time>';
	textToInsert[a++] = out_year;
	textToInsert[a++] = '/';
	textToInsert[a++] = leadingZeros(out_month, 2);
	textToInsert[a++] = '/';
	textToInsert[a++] = leadingZeros(out_date, 2);
	textToInsert[a++] = '/';
	textToInsert[a++] = out_day;
	textToInsert[a++] = ' ';
	textToInsert[a++] = out_hour;
	textToInsert[a++] = ':';
	textToInsert[a++] = leadingZeros(out_minute, 2)+out_ampm;
	textToInsert[a++] = '<time></p>';
	
	textToInsert[a++] = '<p class=\"enter\"><span class=\"name\">';
	textToInsert[a++] = myName;
	textToInsert[a++] = '</span> 님이 입장했습니다.</p>';
	$('#chat-wrap').append(textToInsert.join(''));
	
	document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
	
	/*
	  document.getElementById('chat-wrap').innerHTML = "";
	  document.getElementById('chat-wrap').innerHTML += (
          "<p id=\"date\"><time>"+ out_year+"/"+leadingZeros(out_month, 2)+"/"+leadingZeros(out_date, 2)+"/"+out_day+" "+out_hour+":"+leadingZeros(out_minute, 2)+out_ampm+"<time></p>"
	  );
	  
	  document.getElementById('chat-wrap').innerHTML += (
          "<p class=\"enter\"><span>"+ myName+"</span> 님이 입장했습니다.</p>"
	  );
	*/



	video_flag = 0;
	$("#video-wrap").addClass("hidden");
	$("#video-wrap2").removeClass("hidden");
	$('.mid_video').css("width", "49%");
	$('.mid_video').css("height", parseInt($('.mid_video').css("width"))*0.6 + "px");
	$('.br').hide();
	if(parseInt($('#midium-set').css("top")) < 0)
	{
	    $('#midium-set').css("top", "0px");}
	
	/*--------------------- aside -------------------------*/
	$('#video-wrap2').css("margin-left", "310px");
	$('#video-wrap').css("margin-left", "310px");
	$('#content').css("right", "260px");
	$('#content2').css("right", "260px");
	
	$('#video-wrap2').css("height", (parseInt($('#content').css("height")))-54 + "px");
	$('#video-wrap').css("height", (parseInt($('#content').css("height")))-54 + "px");
	$('#midium-set').css("top", (parseInt($('#video-wrap2').css("height")) - parseInt($('#midium-set').css("height")))/2+"px");
	
	$('#content2').css("width", $('#video-wrap2').css("width"));
	$('#sharecover').css("top", (parseInt($('#video-wrap2').css("height"))/2) - (parseInt($('#sharecover').css("height"))/2) + "px");
    }

    /*
      function byteNum(str) { //자기정보 수정할때 쓰기위한 바이트길이 세는 함수 
      var bytenum = 0;
      
      for(var i=0; i<str.length; i++){
      if(escape(str.charAt(i)).length>4){
      bytenum+=2;
      } else {
      bytenum++;
      }
      }
      return bytenum;
      }*/

/* ------------------ extern function ---------------- */
function sendChatMessage() {
    if(document.getElementById('local-msg').value == "\n"){ 
    }
    else{
	var date = new Date();
        var hours = date.getHours();
        var minutes = leadingZeros(date.getMinutes(), 2);
        var ampm = "";
	
	if(hours < 12){
	    ampm = " am";
	} else {
	    hours -= 12;
	    ampm = " pm";
	}
        
	socket.emit('message', {name: myName, chat: document.getElementById('local-msg').value, time: hours+":"+minutes+ampm});
	
        
        var a = 0;
        var textToInsert = [];
        
        textToInsert[a++] = '<div class=\"msg-wrap local-msg-sended\">';
        textToInsert[a++] = '<span class=\"name\">';
        textToInsert[a++] = myName;
        textToInsert[a++] = '</span>';
        textToInsert[a++] = '<span class=\"msg-time\"><time>';
        textToInsert[a++] = hours + ":" + minutes + ampm;
        textToInsert[a++] = '</time></span>';
        textToInsert[a++] = '<span class=\"msg-arrow\"></span>';
        textToInsert[a++] = '<p>';
        textToInsert[a++] = document.getElementById('local-msg').value;
        textToInsert[a++] = '</p>';
        textToInsert[a++] = '</div>';
        $('#chat-wrap').append(textToInsert.join(''));
        

    }
    
    document.getElementById('local-msg').value = "";
    document.getElementById('chat-wrap').scrollTop = document.getElementById('chat-wrap').scrollHeight;
    $('#local-msg').css("height", "20px");
}

