(function ($) {  

  $(function(){
    $(document).foundationAlerts();
    $(document).foundationButtons();
    $(document).foundationAccordion();
    $(document).foundationNavigation();
    $(document).foundationCustomForms();
    $(document).foundationMediaQueryViewer();
    $(document).foundationTabs({callback:$.foundation.customForms.appendCustomMarkup});
    
    $(document).tooltips();
    $('input, textarea').placeholder();

    $('#simple1Tab').click(function hide() {
      $(this)
        .off('click')
        .animate({opacity: 0}, function() {
          $(this)
            .text('Now you don\'t!')
            .click(function show() {
              $(this)
                .text('Now you see it...')
                .off('click')
                .animate({opacity: 1}, function() {
                  $(this)
                    .click(hide);
                });
            });
        });
    });
    
    // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
    // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
    // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
    // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
    // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});
  });
  
})(jQuery);