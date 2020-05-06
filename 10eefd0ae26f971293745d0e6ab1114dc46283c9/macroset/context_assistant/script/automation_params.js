function MacCreateCaParams() {
}

MacCreateCaParams.prototype.Type = "";
MacCreateCaParams.prototype.Info = null;
MacCreateCaParams.prototype.Action = null;
MacCreateCaParams.prototype.Screen = null;
MacCreateCaParams.prototype.ReplaceTxt = true;
MacCreateCaParams.prototype.LastMouseAction = null;
MacCreateCaParams.prototype.CtrlWebCompat = true;
MacCreateCaParams.prototype.ObjectIndex = -1;
MacCreateCaParams.prototype.WindowsStack = null;
MacCreateCaParams.prototype.PrevMac = null;

MacCreateCaParams.prototype.Init = function() {
    this.Type = "";
    this.Info = null;
    this.Action = null;
    this.Screen = null;
    this.Path = "";
    this.ReplaceTxt = true;
    this.ObjectIndex = -1;
}

MacCreateCaParams.prototype.SetParams = function(type, info, action, screen, last_maction, obj_index, windows_stack, prev_mac) {
    this.Type = type;
    this.Info = info;
    this.Action = action;
    this.Screen = screen;
    this.LastMouseAction = last_maction;
    this.ObjectIndex = obj_index;
    this.WindowsStack = windows_stack;
    this.PrevMac = prev_mac;
}