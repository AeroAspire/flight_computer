/**
 * @file
 * Class for Application.
 */

//// @brief current function - used to update backlight and clock settings when main settings 
///  screen or backlight setting screen is active
CONST.FUNCTION_ID = {
  OTHER : 0,
  SETTINGS_MAIN : 1,
  SETTTINGS_BACKLIGHT : 2,
  END : 3
};

// these are the titles in the status bar
CONST.SID_FUNCTION = {
  E6B : "E6-B",
  TRIP : "TRIP",
  SETTINGS : "SETTINGS",
  CALCULATOR : "CALCULATOR",
  TIMER : "TIMER",
  MEMORY : "MEMORY",
  FAVORITE : "FAVORITE",
  WTBAL : "E6-B"
};

CONST.BACK_HISTORY_MAX = 8;
/*
 * Statics
 */
var LastSelectedEQListIndex = 0;
var LastSelectedTripListLeg = 0;
var LastSelectedSetting = 0;
var LastSelectedTimerIndex = 0;

/**
 * Description of class.
 * @ctor
 * Constructor
 * Constructor description.
 * @tparam type name description.
 */
function Application() {
  //_opt = (typeof _opt !== "undefined")? _opt : _other;
  EventHandler.call(this);
  // variables:

  // Load data:
  // TODO: load data.
  this.back_function = 0;
  this.last_back_function = 0;
  this.back_history = new Array(CONST.BACK_HISTORY_MAX);
  this.back_selected = new Array(CONST.BACK_HISTORY_MAX);
  this.back_focus = new Array(CONST.BACK_HISTORY_MAX);
  this.selected = 0;
  this.focus = 0;
  this.current_function = CONST.FUNCTION_ID.OTHER;
  this.currentFunctionPanel_ = undefined;
  this.lastFunctionPanel_ = undefined;
  
  for (i = 0; i < CONST.BACK_HISTORY_MAX; i++)
  {
    this.back_history[i] = 0;
    this.back_selected[i] = 0;
    this.back_focus[i] = 0;
  }

  // Create the panels:
  // Create the equation list panel:
  this.listScreen_ = new ListScreen();
  Screen.element.appendChild(this.listScreen_.ui);
  for (var i in CONST.equationScreens) {
    var title = CONST.equationScreens[i].title()
    
    this.listScreen_.addItem(CONST.equationScreens[i].title(), Application.EVENTS.EQLIST_ITEM_KEYPRESSED, i);
  }
  this.listScreen_.owner = this;

//TESTING
  this.listScreenWtBal_ = new ListScreen();
  Screen.element.appendChild(this.listScreenWtBal_.ui);
  for (var i in CONST.equationScreensWtBal) {
    var title = CONST.equationScreensWtBal[i].title()
    
    this.listScreenWtBal_.addItem(title, Application.EVENTS.EQLISTWTBAL_ITEM_KEYPRESSED, i);
  }
  this.listScreenWtBal_.owner = this;
//TESTING


  // Create the equation panel:
  this.eqScreen_ = new EquationScreen();
  Screen.element.appendChild(this.eqScreen_.ui);
  this.eqScreen_.owner = this;

  // Create the timer panel:
  this.timScreen_ = new TimerScreen();
  Screen.element.appendChild(this.timScreen_.ui);
  this.timScreen_.owner = this;

  // Create the trip planner panel:
  this.tripScreen_ = new TripPlannerScreen();
  Screen.element.appendChild(this.tripScreen_.ui);
  this.tripScreen_.owner = this;

  // Create the calculator panel:
  this.calcScreen_ = new CalculatorScreen();
  Screen.element.appendChild(this.calcScreen_.ui);
  this.calcScreen_.owner = this;

  // Create the memory panel:
  this.memScreen_ = new MemoryScreen();
  Screen.element.appendChild(this.memScreen_.ui);
  this.memScreen_.owner = this;

  // Set default backlight values (normal mode):
  SetScreenBrightness(CONST.BACKLIGHT_VALUE.MEDIUM);
  SetTouchBrightness(CONST.BACKLIGHT_VALUE.OFF);
  Backlight.setDefaultUnit(backlight_normal);

  // Add event listeners:
  this.addEvent(CX3_WIDGET_EVENT.TRIP_PLAN_LEG_SHOW, this.onEventTripLegShow);
  this.addEvent(CX3_WIDGET_EVENT.TRIP_PLAN_LEG_ADD, this.onEventTripLegAdd);
  this.addEvent(CX3_WIDGET_EVENT.TRIP_PLAN_LEG_REMOVE, this.onEventTripLegRemove);
  this.addEvent(CX3_WIDGET_EVENT.OPTION_SELECTED, this.onEventOptionSelected);
  this.addEvent(CX3_WIDGET_EVENT.SETTING_SELECTED, this.onEventSettingSelected);
  this.addEvent(CX3_WIDGET_EVENT.MEMORY_FUNCTION, this.onEventMemoryFunction);
  this.addEvent("cx3-keypress", this.onKeyPress);
}
// Application is a subclass of EventHandler:
Application.inheritsFrom(EventHandler);


// Event Handlers:
Application.EVENTS = {
  EQLIST_ITEM_KEYPRESSED : function(_details) {
    if (_details["keyName"] == CONST.CX3_KEY.ENTER) {
      if (DEBUG) {
        console.log("Equation list item clicked: " + this.param_);
      }
      // Load the equation screen:
      app.eqScreen_.SetEquation(CONST.equationScreens[this.param_]);

      // Change panels:
      app.activePanel = app.eqScreen_;
      
      // 'back' will return to equation list
      app.back_function = CONST.CX3_KEY.FLIGHT;

      // multi-step 'back' function
      app.back_focus[0] = LastSelectedEQListIndex;  // update list focus
      app._function = CONST.CX3_KEY.FLIGHT;
      app.selected = LastSelectedEQListIndex+1;    // function main screen
      app.focus = 0;
      app.storeBackFunction();
      // Signify that the event has been handled:
      _details["handled"] = true;
    }
  },
  EQLISTWTBAL_ITEM_KEYPRESSED : function(_details) {
    if (_details["keyName"] == CONST.CX3_KEY.ENTER) {
      if (DEBUG) {
        console.log("Equation list wt bal item clicked: " + this.param_);
      }
      // Load the equation screen:
      // TODO
      app.eqScreen_.SetEquation(CONST.equationScreensWtBal[this.param_]);

      // Change panels:
      app.activePanel = app.eqScreen_;
      
      
      _details["handled"] = true;
    }
  },
  MY_CLOCK_HANDLER : function(clock_time) {
    ClockUpdate.copyFromValue((clock_time.hours *60*60) + (clock_time.minutes * 60) + clock_time.seconds);
  }

};

var app;
Application.initialize = function() {
  if (DEBUG) {
    console.log("Application.initialize");
  }
  app = new Application();
  // Bind certain functions:
  app.uiKeyPressed = Application.prototype.uiKeyPressed.bind(app);
  ClockRegisterOnChange(Application.EVENTS.MY_CLOCK_HANDLER.bind(app));
  UserMemLoad();
  app.start();

  // Add the document event listeners:
  document.addEventListener("cx3-keypress", app.uiKeyPressed, false);
}


Application.prototype.start = function() {
  if (DEBUG) {
    console.log("Application.start");
  }

  // Load data:
  // TODO: load data.

  //Fake a Flight button press:
  var btn = {detail : {"keyName" : CONST.CX3_KEY.FLIGHT}};
  this.uiKeyPressed(btn);

  // Set the initial panel:
  //this.activePanel = this.listScreen_;
  Screen.activeElement = this.activePanel.children_[0].ui;

  // Enable events:
  Keyboard.enabled = true;
  
  // start the clock:
  clockTick();
}

/**
 * Stops the application.
 */
Application.prototype.stop = function() {
  // Disable events:
  Keyboard.enabled = false;

  // Remove the event listener:
  document.removeEventListener("cx3-keypress", app.keyPressed);

  // Save data:

}

/**
 * Handles DOM button presses by passing them to the correct active Widget.
 * @tparam CustomEvent _evt The cx3-keypress event data.
 */
Application.prototype.uiKeyPressed = function(_evt) {
  var details = { keyName : _evt.detail["keyName"] };
  // Is there an active panel?
  if (this.activePanel !== undefined) {
    // Does this panel have an active child?
    if (this.activePanel.activeChild !== undefined) {
      // Send this event to the active child:
      this.activePanel.activeChild.fire("cx3-keypress", details);
    }
    else {
      // No active child? Then send it to the panel:
      this.activePanel.fire("cx3-keypress", details);
    }
  }
  else {
    this.fire("cx3-keypress", details);
  }
}

/**
 * Handles DOM button presses by passing them to the correct active Widget.
 * @tparam CustomEvent _evt The cx3-keypress event data.
 */
Application.prototype.onKeyPress = function(_evt) {

  var back = false;
  var key = _evt.keyName;

  if (key == CONST.CX3_KEY.BACK) {
    // memory screen currently displayed - back to last function
    if (this.back_function == CONST.CX3_KEY.MEMORY) {
      // restore back function
      this.back_function = this.last_back_function;

      // restore last screen
      this.activePanel = this.lastFunctionPanel_;

      //restore last status bar function
      // NOTE by Dean: TODO is this needed?
      //statusBar_->SetLastFunction();
    }

    // Ignore back button if calculator is active
    else { //if(CalculatorActive == false) {
      // multi-function back function
      // settings screen - no multi-step back function for individual setting screens
      key = 0;
      if (this.back_function != CONST.CX3_KEY.SETTINGS) {
        key = this.recallBackFunction();
      }
      if (key != 0) {
        back = true;
      }
      else {
        if (this.back_function != CONST.CX3_KEY.FAVS) {
          key = this.back_function;
        }
        this.back_function = 0;
      }
    }
  }

  // process 'memory' key
  if (key == CONST.CX3_KEY.MEMORY) {
    console.log("mem button pressed");
    // set once 
    if (this.back_function != CONST.CX3_KEY.MEMORY) {
      // clear memory inputs if not set by widget (but not output)
      if (MemInputOne.valSet == false) {
        this.memScreen_.ClearMemory(false);
      }
      else {
        MemInputOne.valSet = false;
      }

      // memory screen setup
      this.memScreen_.ShowMemory();

      // set the new active screen
      this.lastFunctionPanel_ = this.activePanel;
      this.activePanel = this.memScreen_;

      // Update the status bar
      Screen.title = CONST.SID_FUNCTION.MEMORY;

      // set back functions
      this.last_back_function = this.back_function;
      this.back_function = CONST.CX3_KEY.MEMORY;
    }
  }

  switch(key) {
    case CONST.CX3_KEY.FLIGHT:
      if (DEBUG) {
        console.log("flight button pressed");
      }
      // If the calculator is active, clear it:
      if (CX3Calculator.CalculatorActive) {
        CX3Calculator.CalculatorClearFunction();
        this.eqScreen_.ClearEquation();
      }

      if ((back == true) && (this.selected != 0)) {
        LastSelectedEQListIndex = this.selected - 1;
        this.eqScreen_.SetEquation(this.eqScreen_.screens()[LastSelectedEQListIndex]);
        this.activePanel = this.eqScreen_;
        
        // 'back' will return to equation list:
        this.back_function = CONST.CX3_KEY.FLIGHT;
      }
      else {
        this.activePanel = this.listScreen_;
      }

      Screen.title = CONST.SID_FUNCTION.E6B;

      if(back == false)
      {
        // memory sceen back/exit
        this.back_function = 0;
        this.current_function = CONST.FUNCTION_ID.OTHER;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.FLIGHT;
        this.selected = 0;    // function main screen
        this.focus = LastSelectedEQListIndex;
        this.storeBackFunction();
      }
      break;

    case CONST.CX3_KEY.PLAN:
      // If the calculator is active, clear it:
      if (CX3Calculator.CalculatorActive) {
        CX3Calculator.CalculatorClearFunction();
        this.eqScreen_.ClearEquation();
      }

      // check for 'back' to specific trip leg
      if (back && (this.selected != 0)) {
        // display trip leg
        LastSelectedTripListLeg = this.selected - 1;
        this.eqScreen_.SetTripEquation(this.eqScreen_.tripScreens()[LastSelectedTripListLeg], false);

        this.activePanel = this.eqScreen_;

        // 'back' will return to equation list
        this.back_function = CONST.CX3_KEY.PLAN;
      }
      else {
        // Select the last highlighted item (make sure its valid first)
        if (LastSelectedTripListLeg > CONST.MAX_TRIP_PLAN_LEGS) {
          LastSelectedTripListLeg = 0;
        }
        this.tripScreen_.ShowTripPlanner(LastSelectedTripListLeg);

        // set the new active screen
        this.activePanel = this.tripScreen_;
      }

      Screen.title = CONST.SID_FUNCTION.TRIP;

      if(back == false) {
        // memory sceen back/exit
        this.back_function = 0;
        this.current_function = CONST.FUNCTION_ID.OTHER;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.PLAN;
        this.selected = 0;    // function main screen
        this.focus = LastSelectedTripListLeg;
        this.storeBackFunction();
      }
      break;

    case CONST.CX3_KEY.TIMER:
      // Select the last highlighted item (make sure its valid first)
      if (LastSelectedTimerIndex >= CONST.MAX_CALCULATOR_ITEMS) {
        LastSelectedTimerIndex = 0;
      }
  
      //timScreen_->ShowTimer(LastSelectedTimerIndex);
      
      // set the new active screen
      //setCurrentScreen(timScreen_);
      this.activePanel = this.timScreen_;
      
      // Update the status bar
      Screen.title = CONST.SID_FUNCTION.TIMER;

      if (back == false) {
        // memory sceen back/exit
        this.back_function = 0;
        this.current_function = CONST.FUNCTION_ID.OTHER;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.TIMER;
        this.selected = 0;    // function main screen
        this.focus = LastSelectedTimerIndex;
        this.storeBackFunction();
      }
      break;

    case CONST.CX3_KEY.CALC:
      this.calcScreen_.ShowCalculator();
      this.activePanel = this.calcScreen_;

      // Update the status bar
      Screen.title = CONST.SID_FUNCTION.CALCULATOR;

      if (back == false) {
        // memory sceen back/exit
        this.back_function = 0;
        this.current_function = CONST.FUNCTION_ID.OTHER;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.CALC;
        this.selected = 0;    // function main screen (only screen for calculator
        this.focus = 0;      // TODO: re-set focus if calculator not cleared each time it is called
        this.storeBackFunction();
      }
      break;

    case CONST.CX3_KEY.FAVS:
      // set to list screen in case current screen is eqScreen (causes viewport allocation problems)
      this.activePanel = this.listScreen_;
      
      if (Favorite.hasValue()) {
        var fav = Favorite.value();
        this.eqScreen_.SetEquation(this.eqScreen_.screens()[fav]);
        this.back_function = 0;
      }
      else {
        // show 'favorites setting' screen
        this.eqScreen_.ShowSettingOptions(CONST.SETTING_ID.FAVORITE);
        this.back_function = CONST.CX3_KEY.FAVS;
        LastSelectedSetting = CONST.SETTING_ID.FAVORITE;
      }
      
      this.activePanel = this.eqScreen_;
      Screen.title = CONST.SID_FUNCTION.FAVORITE;

      if (back == false) {
        // memory sceen back/exit
        this.current_function = CONST.FUNCTION_ID.OTHER;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.FAVS;
        this.selected = 0;    // function main screen
        this.focus = 0;      // will either be on favorite or settings.select favorite
        this.storeBackFunction();
      }
      break;

    case CONST.CX3_KEY.SETTINGS:

      // If calculator active - clear calculator before initializing new list/function
      if (CX3Calculator.CalculatorActive == true) {
        CX3Calculator.CalculatorClearFunction();
        //this.tripScreen_ = NULL;    //prevent display of unfinished calculator input
      }

      // check for 'back' to specific setting 
      // TODO: don't go back to specific setting (display main settings screen instead)?
      if ((back == true) && (this.selected != 0)) {
        // TODO: special processing for time/rounding/default units (here or elsewhere)
        LastSelectedSetting = this.selected - 1;
        this.eqScreen_.ShowSettingOptions(LastSelectedSetting);
        this.activePanel = this.eqScreen_;

        // 'back' will return to main settings screen
        this.back_function = CONST.CX3_KEY.SETTINGS;

        // set current function to update backlight changes (otherwise set to 'other')
        if (LastSelectedSetting == CONST.SETTING_ID.BACK_LIGHT)
          this.current_function = CONST.FUNCTION_ID.SETTTINGS_BACKLIGHT;
        else
          this.current_function = CONST.FUNCTION_ID.OTHER;
      }
      else {
        // set last selected if back function
        if (back == true) {
          LastSelectedSetting = this.focus;
        }

        // Select the last highlighted item (make sure its valid first)
        if (LastSelectedSetting >= CONST.SETTING_ID.END) {
          LastSelectedSetting = 0;
        }
        else if ((LastSelectedSetting == CONST.SETTING_ID.ZONE_LOCAL) || (LastSelectedSetting == CONST.SETTING_ID.ZONE_DEST)) {
          // set last focus - set local timzeone is slot 4 in time set screen
          SetTimezone.copyFromValue(LastSelectedSetting - (CONST.SETTING_ID.ZONE_LOCAL - 4));
          // go back to 'time set' setting screen
          LastSelectedSetting = CONST.SETTING_ID.TIME_SET;
         
          this.eqScreen_.ShowSettingOptions(CONST.SETTING_ID.TIME_SET);
          // reset back function
          this.back_function = CONST.CX3_KEY.SETTINGS;
          // reset current screen to equation secreen
          this.activePanel = this.eqScreen_;
          //this.statusBar_.SetCurrentFunction(SID_FUNCTION_FAVORITE);

          return 0;
        }


        this.tripScreen_.ShowSettingsMain(LastSelectedSetting);
        //this.tripScreen_.ShowSettingsMain(0);

        // set the new active screen
        this.activePanel = this.tripScreen_;
      }

      // Update the status bar
      Screen.title = CONST.SID_FUNCTION.SETTINGS;

      if (back == false) {
        // memory sceen back/exit
        this.back_function = 0;
        this.current_function = CONST.FUNCTION_ID.SETTINGS_MAIN;

        // multi-step 'back' function
        this._function = CONST.CX3_KEY.SETTINGS;
        this.selected = 0;    // function main screen
        this.focus = LastSelectedSetting;
        this.storeBackFunction();
      }
      break;

      case CONST.CX3_KEY.WTBAL:
        if (DEBUG) {
          console.log("wtbal button pressed");
        }

        // If the calculator is active, clear it:
        if (CX3Calculator.CalculatorActive) {
          CX3Calculator.CalculatorClearFunction();
          this.eqScreen_.ClearEquation();
        }

        // TODO: handle back logic
        if ((back == true) && (this.selected != 0)) {
          LastSelectedEQListIndex = this.selected - 1;
          this.eqScreen_.SetEquation(this.eqScreen_.screens()[LastSelectedEQListIndex]);
          this.activePanel = this.eqScreen_;
          
          // 'back' will return to equation list:
          this.back_function = CONST.CX3_KEY.WTBAL;
        }
        else {
          // this.activePanel = this.listScreen_;
          this.activePanel = this.listScreenWtBal_;
        }

        Screen.title = CONST.SID_FUNCTION.WTBAL;

        if(back == false)
        {
          // memory sceen back/exit
          this.back_function = 0;
          this.current_function = CONST.FUNCTION_ID.OTHER;

          // multi-step 'back' function
          this._function = CONST.CX3_KEY.WTBAL;
          this.selected = 0;    // function main screen
          this.focus = LastSelectedEQListIndex;
          this.storeBackFunction();
        }

        break;


    default:
      break;
  }
}

/**
 * Handles requests to show trip planner legs.
 * @tparam CustomEvent _evt The event data.
 */
Application.prototype.onEventTripLegShow = function(_evt) {
  LastSelectedTripListLeg = _evt.param;
  this.eqScreen_.SetTripEquation(this.eqScreen_.tripScreens()[_evt.param], false);
  this.activePanel = this.eqScreen_;

  this.selected = LastSelectedTripListLeg+1;
  //TODO: other back/focus stuff.
}

/**
 * Handles requests to add a trip planner leg.
 * @tparam CustomEvent _evt The event data.
 */
Application.prototype.onEventTripLegAdd = function(_evt) {
  LastSelectedTripListLeg = _evt.param;
  this.eqScreen_.SetClearTripLegVariables(_evt.param, true);

  this.eqScreen_.SetTripEquation(this.eqScreen_.tripScreens()[_evt.param], true);
  this.activePanel = this.eqScreen_;

  //TODO: other back/focus stuff.
  // 'back' will return to main trip planner screen
  this.back_function = CONST.CX3_KEY.PLAN;

  // multi-step 'back' function
  this.back_focus[0] = LastSelectedEQListIndex;  // update list focus
  this._function = CONST.CX3_KEY.PLAN;
  this.selected = LastSelectedTripListLeg+1;    // function main screen
  this.focus = 0;
  this.storeBackFunction();
}

/**
 * Handles requests to remove a trip planner leg.
 * @tparam CustomEvent _evt The event data.
 */
Application.prototype.onEventTripLegRemove = function(_evt) {
  LastSelectedTripListLeg = _evt.param;
  this.eqScreen_.SetClearTripLegVariables(_evt.param, true);
}


Application.prototype.onEventMemoryFunction = function(Event) {
  // send event param to memory function for processing
  this.memScreen_.ProcessMemoryFunction(Event.param);
  
  // restore back function
  this.back_function = this.last_back_function;

  // restore last screen
  this.activePanel = this.lastFunctionPanel_;

  

  return 0;
}
/**
 * Sets the active panel and makes it visible.
 * @tparam type name description.
 * @treturn type description.
 */
Object.defineProperty(Application.prototype, "activePanel", {
  get : function() {
    return this.__activePanel__;
  },
  set : function(_panel) {
    if (this.__activePanel__ !== undefined) {
      this.__activePanel__.ui.hide();
      if (this.__activePanel__.activeChild !== undefined) {
        this.__activePanel__.activeChild.fire("cx3-blur", {});
      }
    }
    this.__activePanel__ = _panel;
    if (this.__activePanel__.activeChild !== undefined) {
      this.__activePanel__.activeChild.fire("cx3-focus", {});
    }
    //Screen.title = _panel.title;
    Screen.subtitle = _panel.subTitle;
    Screen.setSubtitleVisibility(_panel.subTitle != "");
    _panel.ui.show();
    Screen.scrollItemIntoScreen(_panel.ui);
    if (_panel.activeChild === undefined || _panel.activeChild === null) {
      _panel.SetSelected(0);
    }
    if (_panel.activeChild !== undefined) {
      Screen.scrollItemIntoScreen(_panel.activeChild.ui);
    }
  }
});


Application.prototype.onEventSettingSelected = function(Event) {
  if (DEBUG) {
    console.log("Application.prototype.onEventSettingSelected");
    console.log("Event=" + Event);
  }
  LastSelectedSetting = Event.param;

  // TODO: special processing for time/rounding/default units (here or elsewhere)
  this.eqScreen_.ShowSettingOptions(Event.param);
  this.activePanel = this.eqScreen_;

  // 'back' from memory screen will return to main settings screen
  this.back_function = CONST.CX3_KEY.SETTINGS;

  
  if((LastSelectedSetting != CONST.SETTING_ID.ZONE_LOCAL) && (LastSelectedSetting != CONST.SETTING_ID.ZONE_DEST)) {
    this.back_focus[0] = LastSelectedSetting;
  }

  // set current function to update backlight changes (otherwise set to 'other')
  if(Event.param == CONST.SETTING_ID.BACK_LIGHT) {
    this.current_function = CONST.FUNCTION_ID.SETTTINGS_BACKLIGHT;
  }
  else {
    this.current_function = CONST.FUNCTION_ID.OTHER;
  }

  return 0;
}


Application.prototype.onEventOptionSelected = function(Event) {
  if (DEBUG) {
    console.log("Application.prototype.onEventOptionSelected");
  }
  
  var new_setting;
  var clock_time = new Time();
  var new_time;
  var user_var;
  var var_temp;
  var i;
  var leg_status;

  // clear memory inputs (for time set / memeory function combo)
  this.memScreen_.ClearMemory(false);

  // Get current default setting index
  var current_option = CONST.SETTINGS[LastSelectedSetting].kind().getDefaultUnit();

  if (DEBUG) {
    console.log("LastSelectedSetting=" + LastSelectedSetting);  //index into CONST.SETTINGS[
    console.log("CONST.SETTINGS[LastSelectedSetting]=" + CONST.SETTINGS[LastSelectedSetting]);
  }

  // see CONST.SETTINGS in definedVariables:410

  // Clock Set
  if (CONST.SETTINGS[LastSelectedSetting] == Clock) {
    if (DEBUG) {
      console.log("clock set");
    }
    // Time set
    if (Event.param < 3) {
      // Update time and last focus for this setting (stored in SetTimezone)
      if (Event.param == 1) {
        new_time = TimeLocal.value();
        SetTimezone.copyFromValue(1);
      }
      else if (Event.param == 2) {
        new_time = TimeDest.value();
        SetTimezone.copyFromValue(2);
      }
      else {
        new_time = TimeUTC.value();
        SetTimezone.copyFromValue(0);
      }

      var hours, minutes, seconds;
      var convertedInteger;
      convertedInteger = Math.floor(new_time);

      if (convertedInteger >= 0) {
        hours = Math.floor(convertedInteger/3600);
        convertedInteger = convertedInteger - (3600*hours);

        minutes = Math.floor(convertedInteger/60);
        seconds = convertedInteger - (60*minutes);

        clock_time.hours = hours % 24;
        clock_time.minutes = minutes;
        clock_time.seconds = seconds;

        // update clock time
        SetClock(clock_time);
      }
    }

    // refresh screen
    this.eqScreen_.ShowSettingOptions(LastSelectedSetting);

    return 0;
  }
  // Set new timezone
  else if ((CONST.SETTINGS[LastSelectedSetting] == ZoneLocal) || (CONST.SETTINGS[LastSelectedSetting] == ZoneDest)) {
    CONST.SETTINGS[LastSelectedSetting].setValue(Event.param);
    if (CONST.SETTINGS[LastSelectedSetting] == ZoneDest) {
      if (DEBUG) {
        console.log("set new dest timezone");
      }
      time_dest.setName(CONST.TIMEZONES[Event.param].name);
      time_dest.setOffset(CONST.TIMEZONES[Event.param].offset);
    }
    else {
      if (DEBUG) {
        console.log("set new local timezone");
      }
      time_local.setName(CONST.TIMEZONES[Event.param].name);
      time_local.setOffset(CONST.TIMEZONES[Event.param].offset);
      // update status bar clock display
      ClockUpdate.changed();
    }
    // set last focus - set local timzeone is slot 4 in time set screen
    SetTimezone.copyFromValue(LastSelectedSetting - (CONST.SETTING_ID.ZONE_LOCAL - 4));
    // reset last setting & go back to 'set time' setting screen
    LastSelectedSetting = CONST.SETTING_ID.TIME_SET;
    this.eqScreen_.ShowSettingOptions(LastSelectedSetting);

    return 0;

  }
  // Set 'Favorites' function
  else if (CONST.SETTINGS[LastSelectedSetting] == Favorite) {
    Favorite.copyFromValue(Event.param);
    if (this.back_function == CONST.CX3_KEY.FAVS) {
      // originally set by selecting favorites key when none set - show new favorite function
      Favorite.copyFromValue(Event.param);
      // TODO: UNLINK before setting new equation
      this.activePanel = this.listScreen_;
      //Unlink(this.currentFunctionPanel_);
      this.eqScreen_.SetEquation(this.eqScreen_.screens()[Event.param]);
      this.activePanel = this.eqScreen_;
      this.back_function = 0;
      LastSelectedSetting = 0;

      return 0;
    }
  }
  // Aircraft profile settings - check for new instrument calibration setting
  else if (CONST.SETTINGS[LastSelectedSetting] == AircraftProfile) {
    // Check for new RecoveryFactor setting
    if (ProfileRecoveryFactor.hasValue()) {
      var newCal = ProfileRecoveryFactor.value();
      if (DEBUG) {
        console.log("newCal=" + newCal);
      }
      if ((newCal >= 0.7) && (newCal <= 1.0)) {  // allowed range for ProfileRecoveryFactor
        //only set new value if value changed
        if (RecoveryFactor.value() != newCal) {
          RecoveryFactor.clearValue();
          RecoveryFactor.copyFromValue(newCal);
        }
      }
      else {
        // invalid value - clear 
        ProfileRecoveryFactor.clearValue();
      }
    }

    // If value cleared or invalid, re-set to current setting & show as copied
    if (ProfileRecoveryFactor.hasNoValue()) {
      ProfileRecoveryFactor.setCopied(true);
      ProfileRecoveryFactor.copyFromValue(RecoveryFactor.value());
    }

    // set value of ShouldUseProfileForWtBalCalcs based on unit index
    if (ShouldUseProfileForWtBalCalcs.hasValue()) {
      var toBool = Boolean(ShouldUseProfileForWtBalCalcs.getUnitIndex());
      console.log("ShouldUseProfileForWtBalCalcs value is " + toBool);
      ShouldUseProfileForWtBalCalcs.setValue(toBool);
    }

    // TODO: refresh screen ?
    //this.eqScreen_.ShowSettingOptions(LastSelectedSetting);

    // leave aircraft profile screen active
    return 0;

  }
  // User Data - check for Store or Recall NV data
  else if (CONST.SETTINGS[LastSelectedSetting] == UserData) {
    new_setting =  CONST.SETTINGS[LastSelectedSetting].kind().getUnit(Event.param);
   
    if (new_setting == userData_save) {
      // CONST.SETTINGS: CONST.SETTINGS[0] (theme) to CONST.SETTINGS[6] (unit changes)
      // NOTE: CONST.SETTINGS ID matches NV addr up to Favorites
      for(var index = 0; index < CONST.SETTING_ID.FAVORITE; index++) {
        current_option = CONST.SETTINGS[index].kind().getDefaultUnit();
        nv_data_view.setUint8(index, current_option, true);
      }

      // CONST.SETTINGS: Favorites
      if (Favorite.hasValue())
        current_option = Favorite.value();
      else
        current_option = 255;
      nv_data_view.setUint8(NV_ADDR.SETTING.FAVORITE, current_option, true);

      // CONST.SETTINGS: Time Zones
      if (ZoneLocal.hasValue())
        current_option = ZoneLocal.value();
      else
        current_option = CONST.TIME_ZONE_UTC;
      nv_data_view.setUint8(NV_ADDR.SETTING.ZONE_LOCAL, current_option, true);
      if (ZoneDest.hasValue())
        current_option = ZoneDest.value();
      else
        current_option = CONST.TIME_ZONE_UTC;
      nv_data_view.setUint8(NV_ADDR.SETTING.ZONE_DEST, current_option, true);

  
      user_var = new UserVariable();
      user_var.input = CONST.USER_VAR.INPUT;  // instrument cal always has value
      user_var.unit = 0;          // & unit is always zero (only one unit)
      // re-set ProfileRecoveryFactor if cleared
      if (ProfileRecoveryFactor.hasNoValue()) {
        ProfileRecoveryFactor = RecoveryFactor.value();
        ProfileRecoveryFactor.setCopied(true);
      }
      else if (ProfileRecoveryFactor.isCopied()) {
        user_var.input = (CONST.USER_VAR.INPUT | CONST.USER_VAR.COPIED);
      }
      user_var.value = ProfileRecoveryFactor.value();
      nv_data_view.setUserVariable(NV_ADDR.AIRCRAFT.CAL_K, user_var, true);
      // Aircraft RF (weight & balance reduction factor)
      user_var.unit = 0;          // unit is always zero (only one unit)
      if (AircraftRF.hasValue())
        user_var.input = CONST.USER_VAR.INPUT;
      else
        user_var.input = 0;
      user_var.value = AircraftRF.value();
      nv_data_view.setUserVariable(NV_ADDR.AIRCRAFT.RF, user_var, true);
      // Fuel Type default value: 6.0 (av gas LB/US GAL)
      if (!AircraftFuelType.hasValue()) {
        AircraftFuelType.copyFromValue(6.0/8.3454);    //default Av Gas (6.0 is LB/GAL from CX-2 manual, default uits KG/L
        AircraftFuelType.setLock(false);
      }
      // Rest of aircraft profile variables: use aircraft equations
      // set pointer to Aircraft equations 
      var pEq_unit = CONST.aircraftEqus;
      var nv_addr = NV_ADDR.AIRCRAFT_EQUATIONS_START;
      for (i in pEq_unit) {
        pEq_unit[i].setPreferredUnits();
        var_temp = pEq_unit[i].getOutput();
        if ((var_temp.hasValue()) && !var_temp.isComputed())
          user_var.input = CONST.USER_VAR.INPUT;    // no 'copied' values to check
        else
          user_var.input = 0;
        user_var.unit = var_temp.getUnitIndex();
        user_var.value = var_temp.value();
        nv_data_view.setUserVariable(nv_addr, user_var, true);

        nv_addr += CONST.USER_VARIABLE_SIZE;
      }

      // Weight & Balance using aircraft profile
      // set pointer to Aircraft Weight & Balance equations 
      pEq_unit = CONST.aircraftWeightBalanceEqus;
      nv_addr = NV_ADDR.WT_BAL_AIRCRAFT_START;
      // inputs: use aircraft Weight & Balance equations up to max aircraft input items
      for(i = 0; i < CONST.MAX_AIRCRAFT_INPUT_ITEMS; i++) {
        // set  preferred units 
        pEq_unit[i].setPreferredUnits();
        var_temp = pEq_unit[i].getOutput();
        if (var_temp.hasValue())              // don't need to check ifComputed, this can only be input or no value
          user_var.input = CONST.USER_VAR.INPUT;    // no 'copied' values to check
        else
          user_var.input = 0;
        user_var.unit = var_temp.getUnitIndex();
        user_var.value = var_temp.value();
        nv_data_view.setUserVariable(nv_addr, user_var, true);

        nv_addr += CONST.USER_VARIABLE_SIZE;
      }
      // outputs, intermediate, dummy equations: save/recall preffered units only
      //    use aircraft Weight & Balance equations after input items and up to max aircraft variables
      nv_addr = NV_ADDR.WT_BAL_AIRCRAFT.OUTPUTS;
      for(i = CONST.MAX_AIRCRAFT_INPUT_ITEMS; i < CONST.ALL_ARICRAFT_VARIABLES; i++) {
        // set  preferred units 
        pEq_unit[i].setPreferredUnits();
        var_temp = pEq_unit[i].getOutput();
        user_var.unit = var_temp.getUnitIndex();
        nv_data_view.setUint8(nv_addr, user_var.unit, true);

        nv_addr++;
      }

      // Weight & Balance items
      // store # active and max active items, and individual item status
      nv_data_view.setUint8(NV_ADDR.WT_BAL_ITEMS.ACTIVE, ItemsActive, true);
      nv_data_view.setUint8(NV_ADDR.WT_BAL_ITEMS.ACTIVE_MAX, ItemActiveMax, true);
      for (i = 0; i < CONST.MAX_ITEMS; i++) {
        nv_data_view.setUint8(NV_ADDR.WT_BAL_ITEMS.STATUS + i, ItemStatus[i], true);
      }
      // Weight & Balance RF (reduction factor)
      user_var.unit = 0;          // unit is always zero (only one unit)
      if (ReductionFactor.hasValue())
        user_var.input = CONST.USER_VAR.INPUT;
      else
        user_var.input = 0;
      user_var.value = ReductionFactor.value();
      nv_data_view.setUserVariable(NV_ADDR.WT_BAL_ITEMS.RF, user_var, true);
      // set pointer to  Weight & Balance equations 
      pEq_unit = CONST.weightbalanceEqus;
      nv_addr = NV_ADDR.WT_BAL_ITEMS.VARIABLES;
      // item inputs: use aircraft Weight & Balance equations up to max item input variables
      for(i = 0; i < (CONST.MAX_ITEMS * CONST.VARIABLES_PER_ITEM); i++) {
        // set  preferred units 
        pEq_unit[i].setPreferredUnits();
        var_temp = pEq_unit[i].getOutput();
        if (var_temp.hasValue() && !var_temp.isComputed())
          user_var.input = CONST.USER_VAR.INPUT;    // no 'copied' values to check
        else
          user_var.input = 0;
        user_var.unit = var_temp.getUnitIndex();
        user_var.value = var_temp.value();
        nv_data_view.setUserVariable(nv_addr, user_var, true);

        nv_addr += CONST.USER_VARIABLE_SIZE;
      }
      // outputs, intermediate, dummy equations: save/recall preffered units only
      //    use Weight & Balance equations after input item variables
      pEq_unit = pEq_unit.slice(i);
      nv_addr = NV_ADDR.WT_BAL_ITEMS.OUTPUT_EQU;
      for(i = 0; i < CONST.ITEMS_OUTPUT_EQUATIONS; i++) {
        // set  preferred units 
        pEq_unit[i].setPreferredUnits();
        var_temp = pEq_unit[i].getOutput();
        user_var.unit = var_temp.getUnitIndex();
        nv_data_view.setUint8(nv_addr, user_var.unit, true);

        nv_addr++;
      }

      // Trip Planner
      // store individual leg status
      this.tripScreen_.SaveTripPlannerData();
      // trip legs - store input value, prefered unit, and if calculated
      nv_addr = NV_ADDR.TRIP.LEG_1;  // set NV address pointer
      for(var j=0; j < CONST.MAX_TRIP_PLAN_LEGS; j++) {
        // set equation pointer
        if (j == 1)
          pEq_unit = CONST.tripPlanLeg2Equs;
        else if (j == 2)
          pEq_unit = CONST.tripPlanLeg3Equs;
        else if (j == 3)
          pEq_unit = CONST.tripPlanLeg4Equs;
                else if (j == 4)
                    pEq_unit = CONST.tripPlanLeg5Equs;
        else
          pEq_unit = CONST.tripPlanLeg1Equs;
        // inputs AND outputs 
        for(i = 0; i < CONST.TRIP_LEG_VARIABLES; i++) {
          // set  preferred units 
          pEq_unit[i].setPreferredUnits();
          var_temp = pEq_unit[i].getOutput();
          user_var.unit = var_temp.getUnitIndex();
          // store values for inputs only
          if (i < CONST.TRIP_LEG_INPUTS) {
            if (var_temp.hasValue()) {
              // check for 'calculated' value (new leg Depart set to previous leg ETA)
              if (var_temp.isComputed())
                user_var.input = CONST.USER_VAR.CALCULATED;
              else {
                user_var.input = CONST.USER_VAR.INPUT;
                // check for value copied from last leg
                if (var_temp.isCopied())
                  user_var.input = (CONST.USER_VAR.INPUT | CONST.USER_VAR.COPIED);
              }
            }
            else {
              user_var.input = 0;
            }
            user_var.value = var_temp.value();

            // save to memory & increment NV pointer
            nv_data_view.setUserVariable(nv_addr, user_var, true);
            nv_addr += CONST.USER_VARIABLE_SIZE;
          }
          else {
            // save UNIT ONLY to memory & increment NV pointer
            nv_data_view.setUint8(nv_addr, user_var.unit, true);
            nv_addr++;
          }
        }
      }
      // trip planner totals - save/recall prefered units only
      nv_addr = NV_ADDR.TRIP.OUTPUTS;  // set NV address pointer
      pEq_unit = CONST.tripPlanTotalEqus;  // & equation pointer
      for(var j=0; j < CONST.MAX_TRIP_PLAN_LEGS; j++) {
        // make sure preferred units for equation is set
        pEq_unit[j].setPreferredUnits();
        var_temp = pEq_unit[j].getOutput();
        user_var.unit = var_temp.getUnitIndex();
        nv_data_view.setUint8(nv_addr, user_var.unit, true);

        nv_addr++;
      }

      UserMemWriteChecksum(UserMemCalculateChecksum());
      UserMemSave();
      // TODO: indicate saving/saved on display
    }
    else if (new_setting == userData_recall) {

     
    
    }

  }
  // Check for new setting OR set default units (re-set if same setting)
  // TODO: special processing for time/rounding/etc (here or elsewhere)
  else if ((current_option != Event.param) || (CONST.SETTINGS[LastSelectedSetting] == DefaultUnits)) {
    if (DEBUG) {
      console.log("((current_option != Event.param) || (CONST.SETTINGS[LastSelectedSetting] == DefaultUnits))");
    }
    // update current setting
    // TODO: notify MCU of change in setting (time, backlight settings)
    new_setting =  CONST.SETTINGS[LastSelectedSetting].kind().getUnit(Event.param);
    CONST.SETTINGS[LastSelectedSetting].kind().setDefaultUnit(new_setting);

    // set new theme
    if (CONST.SETTINGS[LastSelectedSetting] == Theme) {
      if (new_setting == theme_color) {
        Screen.theme = CONST.THEMES[1];
      }
      else if (new_setting == theme_white) {
        Screen.theme = CONST.THEMES[2];
      }
      else {
        Screen.theme = CONST.THEMES[0];
      }

      // re-draw status bar
      //this.statusBar_.Invalidate();

    }

    // set backlight setting
    if (CONST.SETTINGS[LastSelectedSetting] == Backlight) {
      if (new_setting == backlight_daylight) {
        SetScreenBrightness(CONST.BACKLIGHT_VALUE.LOW);
        SetTouchBrightness(CONST.BACKLIGHT_VALUE.OFF);
      }
      else if (new_setting == backlight_night) {
        SetScreenBrightness(CONST.BACKLIGHT_VALUE.HIGH);
        SetTouchBrightness(CONST.BACKLIGHT_VALUE.LOW);
      }
      else if (new_setting == backlight_dusk) {
        SetScreenBrightness(CONST.BACKLIGHT_VALUE.MEDIUM_HIGH);
        SetTouchBrightness(CONST.BACKLIGHT_VALUE.HIGH);
      }
      else {
        SetScreenBrightness(CONST.BACKLIGHT_VALUE.MEDIUM);      // defuault normal
        SetTouchBrightness(CONST.BACKLIGHT_VALUE.OFF);
      }
    }

    // set scrolling speed
    if (CONST.SETTINGS[LastSelectedSetting] == ScrollSpeed) {
      if (new_setting == scroll_fast)
        SetScrollBarSpeed(CONST.SCROLL_BAR_SPEED.FAST);
      else if (new_setting == scroll_med)
        SetScrollBarSpeed(CONST.SCROLL_BAR_SPEED.MEDIUM);
      else
        SetScrollBarSpeed(CONST.SCROLL_BAR_SPEED.SLOW);
    }

    // set scroll bar function
    if (CONST.SETTINGS[LastSelectedSetting] == ScrollFunction) {
      if (new_setting == slider_slide)
        SetScrollBarFunction(CONST.SCROLL_BAR_FUNCTION.SCROLL);
      else if (new_setting == slider_tap)
        SetScrollBarFunction(CONST.SCROLL_BAR_FUNCTION.TAP);
      else
        SetScrollBarFunction(CONST.SCROLL_BAR_FUNCTION.BOTH);
    }

    // set default units
    if (CONST.SETTINGS[LastSelectedSetting] == DefaultUnits) {
      this.eqScreen_.SetDefaultUnits(Event.param);

      // exit here if customizing default units
      if (new_setting == units_custom) {
        // re-set current screen
        this.activePanel = this.eqScreen_;
        return 0;
      }
    }
  }

  // back to main 
  this.tripScreen_.ShowSettingsMain(LastSelectedSetting);
  this.activePanel = this.tripScreen_;

  this.back_function = 0;
  this.current_function = CONST.FUNCTION_ID.SETTINGS_MAIN;

  return 0;
}


Application.prototype.storeBackFunction = function() {
  // don't store same function twice
  if ((this.back_history[0] != this._function) || (this.back_selected[0] != this.selected)) {
    // store current function
    this.back_history.unshift(this._function);
    this.back_selected.unshift(this.selected);
    this.back_focus.unshift(this.focus);

    // Remove the last element if the list is too long:
    if (this.back_history.length > CONST.BACK_HISTORY_MAX) {
      this.back_history.pop();
      this.back_selected.pop();
      this.back_focus.pop();
    }
  }
}


Application.prototype.recallBackFunction = function() {
  // last function in back_history[1]
  var last = this.back_history[1];
  var active = this.back_history[0];

  if (last != 0) {
    // move current functions down one row
    this.back_history.shift();
    this.back_selected.shift();
    this.back_focus.shift();

    // and clear last copied function
    this.back_history[CONST.BACK_HISTORY_MAX-1] = 0;
    this.back_selected[CONST.BACK_HISTORY_MAX-1] = 0;
    this.back_focus[CONST.BACK_HISTORY_MAX-1] = 0;

    // make sure it is valid
    if ((last == CONST.CX3_KEY.FLIGHT) || (last == CONST.CX3_KEY.PLAN) || (last == CONST.CX3_KEY.CALC)|| (last == CONST.CX3_KEY.TIMER) 
      || (last == CONST.CX3_KEY.FAVS) || (last == CONST.CX3_KEY.SETTINGS)) {
      this._function = this.back_history[0];
      this.selected = this.back_selected[0];
      this.focus = this.back_focus[0];

      // if active is favorites - unlink current screen to prevent viewport allocation 
      // problems on 'back' to flight equation or trip leg
      // NOTE by Dean: not sure if this is needed.
      //if (active == CONST.CX3_KEY.'f')
      //  Unlink(eqScreen_);
    }
    else {
      last = 0;
    }
  }
  else if ((active == CONST.CX3_KEY.FLIGHT) || (active == CONST.CX3_KEY.PLAN)) {
    if (this.back_selected[0] != 0) {
      this.back_focus[0] = this.back_selected[0];
      this.back_selected[0] = 0;
    }
  }

  return last;
}


window.addEventListener("load", Application.initialize);
