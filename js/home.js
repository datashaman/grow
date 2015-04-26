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
    }, function(scheduleResponse) {
        $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
            sql: 'select Name, Wikipedia FROM ' + data.tables.plants + ' ORDER BY Name',
            key: google_api_key
        }, function(plantsResponse) {
            var plants = _.map(scheduleResponse.rows, function(schedule) {
                var name = schedule[0];
                var plant = _.find(plantsResponse.rows, function(plant) {
                    return plant[0] == name;
                });
                var wikipedia = plant ? plant[1] : null;

                return '<li class="list-group-item">' +
                    (wikipedia ? '<a target="_blank" class="wikipedia" href="' + wikipedia + '"><span class="glyphicon glyphicon-info-sign pull-right"></span></a>' : '') +
                    '<span class="instruction pull-right">' + data.instructions[schedule[1]] + '</span>' +
                    '<span class="glyphicon glyphicon-' + data.glyphicons[schedule[2]] + '" aria-hidden="true"></span>' +
                    schedule[0] +
                '</li>';
            }).join('');
            $('#plants').html(plants);
        });
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
