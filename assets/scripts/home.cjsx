'use strict'

window.jQuery(document).ready ($) ->
  googleApiKey = window.googleApiKey
  store = window.store
  _ = window._
  data = window.data
  React = window.React

  Schedule = React.createClass
    componentDidMount: ->
      this.fetchData()
      null

    componentDidUpdate: ->
      if this.state.fetching
        this.state.spinner = new window.Spinner().spin(document.getElementById('plants'))
      else
        if this.state.spinner
          this.state.spinner.stop()
          this.state.spinner = null
      null

    componentWillUnmount: ->
      if this.state.spinner
        this.state.spinner.stop()
      null

    getInitialState: ->
      today = new Date()

      types: store.get('types', _.clone(data.types))
      climate: store.get('climate', 'Dry Summer - Wet Winter')
      month: data.months[today.getMonth()]
      fetching: true
      plants: []
      schedule: []
      spinner: null

    handleTypeClick: (type) ->
      =>
        pos = this.state.types.indexOf(type)
        if pos == -1
          this.state.types.push(type)
        else
          # You can't disable all types
          # Do nothing if there is only one left
          return false if this.state.types.length == 1

          this.state.types.splice(pos, 1)

        store('types', this.state.types)
        this.fetchData()
        false

    handleMonthClick: (month) ->
      =>
        this.state.month = month
        this.fetchData()
        false

    generateSql: ->
      filters = []

      if this.state.types.length == 0
        # If no types selected, no rows returned
        filters = ['1 = 0']
      else if this.state.types.length == data.types.length
        # If all types selected, all rows returned (no filter)
      else
        # Filter one or the other type
        filters = _.map this.state.types, (type) ->
          'Type = \'' + type + '\''

      filters.push('Climate = \'' + this.state.climate + '\'')
      filters.push(this.state.month + ' NOT EQUAL TO \'\'')

      'select Name, ' + this.state.month + ', Type FROM ' + data.tables.schedule +
        ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name'

    fetchData: ->
      this.setState({ fetching: true })

      $.getJSON 'https://www.googleapis.com/fusiontables/v1/query',
        sql: this.generateSql(),
        key: googleApiKey
      , (scheduleResponse) =>
        $.getJSON 'https://www.googleapis.com/fusiontables/v1/query',
          sql: 'select Name, Wikipedia FROM ' + data.tables.plants +
            ' ORDER BY Name',
          key: googleApiKey
        , (plantsResponse) =>
          this.setState
            fetching: false,
            schedule: scheduleResponse.rows,
            plants: plantsResponse.rows

    render: ->
      types = _.map data.glyphicons, (icon, name) =>
        pos = this.state.types.indexOf(name)
        active = pos != -1
        <button key={name} type="button" onClick={this.handleTypeClick(name)} className={'btn btn-default' + (if active then ' active' else '')}><span className={'glyphicon glyphicon-' + icon}></span><span className="type">{name}</span></button>

      months = data.months.map (month) =>
        active = month == this.state.month
        <button key={month} type="button" ref="button" onClick={this.handleMonthClick(month)} className={'col-xs-2 col-md-1 btn btn-default' + (if active then ' active' else '')}>{{ month }}</button>

      if this.state.fetching
        plants = ''
      else
        plants = _.map this.state.schedule, (schedule) =>
          name = schedule[0]
          plant = _.find this.state.plants, (plant) -> plant[0] == name
          wikipedia = if plant then plant[1] else null

          <li key={schedule[0]} className="list-group-item">
            {if wikipedia then <a target="_blank" className="wikipedia" href={wikipedia}>
            <span className="glyphicon glyphicon-info-sign pull-right"></span></a>}
            <span className="instruction pull-right">{data.instructions[schedule[1]]}</span>
            <span className={'glyphicon glyphicon-' + data.glyphicons[schedule[2]]} aria-hidden="true"></span>
            {schedule[0]}
          </li>

      <div>
        <div className="page-header">
            <div className="container">
                <h2>{ this.state.climate }</h2>
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

  React.render <Schedule />, document.getElementById('schedule')
