NavSettings.prototype.AutoChange = ANY;
NavSettings.prototype.RecBarPos = TOP;

function NavSettings() {
}

NavSettings.prototype.Load = function(mode) {

    AutomationSettings.Load();
    var settings = AutomationSettings.GetSettings();
    
    this.AutoChange = settings.AutoChange;
    this.RecBarPos = settings.RecBarPos;
}

NavSettings.prototype.Save = function() {
    AutomationSettings.Save();
}
