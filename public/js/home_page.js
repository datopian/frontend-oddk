$('.home-org-button').on('click', (e) => {
    $('#datavejviser-group-text').css('color', '#414142')
    $('#datavejviser-group-text').css('background-color', '#E3E3E3')
    $('.home-groups-container').css('display', 'none')
    $('#datavejviser-org-text').css('color', '#B3B3B3')
    $('#datavejviser-org-text').css('background-color', '#4e4e4f')
    $('.home-orgs-container').css('display', 'block')
})

$('.home-group-button').on('click', (e) => {
    $('#datavejviser-org-text').css('color', '#414142')
    $('#datavejviser-org-text').css('background-color', '#E3E3E3')
    $('.home-orgs-container').css('display', 'none')
    $('#datavejviser-group-text').css('color', '#B3B3B3')
    $('#datavejviser-group-text').css('background-color', '#4e4e4f')
    $('.home-groups-container').css('display', 'block')
})

$(document).ready(function() {
    if (window.matchMedia('(max-width: 1365px)').matches) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/static/js/search.js';
        document.head.appendChild(script);
    }
})
