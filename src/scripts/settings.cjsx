'use strict'

jQuery(document).ready ($) ->
  refreshListGroup = (tableView, input) ->
    $(tableView + ' .list-group-item').removeClass('active')

    value = $(input).val()

    if value
      _.find $(tableView + ' .list-group-item').get(), (cell) ->
        if $(cell).html() == value
          $(cell).addClass('active')
          return true

  initListGroup = (tableView, input, key, def) ->
    $(input).val(store.get(key, def))

    refreshListGroup(tableView, input)

    $(tableView + ' .list-group-item').click ->
      $(input).val($(this).html())
      refreshListGroup(tableView, input)

  initListGroup('#select-climate', '#climate', 'climate', 'Dry Summer - Wet Winter')

  $('#settings').submit (e) ->
    e.preventDefault()

    elements = $('#settings').serializeArray()
    values = _.zipObject _.map elements, (element) -> [element.name, element.value]
    store(values)
    window.location.href = config.site.baseurl + '/'

    null
