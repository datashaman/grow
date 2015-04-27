'use strict';
window.jQuery(document).ready(function($) {
  var _, baseurl, initListGroup, refreshListGroup, store;
  _ = window._;
  baseurl = window.baseurl;
  store = window.store;
  refreshListGroup = function(tableView, input) {
    var value;
    $(tableView + ' .list-group-item').removeClass('active');
    value = $(input).val();
    if (value) {
      return _.find($(tableView + ' .list-group-item').get(), function(cell) {
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
    return $(tableView + ' .list-group-item').click(function() {
      $(input).val($(this).html());
      return refreshListGroup(tableView, input);
    });
  };
  initListGroup('#select-climate', '#climate', 'climate', 'Dry Summer - Wet Winter');
  return $('#settings').submit(function() {
    var elements, values;
    elements = $('#settings').serializeArray();
    values = _.zipObject(_.map(elements, function(element) {
      return [element.name, element.value];
    }));
    store(values);
    window.location.href = baseurl + '/';
    return false;
  });
});

//# sourceMappingURL=settings.js.map