/* common-widget.js */
// document ready 상태에서 자동 실행.
$(function(){
  
  //===== event로 2글자 이상 될 때 값이 t를 넘어가면 삭제. 그렇지 않은 경우 다음 칸으로 이동.
  var checkMaxValue = function(e, t) {
    if ($(e.currentTarget).val().length == 2) {
      var val = parseInt($(e.currentTarget).val());
      if (val > t){
        $(e.currentTarget).val("");
      } else {
        nextInputFocus($(e.currentTarget));
      }
    }
  };
  
  //===== 다음 input으로 포커스 이동 target = $(e.currentTarget)
  var nextInputFocus = function(target){
    var a = target.next();
    if (a[0].tagName != 'INPUT') {
      a = a.next();
    }
    a.focus();
  };
  
  //===== 주민번호 두개의 text에 적을 때
  $("[data-type='ssn']").each(function() {
    // max length 처리. 

    $(this).find('[wgid="first"]').attr({
      'maxlength' : '6'
    }).bind('keyup', function(e) {
      if ($(e.currentTarget).val().length == 6) {
        nextInputFocus($(e.currentTarget));
      }
    });
    $(this).find('[wgid="second"]').attr({
      'maxlength' : '7'
    });

    // key입력시 숫자만 가능 (커스텀 validation 처리?)
    $(this).find('input').bind('keydown', function(e) {
      var k = e.which;
      if (!((k > 47 && k < 58) || (k > 95 && k < 106) || k == 8|| k == 9)) {
        e.preventDefault();
      } else if (e.shiftKey){
        e.preventDefault();
      }
    });
  });
  
  //===== 주민번호 한 text에 적을 때
  $("[data-type='ssnOne']").each(function() {
    // max length 처리. 
    $(this).find('input').attr({
      'maxlength' : '13'
    });

    // key입력시 숫자만 가능 (커스텀 validation 처리?)
    $(this).find('input').bind('keydown', function(e) {
      var k = e.which;
      if (!((k > 47 && k < 58) || (k > 95 && k < 106) || k == 8|| k == 9)) {
        e.preventDefault();
      } else if (e.shiftKey){
        e.preventDefault();
      }
    });
  });
  
  //===== YYYYMMDD select형 형태 날짜 입력
  $("[data-type='syyyymmdd']").each(function() {
    // 년도 넣기
    var select = $(this).find('[wgid="yyyy"]');
    if (select.length && select[0].tagName == 'SELECT'){
      for (var i=2013; i>1950; i--){
        select.append($('<option>').html(i));
      }
    }
    // 월 넣기
    var select = $(this).find('[wgid="mm"]');
    if (select.length && select[0].tagName == 'SELECT'){
      for (var i=1; i<13; i++){
        select.append($('<option>').html(i));
      }
    }
    // 일 넣기
    var select = $(this).find('[wgid="dd"]');
    if (select.length && select[0].tagName == 'SELECT'){
      for (var i=1; i<32; i++){
        select.append($('<option>').html(i));
      }
    }
  });

  //===== YYYYMMDD input형 형태 날짜 입력
  $("[data-type='iyyyymmdd']").each(function() {
    // YYYY
    var input = $(this).find('[wgid="yyyy"]');
    if (input.length && input[0].tagName == 'INPUT'){
      input.attr({
        'maxlength' : '4'
      }).bind('keyup', function(e) {//ex. 첫 번째 필드에서 4자리 텍스트 치면, 자동으로 다음으로 넘어감
        if ($(e.currentTarget).val().length == 4) {
          nextInputFocus($(e.currentTarget));
        }
      });
    }

    var input = $(this).find('[wgid="mm"]');
    if (input.length && input[0].tagName == 'INPUT'){
      input.attr({
        'maxlength' : '2'
      }).bind('keyup', function(e) {//ex. 첫 번째 필드에서 4자리 텍스트 치면, 자동으로 다음으로 넘어감
        checkMaxValue(e,12);
      });
    }

    var input = $(this).find('[wgid="dd"]');
    if (input.length && input[0].tagName == 'INPUT'){
      input.attr({
        'maxlength' : '2'
      }).bind('keyup', function(e) {//ex. 첫 번째 필드에서 4자리 텍스트 치면, 자동으로 다음으로 넘어감
        checkMaxValue(e,31);
      });
    }
    // key입력시 숫자만 가능 (커스텀 validation 처리?)
    $(this).find('input').bind('keydown', function(e) {
      var k = e.which;
      if (!((k > 47 && k < 58) || (k > 95 && k < 106) || k == 8|| k == 9)) {
        e.preventDefault();
      } else if (e.shiftKey){
        e.preventDefault();
      }
    });
  });
    
  //===== 코드 (대문자/소문자/숫자/-/_)
  $("[data-type='code']").each( function() {
    // key입력시 숫자만 가능 (커스텀 validation 처리?)
    $(this).find('input').bind('keydown', function(e) {
      var k = e.which;
      if (!((k > 47 && k < 58) || (k > 95 && k < 106) || k == 8|| k == 9)) {
        // 알파벳이나 bar가 아닌경우
        if (!((k > 64 && k < 91)||k==189)){
          e.preventDefault();
        } 
      } else if (e.shiftKey){
        e.preventDefault();
      }
    });
  });

  //===== 날짜 버튼 
  $("[data-type='dateButton']").each( function() {
    var txtInput = $(this).find('input').eq(0);
    // key입력시 숫자만 가능 (커스텀 validation 처리?)
    $(this).find('button').bind('singletap', function(e) {
        $(this).showDatePicker(function(date, dateStr){
          //set selected date to text input
          txtInput.val(dateStr);
        });
    });
  });
});
