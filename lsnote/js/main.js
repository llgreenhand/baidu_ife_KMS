
var windowHeight = $(window).height();

$("#left").height(windowHeight + "px");
$("#center").height(windowHeight + "px");

$("#left .add").on("click",function(){
	$("#left li:last").after("<li><input type=\"text\" placeholder=\"笔记本名称\"/></li>");
	$("#left li:last").attr("id","newwrite");
});