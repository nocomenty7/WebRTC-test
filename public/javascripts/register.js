var password="";
var confirm_password="";

window.onload = function() {
	document.getElementById('submit').disabled = true;
	$("#name_error").hide();
	$("#mail_error").hide();
	$("#mail_dup_error").hide();
	$("#password_error").hide();
	$("#check_password_error").hide();
	
	$('#register').submit(function(event){
		event.preventDefault();
		
		var $form = $(this),
		name = $form.find("input[name='name']").val(),
		id = $form.find("input[name='id']").val(),
		password = $form.find("input[name='password']").val(),
		url = $form.attr("action");
				
		var posting = $.post(url, {name: name, id: id, password: password});
			
		posting.done(function(data){
				
			if(data.errorCode==1){
				$('#idtext').focus();
				$("#mail_dup_error").show();
			}
			
			if(data.url){
				alert(data.notify);
				window.location.href = data.url;
			}
		});
	});
}
	
function byteNum(str) {
	var bytenum = 0;
	
	for(var i=0; i<str.length; i++){
		if(escape(str.charAt(i)).length>4){
			bytenum+=2;
		} else {
			bytenum++;
		}
	}
	return bytenum;
}
			
function out1(f) {
	var regType = /^[a-zA-Z0-9가-힣]{1,30}$/g;

	if(f.value.length==0){
		document.getElementById('nametext').className = "error";
		$("#name_error").hide();
	}
	else if(!regType.test(f.value)||byteNum(f.value)>20)
	{
		document.getElementById('nametext').className = "error";
		$("#name_error").show();
	}
	else 
	{
		document.getElementById('nametext').className = "not_error";	
		$("#name_error").hide();
	}
	check();
}  

// email은 정규식을 좀 더 알아볼 것.
function out2(f) {
	var regType = /(\S+)@(\S+)\.(\S+)/;
	$("#mail_dup_error").hide();
	
	if(f.value.length==0){
		document.getElementById('idtext').className = "error";
		$("#mail_error").hide();
	}
	else if(!regType.test(f.value)) 
	{
		document.getElementById('idtext').className = "error";
		$("#mail_error").show();
	}
	else 
	{
		document.getElementById('idtext').className = "not_error";	
		$("#mail_error").hide();
	}
	check();
}  
	
function out3(f) {
	var regType = /^[a-zA-Z0-9]{1,20}$/g;
	password = f.value;
	
	if(f.value.length==0){
		document.getElementById('pwdtext').className = "error";
		$("#password_error").hide();
	}
	else if(!regType.test(f.value)) 
	{
		document.getElementById('pwdtext').className = "error";
		$("#password_error").show();
	}
	else 
	{
		document.getElementById('pwdtext').className = "not_error";	
		$("#password_error").hide();
	}
	check();
		
}  

function out4(f) {
	confirm_password = f.value;
	
	
	if(f.value.length==0){
		document.getElementById('check_pwdtext').className = "error";
		$("#check_password_error").hide();
	}
	else if(confirm_password != password) 
	{
		document.getElementById('check_pwdtext').className = "error";
		$("#check_password_error").show();
	}
	else 
	{
		document.getElementById('check_pwdtext').className = "not_error";	
		$("#check_password_error").hide();
	}
	check();
}  
			
function check() {
	if(document.getElementById('nametext').className == "not_error"  && document.getElementById('idtext').className == "not_error" && 
	   document.getElementById('pwdtext').className == "not_error" && document.getElementById('check_pwdtext').className == "not_error"){
		document.getElementById('submit').disabled = false;
	} else {
		document.getElementById('submit').disabled = true;
	}
}
