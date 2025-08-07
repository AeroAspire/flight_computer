
var StdAtmosphereEquation = {
    
    compute_temp : function(altitude, layer) {
      // verify that the arguments are valid before calculating...
      if (layer < CONST.atmLayerData.length && altitude >= CONST.atmLayerData[layer].StartHeight && altitude < CONST.atmLayerData[layer].EndHeight) {
        var tmp = CONST.atmLayerData[layer].LapseRate * (altitude - CONST.atmLayerData[layer].StartHeight);
        return (CONST.atmLayerData[layer].StdTemperature + tmp);
      }
      else {
        return CONST.NO_VALUE;  // invalid altitude argument (out of model range)
      }
    }
};


function ComputeTempfromAltitude(tempOut, altitudeInput) {
  Equation.call(this, tempOut, altitudeInput);
}
// ComputeTempfromAltitude is a subclass of Equation:
ComputeTempfromAltitude.inheritsFrom(Equation);

// compute temperature
// assumes that inputs have value.
ComputeTempfromAltitude.prototype.compute = function() {
  for (var i in CONST.atmLayerData) {
    // find the correct atmosphere layer for this height
    if (this.input1() >= CONST.atmLayerData[i].StartHeight && this.input1() < CONST.atmLayerData[i].EndHeight) {
      // found it, now we can calculate the temperature
      return StdAtmosphereEquation.compute_temp(this.input1(), i);
    }
  }
  
  return CONST.NO_VALUE;  // invalid altitude argument (out of model range)
}

ComputeTempfromAltitude.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(false);

  if (this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.TemperatureDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}

////////////////////////////////////////////////////////////////////////////////
///  
///  Computes pressure in the standard atmospheric model (1976)
///  when a height is given.
///
////////////////////////////////////////////////////////////////////////////////
function ComputePressurefromAltitude(pressureOut, altitudeInput) {
  Equation.call(this, pressureOut, altitudeInput);
}
// ComputePressurefromAltitude is a subclass of Equation:
ComputePressurefromAltitude.inheritsFrom(Equation);

// compute pressure
// assumes that inputs have value.
ComputePressurefromAltitude.prototype.compute = function() {
  for (var i in CONST.atmLayerData) {
    // find the correct atmosphere layer for this height
    if (this.input1() >= CONST.atmLayerData[i].StartHeight && this.input1() < CONST.atmLayerData[i].EndHeight) {
      // found it, now we can calculate the pressure
      if (CONST.atmLayerData[i].LapseRate != 0) {
        var tmp = Math.pow((CONST.atmLayerData[i].StdTemperature / StdAtmosphereEquation.compute_temp(this.input1(), i)), (( CONST.g* CONST.M)/(CONST.R * CONST.atmLayerData[i].LapseRate)));
        return (CONST.atmLayerData[i].StartPressure * tmp);
      }
      else {
        var tmp = (-CONST.g * CONST.M * (this.input1() - (CONST.atmLayerData[i].StartHeight)) / (CONST.R * CONST.atmLayerData[i].StdTemperature));
        return (CONST.atmLayerData[i].StartPressure * Math.exp(tmp));
      }
    }
  }

  return CONST.NO_VALUE;  // invalid altitude argument (out of model range)
}

ComputePressurefromAltitude.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(false);
  
  if (this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.PressureDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}

////////////////////////////////////////////////////////////////////////////////
///  
///  Computes altitude in the standard atmospheric model (1976)
///  when a temperature is given.
///
////////////////////////////////////////////////////////////////////////////////
function ComputeAltitudefromPressure(altitudeOut, pressureInput) {
  Equation.call(this, altitudeOut, pressureInput);
}
// ComputeAltitudefromPressure is a subclass of Equation:
ComputeAltitudefromPressure.inheritsFrom(Equation);

// compute pressure
// assumes that inputs have value.
ComputeAltitudefromPressure.prototype.compute = function() {
  for (var i in CONST.atmLayerData) {
    // find the correct atmosphere layer for this height
    if (this.input1() <= CONST.atmLayerData[i].StartPressure && this.input1() > CONST.atmLayerData[i].EndPressure) {
      // found it, now we can calculate the altitude
      if (CONST.atmLayerData[i].LapseRate != 0) {
        var tmp = Math.pow((this.input1() / CONST.atmLayerData[i].StartPressure), -((CONST.R * CONST.atmLayerData[i].LapseRate) / (CONST.g * CONST.M))) - 1;
        return (((CONST.atmLayerData[i].StdTemperature / CONST.atmLayerData[i].LapseRate) * tmp) + CONST.atmLayerData[i].StartHeight);
      }
      else {
        var tmp = CONST.R * CONST.atmLayerData[i].StdTemperature * Math.log(this.input1() / CONST.atmLayerData[i].StartPressure);
        return ((tmp / (-CONST.g * CONST.M)) + CONST.atmLayerData[i].StartHeight);
      }
    }
  }
  
  return CONST.NO_VALUE;  // invalid altitude argument (out of model range)
}

ComputeAltitudefromPressure.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(false);
  
  if(this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.AltitudeDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}
