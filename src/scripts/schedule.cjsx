Schedule = React.createClass
  statics:
    generateSql: (climate, types, month) ->
      filters = []

      if types.length == 0
        # If no types selected, no rows returned
        filters = ['1 = 0']
      else if types.length == config.types.length
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
    if @state.fetching
      @state.spinner = new Spinner().spin($('#plants').get(0))
    else
      @state.spinner.stop() if @state.spinner?
      @state.spinner = null
    null

  componentWillUnmount: ->
    @state.spinner.stop() if @state.spinner?
    null

  getInitialState: ->
    today = new Date()
    defaultTypes = _.map config.types, (type) -> type.title

    types: if store? then store.get('types', defaultTypes) else defaultTypes
    climate: if store? then store.get('climate', 'Dry Summer - Wet Winter') else 'Dry Summer - Wet Winter'
    month: config.months[today.getMonth()]
    fetching: true
    plants: []
    schedule: []
    spinner: null

  handleTypeClick: (type) ->
    (e) =>
      e.preventDefault()

      pos = @state.types.indexOf(type)
      if pos == -1
        @state.types.push(type)
      else
        # You can't disable all types
        # Do nothing if there is only one left
        return if @state.types.length == 1

        @state.types.splice(pos, 1)

      store.set('types', @state.types)
      @fetchData()
      null

  handleMonthClick: (month) ->
    (e) =>
      e.preventDefault()
      @state.month = month
      @fetchData()
      null

  fetchData: ->
    @setState({ fetching: true })

    Schedule.doFetchData @state.climate, @state.types, @state.month, (err, data) =>
      data.fetching = false
      @setState data

  getGlyphiconByType: (title) ->
    _.find(config.types, (type) -> type.title == title).icon

  renderTypes: ->
    _.map config.types, (type) =>
      pos = @state.types.indexOf(type.title)
      active = pos != -1
      <button key={type.title} type="button"
        onClick={@handleTypeClick(type.title)}
        className={'btn btn-default' + (if active then ' active' else '')}>
        <span className={'glyphicon glyphicon-' + type.icon}></span>
        <span className="type">{type.title}</span>
      </button>

  renderMonths: ->
    _.map config.months, (month) =>
      active = month == @state.month
      <button key={month} type="button"
        onClick={@handleMonthClick(month)}
        className={'col-xs-4 col-md-1 btn btn-default' + (if active then ' active' else '')}>
        {{ month }}
      </button>

  renderPlants: ->
    if @state.fetching
      ''
    else
      _.map @state.schedule, (schedule) =>
        [ schedulePlant, instruction, type ] = schedule
        plant = _.find @state.plants, (plant) -> plant[0] == schedulePlant

        if plant?
          [ ..., wikipedia ] = plant

          <li key={schedulePlant} className="list-group-item">
            {if wikipedia then <a target="_blank" className="wikipedia" href={wikipedia}>
            <span className="glyphicon glyphicon-info-sign pull-right"></span></a> else ''}
            <span className="instruction pull-right">{config.instructions[instruction]}</span>
            <span className={'glyphicon glyphicon-' + @getGlyphiconByType(type)} aria-hidden="true"></span>
            {schedulePlant}
          </li>
        else
          ''

  render: ->
    <div>
      <div className="page-header">
        <div className="container">
          <h2>{ @state.climate }</h2>
          <div id="types" className="btn-group" role="toolbar" aria-label="plant types">
            { @renderTypes() }
          </div>
        </div>
      </div>

      <div className="months container">
        <div className="btn-group btn-group-lg">{ @renderMonths() }</div>
      </div>

      <div className="container">
        <ul id="plants" className="list-group">{ @renderPlants() }</ul>
      </div>
    </div>
