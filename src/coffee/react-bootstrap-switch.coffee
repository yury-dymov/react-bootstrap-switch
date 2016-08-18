React = require('react')
findDOMNode = require('react-dom').findDOMNode

module.exports = React.createClass
  defaults:
    state: true
    size: null
    animate: true
    disabled: false
    readonly: false
    indeterminate: false
    inverse: false
    onColor: "primary"
    offColor: "default"
    onText: "ON"
    offText: "OFF"
    labelText: " "
    handleWidth: "auto"
    labelWidth: "auto"
    baseClass: "bootstrap-switch"
    wrapperClass: "wrapper"

  # treating this as a constructor..
  getInitialState: ->
    state: @_prop('state')
    handleWidth: @_prop('handleWidth')
    labelWidth: @_prop('labelWidth')
    offset: if @_prop('state') == false then (-@_prop('labelWidth') || 0) else 0
    skipAnimation: true
    dragStart: false
    focus: false
    disabled: @_prop('disabled')
    readonly: @_prop('readonly')
    indeterminate: @_prop('indeterminate')

  componentWillReceiveProps: (nextProps) ->
    this.disabled(!!nextProps.disabled)
    this.value(nextProps.state, nextProps, true)

  _prop: (key) ->
    if typeof @props[key] == 'undefined'
      @defaults[key]
    else
      @props[key]

  value: (val, nextProps = {}, skipAnimation = false) ->
    disabled = if typeof nextProps.disabled is "undefined" then @state.disabled else nextProps.disabled
    readonly = if typeof nextProps.readonly is "undefined" then @state.readonly else nextProps.readonly

    return @state.state  if typeof val is "undefined"
    return @  if disabled or readonly

    return @ if @state.state == val

    # remove indeterminate
    @_changeState not not val, skipAnimation
    @

  valueState: (val) ->
    return @value(val)

  toggleState: ->
    return @toggleValue()

  toggleValue: ->
    return @  if @state.disabled or @state.readonly

    if @state.indeterminate
      @_changeState true
    else
      @_changeState not @state.state

  disabled: (value) ->
    return @state.disabled  if typeof value is "undefined"

    value = not not value
    return @  if value is @state.disabled

    @toggleDisabled()

  toggleDisabled: ->
    @setState
      disabled: not @state.disabled
    @

  readonly: (value) ->
    return @state.readonly  if typeof value is "undefined"

    value = not not value
    return @  if value is @state.readonly

    @toggleReadonly()

  toggleReadonly: ->
    @setState
      readonly: not @state.readonly
    @

  handleWidth: (value) ->
    return @state.handleWidth  if typeof value is "undefined"

    @setState
      handleWidth: value, =>
        @_width()
        @_containerPosition()
    @


  labelWidth: (value) ->
    return @state.labelWidth  if typeof value is "undefined"

    @setState
      labelWidth: value, =>
        @_width()
        @_containerPosition()
    @

  _fireStateChange: ->
    return if typeof @props.onChange == "undefined"
    return @props.onChange(this, @state.state) if(@props.onChange.length >= 2)
    @props.onChange(@state.state)

  _changeState: (state, skipAnimation = false) ->
    @setState
      indeterminate: false
      state:state, =>
        @_containerPosition(state.state, skipAnimation)
        @_fireStateChange()

  _handleToggle: (event, value) ->
    event.preventDefault()
    event.stopPropagation()

    return  if @state.disabled or @state.readonly

    @_changeState value
    @_handleElementFocus


  _handleOnClick: (event) ->
    @_handleToggle event, false

  _handleOffClick: (event) ->
    @_handleToggle event, true

  componentDidMount: ->
    init = =>
      @_width => @_containerPosition null, true

    wrapperVisible = =>
      elem = findDOMNode(@_wrapper)
      elem.offsetWidth > 0 && elem.offsetHeight > 0

    if wrapperVisible()
      init()
    else
      initInterval = window.setInterval ->
        if wrapperVisible()
          init()
          window.clearInterval initInterval
      , 50

  _width: (callback) ->
    onWidth   = findDOMNode(@_on).offsetWidth
    offWidth  = findDOMNode(@_off).offsetWidth
    width     = Math.max(onWidth, offWidth)

    @setState
      handleWidth: width
      labelWidth: width, callback


  _containerPosition: (state = @state.state, skipAnimation = false) ->
    values = [0, "-#{@state.handleWidth}px"]

    if @state.indeterminate
      return @setState
        skipAnimation: skipAnimation
        offset: "-#{@state.handleWidth / 2}px"
    else if state
      @setState
        skipAnimation: skipAnimation
        offset: if @_prop('inverse') then values[1] else values[0]
    else
      @setState
        skipAnimation: skipAnimation
        offset: if @_prop('inverse') then values[0] else values[1]

  _handleElementChange: (e) =>
    e.preventDefault()
    e.stopImmediatePropagation()

    @_changeState not @state.state

  _handleElementFocus: (e) =>
    if e
      e.preventDefault()
    @setState
      focus: true

  _handleElementBlur: (e) =>
    e.preventDefault()
    @setState
      focus: false

  _handleElementKeyDown: (e) =>
    return  if not e.which or @state.disabled or @state.readonly

    switch e.which
      when 37
        e.preventDefault()
        e.stopImmediatePropagation()

        @_changeState false
      when 39
        e.preventDefault()
        e.stopImmediatePropagation()

        @_changeState true


  _handleLabelClick: (e) ->
    e.stopPropagation()

  _handleLabelMouseDown: (e) ->
    return  if @state.dragStart or @state.disabled or @state.readonly

    e.preventDefault()
    e.stopPropagation()

    @setState
      indeterminate: false
      dragStart: (e.pageX or e.nativeEvent.touches[0].pageX) - parseInt @state.offset, 10
    @_handleElementFocus

  _handleLabelTouchStart: (e) ->
    @_handleLabelMouseDown e

  _handleLabelMouseMove: (e) ->
    return  unless @state.dragStart?

    e.preventDefault()

    difference = (e.pageX or e.nativeEvent.touches[0].pageX) - @state.dragStart
    return  if difference < -@state.handleWidth or difference > 0

    @setState
      skipAnimation: false
      offset: "#{difference}px"
      dragged: true

  _handleLabelTouchMove: (e) ->
    @_handleLabelMouseMove(e)

  _handleLabelMouseUp: (e) ->
    return  unless @state.dragStart

    e.preventDefault()

    state = not @state.state

    if @state.dragged
      difference = parseInt @state.offset
      state = difference > -(@state.handleWidth / 2)
      state = if @_prop('inverse') then not state else state

    @setState
      dragStart: false
      dragged: false
      state: state, =>
        @_containerPosition()
        @_fireStateChange()

  _handleLabelTouchEnd: (e) ->
    @_handleLabelMouseUp(e)

  _handleLabelMouseLeave: (e) ->
    @_handleLabelMouseUp(e)


  render: ->
    wrapperClass = do =>
      classes = ["#{@_prop('baseClass')}"].concat @_prop('wrapperClass')

      classes.push if @state.state then "#{@_prop('baseClass')}-on" else "#{@_prop('baseClass')}-off"
      classes.push "#{@_prop('baseClass')}-#{@_prop('size')}" if @_prop('size')?
      classes.push "#{@_prop('baseClass')}-disabled" if @state.disabled
      classes.push "#{@_prop('baseClass')}-readonly" if @state.readonly
      classes.push "#{@_prop('baseClass')}-indeterminate" if @state.indeterminate
      classes.push "#{@_prop('baseClass')}-inverse" if @_prop('inverse')
      classes.push "#{@_prop('baseClass')}-id-#{@_prop('id')}" if @_prop('id')
      classes.push "#{@_prop('baseClass')}-animate" if @_prop('animate') and !@state.dragStart and !@state.skipAnimation
      classes.push "#{@_prop('baseClass')}-focused" if @state.focus
      classes.join " "


    onElm = <span ref={(c) => @_on = c} style={{ width: @state.handleWidth }} onClick={@_handleOnClick} className={"#{@_prop('baseClass')}-handle-on #{@_prop('baseClass')}-#{@_prop('onColor')}"}>{@_prop('onText')}</span>
    label = <span className={"#{@_prop('baseClass')}-label"} style={{width:@state.labelWidth}} ref={(c) => @_label = c} onClick={@_handleLabelClick} onMouseDown={@_handleLabelMouseDown} onTouchStart={@_handleLabelTouchStart} onMouseMove={@_handleLabelMouseMove} onTouchMove={@_handleLabelTouchMove} onMouseUp={@_handleLabelMouseUp} onMouseLeave={@_handleLabelMouseLeave} onTouchEnd={@_handleLabelTouchEnd}>{ @_prop('labelText') }</span>
    offElm = <span ref={(c) => @_off = c} style={{ width: @state.handleWidth }} onClick={@_handleOffClick} className={"#{@_prop('baseClass')}-handle-off #{@_prop('baseClass')}-#{@_prop('offColor')}"}>{@_prop('offText')}</span>
    containerWidth = @state.labelWidth+@state.handleWidth*2
    wrapperWidth = @state.labelWidth+@state.handleWidth
    if(containerWidth == wrapperWidth)
      containerWidth = wrapperWidth = "auto"

    return (
      <div className={ wrapperClass } ref={(c) => @_wrapper = c} style={{width:wrapperWidth}} title={if !@state.state then @_prop('titleOn') else @_prop('titleOff')}>
        <div className={ "#{@_prop('baseClass')}-container" } ref={(c) => @_container = c} style={{width:containerWidth, marginLeft:@state.offset}}>
          {if @_prop('inverse') then offElm else onElm}
          {label}
          {if @_prop('inverse') then onElm else offElm}
          <input type='checkbox' onChange={@_handleElementChange} onFocus={@_handleElementFocus} onBlur={@_handleElementBlur} onKeyDown={@_handleElementKeyDown} />
        </div>
      </div>
    )