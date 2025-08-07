function ListScreen() {
  Panel.call(this);
  this.addEvent("cx3-keypress", Panel.EVENTS.DEFAULT_NAVIGATION);
}
// ListScreen is a subclass of Panel:
ListScreen.inheritsFrom(Panel);


ListScreen.prototype.addItem = function(_text, _func, _param) {
  var w = new CX3MenuItemWidget();
  w.Set(_text, _func, _param);
  this.addChild(w);
};


ListScreen.prototype.clear = function() {   
  // Remove all references to the widgets/DOM so their resources can be released:
  for (var i in this.children_) {
    // Remove it from the DOM:
    this.removeChild(this.children_[i]);
  }
  // Clear my list of widgets:
  this.widgetList_ = [];
}
