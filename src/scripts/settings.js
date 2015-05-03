'use strict';

r(function() {
  var initListGroup, refreshListGroup;

  refreshListGroup = function(tableView, input) {
    var value = $(input).val();
    $(tableView + ' .list-group-item').removeClass('active');
    if (value) {
      _.find($(tableView + ' .list-group-item').get(), function(cell) {
        if ($(cell).html() === value) {
          $(cell).addClass('active');
          return true;
        }
      });
    }
  };

  initListGroup = function(tableView, input, key, def) {
    $(input).val(store.get(key, def));
    refreshListGroup(tableView, input);
    $(tableView + ' .list-group-item').click(function() {
      $(input).val($(this).html());
      refreshListGroup(tableView, input);
    });
  };

  initListGroup('#select-climate', '#climate', 'climate', 'Dry Summer - Wet Winter');

  $('#settings').submit(function(e) {
    var elements, values;
    e.preventDefault();

    elements = $('#settings').serializeArray();

    values = _.zipObject(_.map(elements, function(element) {
      return [element.name, element.value];
    }));

    store(values);

    window.location.href = config.site.baseurl + '/';
  });
});
