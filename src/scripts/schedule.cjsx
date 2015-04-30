Schedule = React.createClass
  statics:
    generateSql: (climate, types, month) ->
      filters = []

      if types.length == 0
        # If no types selected, no rows returned
        filters = ['1 = 0']
      else if types.length == config.references.types.length
        # If all types selected, all rows returned (no filter)
      else
        # Filter one or the other type
        filters = _.map types, (type) ->
          'Type = \'' + type + '\''

      filters.push('Climate = \'' + climate + '\'')
      filters.push(month + ' NOT EQUAL TO \'\'')

      'select Name, ' + month + ', Type FROM ' + config.services.google.tables.schedule +
        ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name'

    doFetchData: (climate, types, month, done) ->
      $.ajax
        dataType: 'json'
        url: 'https://www.googleapis.com/fusiontables/v1/query'
        data:
          sql: Schedule.generateSql(climate, types, month)
          key: config.services.google.apiKey
      .done (scheduleResponse) =>
        if scheduleResponse?
          $.ajax
            dataType: 'json'
            url: 'https://www.googleapis.com/fusiontables/v1/query'
            data:
              sql: 'select Name, Wikipedia FROM ' + config.services.google.tables.plants + ' ORDER BY Name'
              key: config.services.google.apiKey
          .done (plantsResponse) ->
              if plantsResponse?
                done null,
                  plants: plantsResponse.rows
                  schedule: scheduleResponse.rows

  componentWillMount: ->
    @fetchData()
    null

  componentDidUpdate: ->
    if window?
      if @state.fetching
        @state.spinner = new window.Spinner().spin(document.getElementById('plants'))
      else
        if @state.spinner
          @state.spinner.stop()
          @state.spinner = null
    null

  componentWillUnmount: ->
    if @state.spinner
      @state.spinner.stop()
    null

  getInitialState: ->
    today = new Date()
    defaultTypes = _.map config.references.types, (type) -> type.title

    types: if store? then store.get('types', defaultTypes) else defaultTypes
    climate: if store? then store.get('climate', 'Dry Summer - Wet Winter') else 'Dry Summer - Wet Winter'
    month: config.references.months[today.getMonth()]
    fetching: true
    plants: []
    schedule: []
    spinner: null

  handleTypeClick: (type) ->
    =>
      pos = @state.types.indexOf(type)
      if pos == -1
        @state.types.push(type)
      else
        # You can't disable all types
        # Do nothing if there is only one left
        return false if @state.types.length == 1

        @state.types.splice(pos, 1)

      store('types', @state.types)
      @fetchData()
      false

  handleMonthClick: (month) ->
    =>
      @state.month = month
      @fetchData()
      false

  fetchData: ->
    @setState({ fetching: true })

    Schedule.doFetchData @state.climate, @state.types, @state.month, (err, data) =>
      data.fetching = false
      @setState data

  getGlyphiconByType: (title) ->
    _.find(config.references.types, (type) -> type.title == title).icon

  render: ->
    types = _.map config.references.types, (type) =>
      pos = @state.types.indexOf(type.title)
      active = pos != -1
      <button key={type.title} type="button" onClick={@handleTypeClick(type.title)} className={'btn btn-default' + (if active then ' active' else '')}><span className={'glyphicon glyphicon-' + type.icon}></span><span className="type">{type.title}</span></button>

    months = config.references.months.map (month) =>
      active = month == @state.month
      <button key={month} type="button" ref="button" onClick={@handleMonthClick(month)} className={'col-xs-2 col-md-1 btn btn-default' + (if active then ' active' else '')}>{{ month }}</button>

    if @state.fetching
      plants = ''
    else
      plants = _.map @state.schedule, (schedule) =>
        name = schedule[0]
        plant = _.find @state.plants, (plant) -> plant[0] == name
        wikipedia = if plant then plant[1] else null

        <li key={schedule[0]} className="list-group-item">
          {if wikipedia then <a target="_blank" className="wikipedia" href={wikipedia}>
          <span className="glyphicon glyphicon-info-sign pull-right"></span></a>}
          <span className="instruction pull-right">{config.references.instructions[schedule[1]]}</span>
          <span className={'glyphicon glyphicon-' + @getGlyphiconByType(schedule[2])} aria-hidden="true"></span>
          {schedule[0]}
        </li>

    <div>
      <div className="page-header">
          <div className="container">
              <h2>{ @state.climate }</h2>
              <div id="types" className="btn-group" role="toolbar" aria-label="plant types">
                  {types}
              </div>
          </div>
      </div>

      <div className="container">
          <div className="months row">{months}</div>
          <ul id="plants" className="list-group">{plants}</ul>
      </div>
    </div>
