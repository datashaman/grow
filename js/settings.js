function refreshListGroup(tableView, input) {
    $(tableView + ' .list-group-item').removeClass('active');

    var value = $(input).val();

    if(value) {
        _.find($(tableView + ' .list-group-item').get(), function(cell) {
            if($(cell).html() == value) {
                $(cell).addClass('active');
                return true;
            }
        });
    }
}

function initListGroup(tableView, input, key, def) {
    $(input).val(store.get(key, def));

    refreshListGroup(tableView, input);

    $(tableView + ' .list-group-item').click(function() {
        $(input).val($(this).html());
        refreshListGroup(tableView, input);
    });
}

jQuery(document).ready(function($) {
    initListGroup('#select-climate', '#climate', 'climate', 'Dry Summer - Wet Winter');

    $('#settings').submit(function() {
        var elements = $('#settings').serializeArray();
        var values = _.zipObject(_.map(elements, function(element) {
            return [ element.name, element.value ];
        }));
        store(values);
        window.location.href = baseurl + '/';
        return false;
    });
});
