
$(window).on("load", function (e) {
    $(".labeltitle").click(function () {
        $(this).addClass('uplabel');
    });
    $('input, textarea').focusout(function() {
        if ($(this).val().length > 0) {
            $(this).addClass('input');
        }else {
            $(this).removeClass('input');
        }
    });
    $('input, textarea').each(function(){ 
        if ($(this).val().length > 0) {
            $(this).addClass('input');
        }else {
            $(this).removeClass('input');
        }
    });

    $.validate({
        validateOnEvent: false,
        scrollToTopOnError : true
    });

})

function changeColor(type){
    $('#color'+type+' .selected').css({
        'border-bottom':'2px solid #002561',
        'font-size':'24px',
        'color':'#000'
    })
    $('#error'+type).hide()
    $('#label'+type).fadeIn()
}

function showChoice(type,status){
    if(status == 'show'){
        $("#"+type+"Fill").addClass('hidden')	
        $("#"+type+"Choice").removeClass('hidden')	
    }else{
        $("#"+type+"Fill").removeClass('hidden')	
        $("#"+type+"Choice").addClass('hidden')	
    }
}

function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function formatCurrency(input, blur) {
    let input_val = input.val();
  
    // don't validate empty input
    if (input_val === "") { return; }
  
    // original length
    let original_len = input_val.length;

    // initial caret position 
    let caret_pos = input.prop("selectionStart");
    
    // no decimal entered
    // add commas to number
    // remove all non-digits
    input_val = formatNumber(input_val);
    this.input_val = input_val;
    
    // // final formatting
    if (blur === "blur") {
      this.input_val = input_val;
    }
  
    // send updated string to input
    input.val(input_val);

    // put caret back in the right position
    let updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);
}


