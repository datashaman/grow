function refreshDisplay() {
    var buttons = $('.months button').removeClass('active').get();

    _.find(buttons, function(button) {
        if($(button).html() == month) {
            $(button).addClass('active');
            return true;
        }
    });

    var settings = store();

    $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
        sql: 'select Name, ' + month + ', Type FROM ' + data.tables.schedule + ' WHERE Climate = \'' + settings.climate + '\' AND ' + month + ' NOT EQUAL TO \'\' ORDER BY Name',
        key: google_api_key
    }, function(response) {
        var plants = _.map(response.rows, function(row) {
            return '<li class="list-group-item">' +
                '<span class="pull-right">' + data.instructions[row[1]] + '</span>' +
                '<span class="glyphicon glyphicon-' + data.glyphicons[row[2]] + '" aria-hidden="true"></span>' +
                row[0] +
            '</li>';
        }).join('');
        $('#plants').html(plants);
    });
}

var month;

jQuery(document).ready(function($) {
    if (typeof month == 'undefined') {
        var today = new Date();
        month = data.months[today.getMonth()];
    }

    $('.months button').click(function() {
        month = $(this).html();
        refreshDisplay();
    });

    $('.page-header .climate').html(store('climate')).removeClass('invisible');

    refreshDisplay();
});
