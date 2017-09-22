function SoratabiSite(options){

}

SoratabiSite.prototype.init = function(callOnSuccess, callOnError){
	setTimeout(callOnSuccess, 1);
}

SoratabiSite.prototype.updateSearchCondition = function(params){
	var $form = null;
	if(params.direction == "return"){
		if(!$(".round_trip_button").hasClass("active"))
			$(".round_trip_button").trigger("click")
		$form = $(".return_form")
	}
	else{
		$form = $(".flight_search")
	}
	$form.find(".leaveBox").val(params.leave_location);
	$form.find(".arriveBox").val(params.arrive_location);
	var date = new Date(params.start_date);
	$form.find(".flight_date select:nth(0)").val(date.getMonth()+1)
	$form.find(".flight_date select:nth(1)").val(date.getDate())
}

SoratabiSite.prototype.doSearch = function(){
	$(".search_button").trigger("click")
}

SoratabiSite.prototype.doCancel = function(params){
	if($.inArray(params.cancel_type,["all","go"])){
		var $form = $(".flight_search"),
			now = new Date();
		$form.find(".leaveBox").val("");
		$form.find(".arriveBox").val("");
		$form.find(".flight_date select:nth(0)").val(now.getMonth()+1)
		$form.find(".flight_date select:nth(1)").val(now.getDate())
	}
	if($.inArray(params.cancel_type,["all","return"])){
		var $form = $(".return_form"),
			tomorow = new Date();
		tomorow.setDate(tomorow.getDate()+1)
		$form.find(".leaveBox").val("");
		$form.find(".arriveBox").val("");
		$form.find(".flight_date select:nth(0)").val(tomorow.getMonth()+1)
		$form.find(".flight_date select:nth(1)").val(tomorow.getDate())
	}
}