function CX3TripItemWidget() {
  Widget.call(this);

  evt_ = 0;
  param_ = 0;
  inUse_ = false;

  // Create the DOM element for this widget:
  this.ui.addClass("cx3-trip-item");

  this.addEvent("cx3-keypress", this.OnEventKeypadPush);
}
// CX3TripItemWidget is a subclass of Widget:
CX3TripItemWidget.inheritsFrom(Widget);


CX3TripItemWidget.prototype.Clear = function() {
  this.fieldName.innerText = "";
  this.fieldName.textContent = "";
  this.value.innerText = "";
  this.value.textContent = "";
  this.evt_ = this.param_ = 0;
  this.inUse_ = false;
}

CX3TripItemWidget.prototype.IsInUse = function() {
  return this.inUse_;
}

////////////////////////////////////////////////////////////////////////////////
///  @brief
///    Set the text to be shown and event info to be communicated when the 
///    item is clicked.
///
///  @param [in] <text> <text to show for new list item>
///
///  @param [in] <evt> <event to post when item is 'clicked'>
///
///  @param [in] <param> <parameter to pass with specified event>
///
////////////////////////////////////////////////////////////////////////////////
CX3TripItemWidget.prototype.Set = function(name_text, status_text, evt, param, flags) {
  // Remove old data
  this.Clear();

  // Check for non-selectable item & set 'read-only' text colors
  if (flags & WIDGET_FLAG.CX3_NON_SELECTABLE) {
    this.ui.addClass("non-selectable");
  }
  else {
    this.ui.removeClass("non-selectable");
  }
  // set field name position
  // Get get y coordinates to set proper location/size for variable or item
  // Check flags to set location 
  
  if (flags & WIDGET_FLAG.CX3_INDENT_LEFT) {
    this.fieldName.removeClass("trip-field-left");
  }
  else if (flags & WIDGET_FLAG.CX3_TIMER_ITEM) {
    this.fieldName.addClass("trip-field-left");
  }
  else {
    this.fieldName.addClass("trip-field-left");
  }

  // set status text size (default small text) & position
  if (flags & WIDGET_FLAG.CX3_DISPLAY_UNIT_AS_VALUE) {
    this.value.removeClass("small-font");
  }
  else {
    this.value.addClass("small-font");
  }
  // TODO: is this needed?
/*
  if (flags & CX3_TIMER_ITEM) {
    loc.Left = TRIP_STATUS_CLK_L;
    //loc.Right = NAME_POS_RIGHT;
  }
  else {
    loc.Left = TRIP_STATUS_LEFT;
    //loc.Right = TRIP_FIELD_RIGHT;
  }
  value_.Resize(loc);
*/

  // set text
  this.fieldName.innerText = name_text;
  this.fieldName.textContent = name_text;
  this.value.innerText = status_text;
  this.value.textContent = status_text;

  // Set event data
  this.evt_ = evt;
  this.param_ = param;

  // This item now in use.
  this.inUse_ = true;
}

////////////////////////////////////////////////////////////////////////////////
///  @brief  
///    Process keypress.  If this is the 'enter' key, send the event up to
///    the parent for processing.
///
///  @param [in] <Event> <key data>
///
///  @return <always returns 0 (1 causes Prism to terminate)>
///
////////////////////////////////////////////////////////////////////////////////
CX3TripItemWidget.prototype.OnEventKeypadPush = function(Event) { 
  // always pass system events to base class 
  //Pm_Widget::OnEventKeypadPush(Event);        

  // make sure this is a key that we care about
  if (Event["keyName"] == CONST.CX3_KEY.ENTER) {
    // pass event up to parent
    this.owner.post(this.evt_, {target: this, param: this.param_});
    Event["handled"] = true;
    /*
    pm_event_t NewEvent(evt_);
    NewEvent.pSource = this;
    NewEvent.Param = param_;
    NewEvent.pTarget = Parent();
    EventManager().PostTail(NewEvent);
    */
  }  

  return 0; 
}
