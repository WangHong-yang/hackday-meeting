"use strict";
var oList = [];

(function(){

/* eui 命名空间  */
var _eui = window.eui;
var eui = window.eui = {};

eui.noConflict = function () {
    window.eui = _eui;
};

eui.addHandler = function (elem, type, handler) {
    if (elem.addEventListener) {
        elem.addEventListener(type, handler, false);
    } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, handler);
    } else {
        elem['on' + type] = handler;
    }
};

// 卸载监听器
eui.removeHandler = function (elem, type, handler) {
    if (elem.removeEventListener) {
        elem.removeEventListener(type, handler, false);
    } else if (elem.detachEvent) {
        elem.detachEvent('on' + type, handler);
    } else {
        elem['on' + type] = null;
    }
};

eui.getEvent = function (e) {
    return e ? e : window.event;
};


eui.getTarget = function (e) {
    return e.target || e.srcElement;
};

eui.getElemLeft = function (element) {
    var currentLeft = element.offsetLeft;
    var current = element.offsetParent;

    while (current) {
        currentLeft += current.offsetLeft;
        current = current.offsetParent;
    }

    return currentLeft;
};


eui.getElemTop = function (element) {
    var currentTop = element.offsetTop;
    var current = element.offsetParent;

    while (current) {
        currentTop += current.offsetTop;
        current = current.offsetParent;
    }

    return currentTop;
};

eui.isContent = function(elem, content){
    while(elem){
        if(elem === content) {
            return true;
        }
        elem = elem.parentNode;
    }
    return false;
};

})();


(function () {

// 判断y年是不是闰年
function _isLeapYear(y){
    return (y > 0) && !(y % 4) && ((y % 100) || !(y % 400));
}

// 判断当前月份从星期几开始
function _getDayofWeek(y, m, daynum) {
    var days = 1;
    for (var i = 1, len = m; i < len; i++) {
        days += daynum[i - 1];
    }

    var w = (y - 1) + Math.floor((y - 1) / 4) - Math.floor((y - 1) / 100) +
                Math.floor((y - 1) / 400) + days;
    w = w % 7;
    return w;
}

// class Calendar
// 日历数据仓库
var Calendar = {};

// 初始化，设定当前年、月、日期
Calendar.initialize = function(o){
    var currentYear = o.currentYear,
        currentMonth = o.currentMonth;
        
    this.change(currentYear, currentMonth);
};

// 更新日历数据库的数据
// 需要提供年、月
Calendar.change = function (year, month) {
    this.currentYear = year;
    this.currentMonth = month;
    this.daynums = [31, _isLeapYear(year) ? 29 : 28,
            31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var currentDaynum = this.daynums[month - 1]; 
    this.currentDays = [];
    for (var i = 0; i < currentDaynum; i++) {
        this.currentDays.push(i + 1);
    }
};

// 获取当前月从星期几开始
Calendar.getWeekday = function(){
    var currentYear = this.currentYear,
        currentMonth = this.currentMonth,
        currentDaynums = this.daynums; 
        
    return _getDayofWeek(currentYear, currentMonth, currentDaynums);
};

// 获取当前年
Calendar.getCurrentYear = function(){
    return this.currentYear;
};

// 获取当前月
Calendar.getCurrentMonth = function(){
    return this.currentMonth;
};

// 获取当前日期
Calendar.getCurrentDays = function(){
    return this.currentDays;
};


// class CalendarWidget
// 日历控件的UI
var CalendarWidget = {};

CalendarWidget.initialize = function (o) {
    var self = this;

    // 提取配置参数
    var now = new Date();
    var currentYear = parseInt(o.currentYear || now.getFullYear()),
        currentMonth = parseInt(o.currentMonth || now.getMonth() + 1),
        startYear = parseInt(o.startYear || 1900),
        endYear = parseInt(o.endYear || now.getFullYear()),
        input = o.input;

    this.input = input;

    // 日历控件容器
    var content = document.createElement('div');
    content.className = 'eui-calendar';

    // 设置年、月选择UI
    var selectContent = document.createElement('ul'),
        yearHTML = '',
        monthHTML = '';

    yearHTML += '<li><select data-calendar="year">';
    for (var j = startYear; j <= endYear; j++) {
        yearHTML += '<option value="' + j + '">' + j + '年</option>';
    }
    yearHTML += '</select></li>';

    monthHTML += '<li><select data-calendar="month">';
    for (var i = 1, MONTHS_LENGTH = 12; i <= MONTHS_LENGTH; i++) {
        monthHTML += '<option value="' + i + '">' + i + '月</option>';
    }
    monthHTML += '</select></li>';

    selectContent.innerHTML = yearHTML + monthHTML;
    selectContent.className = 'eui-calendar-selectcontent';

    var yearSelect = selectContent.getElementsByTagName('select')[0],
        monthSelect = selectContent.getElementsByTagName('select')[1];

    yearSelect.selectedIndex = currentYear - startYear;
    monthSelect.selectedIndex = currentMonth - 1;

    // 星期UI
    var weekContent = document.createElement('ul'),
        weeks = ['', '', '', '', '', '', ''],
        weekHTML = '';

    for (var m = 0, len = weeks.length; m < len; m++) {
        weekHTML += '<li class="eui-calendar-weekday">' + weeks[m] + '</li>';
    }

    weekContent.innerHTML = weekHTML;
    weekContent.className = 'eui-calendar-week';


    // 初始化日历数据仓库，并建立日期UI
    this.calendar = Calendar;
    this.calendar.initialize({
        currentYear: currentYear,
        currentMonth: currentMonth
    });

    this.dateContent = document.createElement('ul');
    this.dateContent.className = 'eui-calendar-datecontent';

    this.resetDateContent();

    // 添加控件到HTML文档
    content.appendChild(selectContent);
    content.appendChild(weekContent);
    content.appendChild(this.dateContent);
    document.body.appendChild(content);

    _setPosition(content, input);

    function onchange(e) {
        self.change(yearSelect.value, monthSelect.value);
    }

    function onputdate(e) {
        e = eui.getEvent(e);

        var target = eui.getTarget(e),
            data = target.getAttribute('data-calendar');

        if (data === 'day') {
            var date = self.getDate(target.innerHTML);
            //input.value = input.value + date.year + '-' + date.month + '-' + date.date;
            //_hide(content);
            target.className = 'eui-calendar-date eui-calendar-today'; // 
            oList.push(String(date.month + ' · ' + date.date));
        }

        // 点击网页其他地方日期选择框消失
        if (!eui.isContent(target, content) && target !== input) {
            //_hide(content);
        }
    }

    function onshow() {
        _show(content);
    }

    eui.addHandler(yearSelect, 'change', onchange);
    eui.addHandler(monthSelect, 'change', onchange);
    eui.addHandler(document, 'click', onputdate);
    eui.addHandler(input, 'focus', onshow);
};

// 设置日期控件
CalendarWidget.resetDateContent = function () {
    var now = new Date(),
        todayYear = now.getFullYear(),
        todayMonth = now.getMonth() + 1,
        todayDate = now.getDate(),
        currentYear = this.calendar.getCurrentYear(),
        currentMonth = this.calendar.getCurrentMonth();
   
    var currentDays = this.calendar.getCurrentDays(),
        weekdays = this.calendar.getWeekday(),
        dateHTML = '';

    for (var i = 0; i < weekdays; i++) {
        dateHTML += '<li class="eui-calendar-lastmonthdate"></li>'
    }

    for (var n = 0, daysLength = currentDays.length; n < daysLength; n++) {
        if (todayYear == currentYear && todayMonth == currentMonth 
                && todayDate == n + 1) {
            dateHTML += '<li class="eui-calendar-date" data-calendar="day">' +
                    currentDays[n] + '</li>';
        } else {
            dateHTML += '<li class="eui-calendar-date" data-calendar="day">' +
                    currentDays[n] + '</li>';
        }
    }

    this.dateContent.innerHTML = dateHTML;
};

CalendarWidget.change = function (year, month) {
    this.calendar.change(parseInt(year), parseInt(month));
    this.resetDateContent();
};

CalendarWidget.getDate = function (date) {
    return {
        year:this.calendar.getCurrentYear(),
        month:this.calendar.getCurrentMonth(),
        date:date
    };
};

function _setPosition(elem, input){
    var left = eui.getElemLeft(input),
        top = eui.getElemTop(input),
        height = input.offsetHeight;

    elem.style.left = left + 37+ 'px';
    elem.style.top = top + height + 11 -150 + 'px';
}

function _show (elem) {
    elem.style.display = 'block'; 
};

function _hide (elem) {
    elem.style.display = 'none';
};


eui.calendar = function (o) {
    var calendarWidget = CalendarWidget;
    calendarWidget.initialize(o);
};

})();


(function () {
    eui.addHandler(window, 'load', function () {
        eui.calendar({
            startYear: 1900,
            input: document.getElementById('dateSelect')
        });
    });
})();


window.onload = function() {
    var turnDate = document.getElementById("turnDate");
    var dateSelect = document.getElementById("dateSelect");
    var eui_calendar = document.getElementsByClassName("eui-calendar")[0];
    var dateList = document.getElementById("dateList");
    var lo = 100; // 第一个显示日期块距离左侧距离
    var sideK1 = document.getElementById("sideK1");
    var sideK2 = document.getElementById("sideK2");
    var sideK3 = document.getElementById("sideK3");
    var sideK4 = document.getElementById("sideK4");
    var sideK5 = document.getElementById("sideK5");
    var sideK6 = document.getElementById("sideK6");
    var sideK7 = document.getElementById("sideK7");
    var middleBar = document.getElementById("middleBar");
    var button1 = document.getElementById("button1");
    var mengban1 = document.getElementById("mengban1");
    var button2 = document.getElementById("button2");
    var mengban2 = document.getElementById("mengban2");
    var button3 = document.getElementById("button3");
    var mengban3 = document.getElementById("mengban3");
    var button4 = document.getElementById("button4");
    var mengban4 = document.getElementById("mengban4");
    var allSecond = document.getElementById("allSecond");
    var rightTip = document.getElementById("rightTip");
    var tag = 0;
    var middleKuai = [];
    var middleKuaiTag = [];
    var urlValue = document.getElementById("urlValue");
    var passwdValue = document.getElementById("passwdValue");
    var feedback = document.getElementById("feedback");
    var zhebi = document.getElementById("zhebi");
    var xiangmuTitle =  document.getElementById("xiangmuTitle");

    turnDate.onclick = function() {
        this.style.display = 'none';
        eui_calendar.style.display = 'none';
        dateSelect.style.backgroundImage = "url(./imgs/selectTimeicon.png)";
        dateSelect.style.zIndex = "1";

        $('#rightTip').hide();

        // 上面的日期条的显示
        for(var i = 0; i < oList.length; i++) {
            dateList.innerHTML = dateList.innerHTML + '<span class="dateLine">'+ oList[i] +'</span>';
        }
        xiangmuName.style.display = "none";

        // 显示7行块
        middleBar.style.width = oList.length * 73 + 'px';
        for (var i = 0; i < 7*oList.length; i++) {
            middleBar.innerHTML += '<span class="middleKuai" id="'+ i +'" style="background-color: rgb(214, 244, 203);"></span>';
        }

        
        middleKuai = document.getElementsByClassName("middleKuai");
        
        
        allSecond.style.display = "block";

        tag = 1;


        // 变色
        for (var i = 0; i < middleKuai.length; i++) {
            middleKuai[i].onclick = function() {
                //alert(this.style.backgroundColor);
                if(this.style.backgroundColor == "rgb(214, 244, 203)") {
                    this.style.backgroundColor = "#69D9BE";
                } else {
                   this.style.backgroundColor = "rgb(214,244,203)";
                }
            }
        }

        // 控制添加行
        button1.onclick = function() {
            mengban1.style.display = "none";
            this.style.display = "none";
            button2.style.display = "block";
        }
        button2.onclick = function() {
            mengban2.style.display = "none";
            this.style.display = "none";
            button3.style.display = "block";
        }
        button3.onclick = function() {
            mengban3.style.display = "none";
            this.style.display = "none";
            button4.style.display = "block";
        }
        button4.onclick = function() {
            mengban4.style.display = "none";
            this.style.display = "none";
        }

        fasongBtn.onclick = function() {
            var middleKuai = document.getElementsByClassName("middleKuai");

            var sideKuai = document.getElementsByClassName("sideKuai");

            //alert(oList); // 1


            var time = [];
            for (var i = 0; i <sideKuai.length; i++) {
                if(sideKuai[i].value != "") {
                    time.push(sideKuai[i].value);
                }
            }
            
            //alert(time); //2

            for(var i=0; i<middleKuai.length; i++) {
                if(middleKuai[i].style.backgroundColor == "rgb(105, 217, 190)") {
                    middleKuaiTag.push(0);
                } else {
                    middleKuaiTag.push(1);
                }
            }

            var finalMiddleKuai = [];
            for(var i = 0; i < oList.length*time.length; i++) {
                finalMiddleKuai.push(middleKuaiTag[i]);
            }
            //alert(finalMiddleKuai);//3

            var twoDimentionalA = [];
            for(var i = 0; i < time.length; i++) {
                var a=[];
                for(var j = 0; j < oList.length; j++) {
                    a.push(finalMiddleKuai[oList.length*i+j]);
                    //twoDimentionalA[i][j].push(finalMiddleKuai[oList.length*i+j]);
                }
                twoDimentionalA.push(a);
            }

            console.log(oList);
            console.log(twoDimentionalA);

            //alert(twoDimentionalA); //4
            //alert(xiangmuTitle.value); //5
            var json = {
                "name": xiangmuTitle.value,
                "date": oList,
                "time": time,
                "t_f": twoDimentionalA
            }
            var p = JSON.stringify(json);
            $.post(
                "http://www.baidu.com",p, function() {}
            );

            
            var url = "http://www.xiaoxi.com";
            var passwd = "056515";


            zhebi.style.display = "block";
            feedback.style.display = "block";
            urlValue.innerHTML = url;
            passwdValue.innerHTML = passwd;
        }
    }

    dateSelect.onclick = function() {
        turnDate.style.display = "block";
        xiangmuName.style.display = "block";
    }
}