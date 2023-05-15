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
    if (window.matchMedia('(max-width: 1379px)').matches) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/static/js/search.js';
        document.head.appendChild(script);
    }
});

$(document).ready(function() {
    var tailWords = [
        translations['collaboration'],
        translations['research'],
        translations['innovation'],
        translations['testing']
    ];

    var tailIndex = 0;
    var parent = $('#home-tail').parent();
    parent.css('position', 'relative');

    var tailInterval = setInterval(() => {
        var updatedLastWord = tailWords[tailIndex];
        var spaces = '';
        var longestWord = tailWords.reduce((a, b) => a.length > b.length ? a : b, '');

        if (updatedLastWord.length < longestWord.length) {
            var spaces = '&nbsp;&nbsp;'.repeat((longestWord.length - updatedLastWord.length));
        }

        var updatedLastWord = updatedLastWord + spaces;
        var updatedSentence = ' <span class="red-word">' + updatedLastWord + '</span>';

        $('#home-tail').html(updatedSentence);

        tailIndex = (tailIndex + 1) % tailWords.length;
    }, 2300);
});
