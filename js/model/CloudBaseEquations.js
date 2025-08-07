
CONST.tempChangeRateInC = 2.444444;
CONST.tempChangeRateDistanceInM = 304.8;


function ComputeCloudBaseFromAirTempandBarPress(cloudBaseOut, airTempInput, dewPointInput) {
  Equation.call(this, cloudBaseOut, airTempInput, dewPointInput);
}
// ComputeCloudBaseFromAirTempandBarPress is a subclass of Equation:
ComputeCloudBaseFromAirTempandBarPress.inheritsFrom(Equation);

// compute Indicated Altitude
// assumes that inputs have value.
ComputeCloudBaseFromAirTempandBarPress.prototype.compute = function() {
  return (((this.input1() - this.input2()) / CONST.tempChangeRateInC) * CONST.tempChangeRateDistanceInM);
}

ComputeCloudBaseFromAirTempandBarPress.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(false);

  if (this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.AltitudeDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}




function ComputeTempFromCloudBaseandDewPoint(airTempOutput, cloudBaseInput, dewPointInput) {
  Equation.call(this, airTempOutput, cloudBaseInput, dewPointInput);
}
// ComputeTempFromCloudBaseandDewPoint is a subclass of Equation:
ComputeTempFromCloudBaseandDewPoint.inheritsFrom(Equation);

// compute temperature
// assumes that inputs have value.
ComputeTempFromCloudBaseandDewPoint.prototype.compute = function() {
  return (((CONST.tempChangeRateInC * this.input1()) / CONST.tempChangeRateDistanceInM) + this.input2());
}

ComputeTempFromCloudBaseandDewPoint.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(true);

  if (this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.TemperatureDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}



////////////////////////////////////////////////////////////////////////////////
///  
///  Computes the dew point when cloud base and air temperature are
///  known.
///
////////////////////////////////////////////////////////////////////////////////
function ComputeDewPointFromCloudBaseandTemp(dewPointOutput, cloudBaseInput, airTempInput) {
  Equation.call(this, dewPointOutput, cloudBaseInput, airTempInput);
}
// ComputeDewPointFromCloudBaseandTemp is a subclass of Equation:
ComputeDewPointFromCloudBaseandTemp.inheritsFrom(Equation);

// compute Indicated Altitude
// assumes that inputs have value.
ComputeDewPointFromCloudBaseandTemp.prototype.compute = function() {
  return (this.input2() - ((CONST.tempChangeRateInC * this.input1()) / CONST.tempChangeRateDistanceInM));
}

ComputeDewPointFromCloudBaseandTemp.prototype.setPreferredUnits = function() {
  this.output_.setUseDefaultUnit(true);

  if (this.preferredUnits_.ptr == null) {
    this.preferredUnits_.ptr = CONST.TemperatureDefault;
  }
  this.output_.setPreferredUnit(this.preferredUnits_);
}
