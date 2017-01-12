function getCookie(name) {
    var Found = false;
    var start, end;
    var i = 0;

    while(i <= document.cookie.length) {
        start = i;
        end = start + name.length;
        if(document.cookie.substring(start, end) == name) {
            Found = true;
            break;
        }
        i++;
    }

    if(Found === true) {
        start = end + 1;
        end = document.cookie.indexOf(';', start);
        if(end < start)
            end = document.cookie.length;
        return document.cookie.substring(start, end);
    }
    return undefined;
}

function setCookie( name, value, expiredays ) {
    var todayDate = new Date();
    todayDate.setDate( todayDate.getDate() + expiredays );
    document.cookie = name + '=' + escape( value ) + '; path=/; expires=' + todayDate.toGMTString() + ';';
}

function deleteCookie( name ) {
    var expireDate = new Date();
    expireDate.setDate( expireDate.getDate() - 1 );
    document.cookie = name + '=no; path=/; expires=' + expireDate.toGMTString() + ';';
}

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('');
};


$(function() {
    var TODAY_SECURITY_LEVEL = {
        NORMAL : 'level_4/정상',
        CAUTION : 'level_3/주의',
        WARNING : 'level_1/경고',
        DANGER  : 'level_2/위험'
    };

    function checkRefreshCache(){
        setTodaySecurityLevelData();
    }

    function setTodaySecurityLevelData(){
        $.ajaxSetup({
            async : false
        });
        $.get('/today/security',cacheSecurityLevel);
        return true;
    }

    function cacheSecurityLevel(data){
        setCookie('todaySecurity',data.date + '_' + data.securitLevel);
        //console.log(getCookie('todaySecurity'));
    }
    function setTodaySecurityLevel(){
        var todaySecurityLevel = getCookie('todaySecurity').split('_')[1];
        var todayLevel = TODAY_SECURITY_LEVEL[todaySecurityLevel];
        $('#todayLevel').addClass(todayLevel.split('/')[0]);
        $('#todayLevel').text(todayLevel.split('/')[1]);
    }
    function setTodaySecurityDate(){
        $('#todayLevelDate').text(getCookie('todaySecurity').split('_')[0]);
    }

    checkRefreshCache();
    setTodaySecurityLevel();
    setTodaySecurityDate();
    $('#todaySecurityLevelSection').show();
});

function getParam(key) {
    var _parammap = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function() {
        function decode(s) {
            return decodeURIComponent(s.split('+').join(' '));
        }

        _parammap[decode(arguments[1])] = decode(arguments[2]);
    });

    return _parammap[key];
}
function activeCategory(category){
    var checkString = category;
     if(category === undefined){
        checkString = 'ALL';
    }
    var listTag = $('ul[class=tab] li a');
     listTag.each(function(item){
     	if($(listTag[item]).text().replace(/ /g, '') == checkString.replace(/ /g, '')){
     		$(listTag[item]).parent('li').addClass('active');
     	}
    });
    var mobileTag = $('.tab_mobile option');
    mobileTag.each(function(item){
    	if($(mobileTag[item]).text().replace(/ /g, '') == checkString.replace(/ /g, '')){
    		$(mobileTag[item]).attr('selected' , true);
    	}
    });

}

function setPagenationCategory(category , q){
	var pageTag = $('.paginate a');
	pageTag.each(function(item){
		var url = $(pageTag[item]).attr('href')  + '?' + (category !== undefined ?   ('category=' + category) :   '');
        if(q !== null && q !== undefined){
            url += "q=" + encodeURI(q);
        }
		$(pageTag[item]).attr('href' , url);
	});
}

function checkAndChangeButton(){
 //    console.log(parent.document.referrer);
	// if(parent.document.referrer != '' && (parent.document.referrer.indexOf("list") != -1 || parent.document.referrer.indexOf("/1") != -1)){
 //        $('.board_view #listButton').attr('href',parent.document.referrer);
	// }
}

function setNewsLetter(success){
	$.ajax({
	    url: '/mainNewsletterAPI',
	    type: 'GET',
	    dataType: 'json',
	    success: success,
	    error: function(request, status, error) {
	        // alert('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
	    }
	});
}

if($(".main_notice").length > 0){ //메인이 있을경우에만
    setNewsLetter(function(result){
        $('#commonSense p').text('');
        $('#commonSense strong').text('');
        $('#column strong').text('');
        $('#column p').text('');

        $('#column strong').text(result.data.column.title);
        $('#column p').text(result.data.column.content);
        $('#column').attr('href', '/securityCenter/column/view/' + result.data.column.id );


        $('#commonSense p').text(result.data.commonSense.content);
        $('#commonSense strong').text(result.data.commonSense.title);
        $('#commonSense').attr('href', '/securityCenter/commonSense/view/' + result.data.commonSense.id );
        $('.security_trends strong').text(result.data.alyacBlog.title);
        $('.security_trends p').html(result.data.alyacBlog.content);
        $('.security_trends a').attr('href',result.data.alyacBlog.url);

        $('#security_vulnerability_1 p').text(result.data.securityVulnerability[0].content);
        $('#security_vulnerability_1 strong').text(result.data.securityVulnerability[0].title);
        $('#security_vulnerability_1').attr('href', '/securityCenter/securityVulnerability/view/' + result.data.securityVulnerability[0].id );

        $('#security_vulnerability_2 p').text(result.data.securityVulnerability[1].content);
        $('#security_vulnerability_2 strong').text(result.data.securityVulnerability[1].title);
        $('#security_vulnerability_2').attr('href', '/securityCenter/securityVulnerability/view/' + result.data.securityVulnerability[1].id );
    });

    var description = [
        "/images/security_trends_img_1.png",
        "/images/security_trends_img_2.png",
        "/images/security_trends_img_3.png",
        "/images/security_trends_img_4.png",
        "/images/security_trends_img_5.png"
    ];

    var size = description.length;
    var x = Math.floor(size*Math.random());
    document.getElementById('secure_img').src=description[x];
}

var category = getParam("category");
activeCategory(category);
setPagenationCategory(category , getParam("q"));
checkAndChangeButton();

function getSplitFirstURI(url){
    return url.split("/")[1];
}

function setMobileSelectActive(){
    var mobileTag = $('.tab_mobile option');
    var checkString = $(".tab li[class=active]").text();
    mobileTag.each(function(item){
        //console.log($(mobileTag[item]).text().replace(/ /g, ''));
        if($(mobileTag[item]).text().replace(/ /g, '') == checkString.replace(/ /g, '')){
            $(mobileTag[item]).attr('selected' , true);
        }
    });
}

setMobileSelectActive();

var input = getSplitFirstURI($(location).attr('pathname'));
var menuActiveTag = $('ul[class=nav_main] li.mega_menu_fullwidth > a');
menuActiveTag.each(function(item){
    if(getSplitFirstURI($(menuActiveTag[item]).attr("href")) == input){
        $(this).addClass("active");
    }
});

if ($("input[name=q]").length > 0){
    $("button[type=submit]").click(function(){
        if($("input[name=q]").val() === ""){
            alert("검색어를 입력해주세요");
            return false;
        }
    });
}
