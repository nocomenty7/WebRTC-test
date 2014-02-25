//var socket;

$(document).ready(function(){

	var opts = {
	  lines: 13, // The number of lines to draw
	  length: 18, // The length of each line
	  width: 8, // The line thickness
	  radius: 30, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#000', // #rgb or #rrggbb or array of colors
	  speed: 1.2, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};


	$('#login').submit(function(event){
		event.preventDefault();
		
		var $form = $(this),
		id = $form.find("input[name='id']").val(),
		password = $form.find("input[name='password']").val(),
		url = $form.attr("action");
				
		var posting = $.post(url, {id: id, password: password});
			
		posting.done(function(data){
			
			if(data.errorCode){	
				if(data.errorCode==1){ //ID가 존재하지 않음
					//$("#id_error").show();
					$('#idtext').val("");
					$('#pwdtext').val("");
					$('#idtext').focus();
				}
				else if(data.errorCode==2){ //비밀번호가 틀림
					//$("#pwd_error").show();
					$('#pwdtext').val("");
					$('#pwdtext').focus();
				}
				else if(data.errorCode==3){ //기존에 접속되어 있는 계정을 접속시도 했을때
					if(confirm("이미 접속중인 계정입니다. 강제로 끊고 접속하시겠습니까?")){
		    			//socket = io.connect();
		    			$("#disable").addClass("disable_window");
		    			
		    			var target = document.getElementById("wrap");
           				var spinner = new Spinner(opts).spin(target);
						$.get("/dupLogin", {id: data.id}).done(function(data2){
							spinner.stop(target);
							window.location.href = data2.url;
						});
		    		} else {
						
						//$('#idtext').val("");
						//$('#pwdtext').val("");
		    		}
				}
			}
			
			if(data.notify){
				alert(data.notify);
			}
			
			if(data.url){
				
				window.location.href = data.url;
			}
		});
	});
});
