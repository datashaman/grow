var glyphicons = {
    'Herb': 'leaf',
    'Fruit / Vegetable': 'cutlery'
};

var instructions = {
    'P': 'Plant / Sow',
    'ST': 'Seed Tray',
    'TS': 'Transplant Seedlings'
};

function refreshDisplay() {
    var buttons = $('.months button').removeClass('active').get();
    _.find(buttons, function(button) {
        if($(button).html() == month) {
            $(button).addClass('active');
        }
    });

    var settings = store();
    $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
        sql: 'select Name, ' + month + ', Type FROM ' + settings.table_id + ' WHERE Climate = \'' + settings.climate + '\' AND ' + month + ' NOT EQUAL TO \'\' ORDER BY Name',
        key: settings.api_key
    }, function(data) {
        var plants = _.map(data.rows, function(row) {
            return '<li class="list-group-item">' +
                '<span class="pull-right">' + instructions[row[1]] + '</span>' +
                '<span class="glyphicon glyphicon-' + glyphicons[row[2]] + '" aria-hidden="true"></span>' +
                row[0] +
            '</li>';
        }).join('');
        $('#plants').html(plants);
    });
}

var month;

var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

jQuery(document).ready(function($) {
    if (typeof month == 'undefined') {
        var today = new Date();
        month = months[today.getMonth()];
    }

    $('.months button').click(function() {
        month = $(this).html();
        refreshDisplay();
    });

    refreshDisplay();
});
