NBubbleEffect.prototype.type = "bubble";
NBubbleEffect.prototype.order = 1; //ORDER_TOP
NBubbleEffect.prototype.text = "";
NBubbleEffect.prototype.style = "_default";
NBubbleEffect.prototype.width = 180;
NBubbleEffect.prototype.height = 40;
NBubbleEffect.prototype.orientation = "C";
NBubbleEffect.prototype.x = -1;
NBubbleEffect.prototype.y = -1;
NBubbleEffect.prototype.offset_x = 0;
NBubbleEffect.prototype.offset_y = 0;
NBubbleEffect.prototype.no_spike = false;
NBubbleEffect.prototype.minimized = false;
NBubbleEffect.prototype.minimizable = false;
NBubbleEffect.prototype.movable = true;
NBubbleEffect.prototype.editable = true;
NBubbleEffect.prototype.parent_window = 0;
NBubbleEffect.prototype.handle_ = -1;
NBubbleEffect.prototype.rtl = false;
NBubbleEffect.prototype.language = "en-US";
NBubbleEffect.prototype.rect = null;
NBubbleEffect.prototype.effect_manager = null;
NBubbleEffect.prototype.editing_mode = 0;
NBubbleEffect.prototype.edit_enabled = true;
NBubbleEffect.prototype.enable_editing = false;

function NBubbleEffect(e_manager) {
    this.effect_manager = e_manager;
}

NBubbleEffect.prototype.GetHandle = function() {
    return this.handle_;
}

NBubbleEffect.prototype.IsValid = function() {
    return (this.handle_ != -1);
}

NBubbleEffect.prototype.calc_position_ = function(rect, click_pos) {
    if (rect != null) {
        var pt = winnavp_get_show_point(rect, this.orientation);
        this.x = pt.x  + this.offset_x;
        this.y = pt.y  + this.offset_y;
    } else if (click_pos != null) {
        this.x = click_pos.x + this.offset_x;
        this.y = click_pos.y + this.offset_y;
    }
}


NBubbleEffect.prototype.ShowExplanation = function(stack) {
    if (this.x != -1 && this.y != -1) {
        this.Destroy();
        this.parent_window = stack.Hwnd();
        this.create_();
        this.effect_manager.ShowEffect(this.handle_);
    }
}

NBubbleEffect.prototype.Create = function(rect, stack) {
    this.Destroy();
    this.map_orientation_for_v3_();
    
    var pt = this.GetShowPoint(rect);

    if (pt.x != -1 && pt.y != -1) {
        this.x = pt.x + this.offset_x;
        this.y = pt.y + this.offset_y;
        this.parent_window = stack.Hwnd();
        this.create_();
    }
}

NBubbleEffect.prototype.Show = function() {
    if (this.effect_manager && this.IsValid()) {
        this.effect_manager.ShowEffect(this.handle_);
    }
}


NBubbleEffect.prototype.Move = function(rect, click_pos) {
    if (this.IsValid()) {
        this.calc_position_(rect, click_pos);

        var props = new Properties();
        props.Add(NProperty.X, "" + this.x);
        props.Add(NProperty.Y, "" + this.y);
        this.effect_manager.SetProperties(this.handle_, props.Get());
    }
}

NBubbleEffect.prototype.create_ = function() {
        this.handle_ = this.effect_manager.ReserveHandle("bubble");
        var props = new Properties();

        props.Add(NProperty.ORDER, "" + this.order);
        props.Add(NProperty.SPIKE_VISIBLE, "" + (!(this.no_spike) ? "1" : "0"));
        props.Add(NProperty.ORIENTATION, "" + this.orientation);
        props.Add(NProperty.MOVABLE, "" + (this.movable ? "1" : "0"));
        props.Add(NProperty.MINIMIZABLE, "" + (this.minimizable ? "1" : "0"));
        props.Add(NProperty.MINIMIZED, (this.minimized ? "1" : "0"));
        props.Add(NProperty.EDITABLE, "1");
        props.Add(NProperty.X, "" + this.x);
        props.Add(NProperty.Y, "" + this.y);
        props.Add(NProperty.WIDTH, "" + this.width);
        props.Add(NProperty.HEIGHT, "" + this.height);
        props.Add(NProperty.EDITING_MODE, "" + this.editing_mode);
        
        props.Add(NProperty.PARENT_WINDOW, "" + this.parent_window);
        props.Add(NProperty.RTL, (this.rtl ? "1" : "0"));
        props.Add(NProperty.LANGUAGE, this.language);
        props.Add(NProperty.TEXT, this.text);
        props.Add(NProperty.STYLE, this.style);

        this.effect_manager.SetProperties(this.handle_, props.Get());
        this.effect_manager.CreateEffect(this.handle_);
}


NBubbleEffect.prototype.SetEditMode = function(editing) {
    this.edit_enabled = editing;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.EDIT_ENABLED, this.edit_enabled ? "1" : "0");
    }
}

NBubbleEffect.prototype.IsInEditMode = function() {
    if (this.IsValid()) {
        return (this.effect_manager.GetProperty(this.handle_, NProperty.EDIT_ENABLED) - 0) > 0;
    }
    return false;
}

NBubbleEffect.prototype.GetBubbleWidth = function() {
    var width = this.width;
    if (this.IsValid()) {
        width = this.effect_manager.GetProperty(this.handle_, NProperty.WIDTH) - 0;
    }
    return width;
}

NBubbleEffect.prototype.GetBubbleHeight = function() {
    var height = this.height;
    if (this.IsValid()) {
        height = this.effect_manager.GetProperty(this.handle_, NProperty.HEIGHT) - 0;
    }
    return height;
}

NBubbleEffect.prototype.SetWidth = function(width) {
    this.width = width;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.WIDTH, "" + this.width);
    }
}

NBubbleEffect.prototype.SetHeight = function(height) {
    this.height = height;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.HEIGHT, "" + this.height);
    }
}


NBubbleEffect.prototype.Hide = function() {
    if (this.IsValid()) {
        this.effect_manager.HideEffect(this.handle_);
    }
}

NBubbleEffect.prototype.Destroy = function() {
    if (this.IsValid()) {
        this.both_visible = (this.effect_manager.GetProperty(this.handle_, NProperty.BOTH_VISIBLE) == "1");
        this.effect_manager.DestroyEffect(this.handle_);
        this.handle_ = -1;
    }
}


NBubbleEffect.prototype.Minimize = function() {
    if (this.IsValid()) {
        this.minimized = true;
        this.effect_manager.SetProperty(this.handle_, NProperty.MINIMIZED, "1");
    }
}


NBubbleEffect.prototype.Maximize = function() {
    if (this.IsValid()) {
        this.minimized = false;
        this.effect_manager.SetProperty(this.handle_, NProperty.MINIMIZED, "0");
    }
}


NBubbleEffect.prototype.GetBubbleText = function() {
    if (this.IsValid()) {
        this.text = this.effect_manager.GetProperty(this.handle_, NProperty.TEXT);
    }
    return this.text;
}


NBubbleEffect.prototype.ExecuteScript = function(script) {
    if (this.IsValid()) {
        this.effect_manager.TriggerEffect(this.handle_, NProperty.SCRIPT, script);
    }
}

NBubbleEffect.prototype.ElevateOrder = function() {
    if (this.IsValid()) {
        this.effect_manager.TriggerEffect(this.handle_, NProperty.ELEVATE_ORDER, "");
    }
}


NBubbleEffect.prototype.GetPos = function() {
    var pos = CreatePoint(this.x, this.y);
    if (this.IsValid()) {
        pos.x = this.effect_manager.GetProperty(this.handle_, NProperty.X) - 0;
        pos.y = this.effect_manager.GetProperty(this.handle_, NProperty.Y) - 0;
    }
    return pos;
}

NBubbleEffect.prototype.SetPos = function(pos) {
    this.x = pos.x;
    this.y = pos.y;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.X, "" + this.x);
        this.effect_manager.SetProperty(this.handle_, NProperty.Y, "" + this.y);
        this.UpdateBubble();
    }
}

NBubbleEffect.prototype.SetEditable = function(editable) {
    this.editable = editable;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.EDITABLE, (this.editable ? "1" : "0"));
    }
}

NBubbleEffect.prototype.SetRtl = function(rtl) {
    this.rtl = rtl;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.RTL, (this.rtl ? "1" : "0"));
    }
}

NBubbleEffect.prototype.SetOrientation = function(ori) {
    this.orientation = ori;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.ORIENTATION, "" + this.orientation);
        this.UpdateBubble();
    }
}

NBubbleEffect.prototype.GetBubbleOrientation = function() {
    if (this.IsValid()) {
        this.orientation = this.effect_manager.GetProperty(this.handle_, NProperty.ORIENTATION);
    }
    return this.orientation;
}

NBubbleEffect.prototype.UpdateBubble = function() {
    if (this.IsValid()) {
        this.effect_manager.UpdateEffect(this.handle_);
    }
}

NBubbleEffect.prototype.map_orientation_for_v3_ = function() {
    switch(this.orientation) {
        case "TL" : this.orientation = "NW";
                    break;

        case "TR" : this.orientation = "NE";
                    break;

        case "WN" :
        case "WS" : this.orientation = "W";
                    break;

        case "EN" : 
        case "ES" : this.orientation = "E";
                    break;

        case "BL" : this.orientation = "SW";
                    break;

        case "BR" : this.orientation = "SE";
                    break;
    }
}


NBubbleEffect.prototype.GetShowPoint = function(rect) {
    var pt = {x:-1, y:-1};
    var ori = this.orientation;
    if (rect != null) {
        if (ori == "NW" || ori == "SW" || ori == "W") {
            pt.x = rect.left;
        } else if (ori == "SE" || ori == "NE" || ori == "E") {
            pt.x = rect.right;
        } else {
            pt.x = rect.left + (rect.right-rect.left)/2;
        }
        
        if (ori == "NW" || ori == "NE" || ori == "N") {
            pt.y = rect.top;
        } else if (ori == "SW" || ori == "SE" || ori == "S") {
            pt.y = rect.bottom;
        } else {
            pt.y = rect.top + (rect.bottom-rect.top)/2;
        }
    }
    return pt;
}

NBubbleEffect.prototype.EnableEditing = function(enable) {
    if (this.IsValid()) {
        this.effect_manager.TriggerEffect(this.handle_, NProperty.SET_EDIT_MODE, enable ? "1" : "0");
    }
}

NBubbleEffect.prototype.UpdateOrientation = function(ctl_rect) {
    var changed_orientation = this.GetBubbleOrientation();
    this.SetOrientation(changed_orientation);
    this.change_the_bubble_position_(ctl_rect);
}

NBubbleEffect.prototype.change_the_bubble_position_ = function(rect) {
    var pt = this.GetShowPoint(rect);
    this.x = pt.x;
    this.y = pt.y;
    this.SetPos(pt);
}

NBubbleEffect.prototype.EffectAdjusted = function() {
    this.Show();
    this.EnableEditing(this.enable_editing);
}

NBubbleEffect.prototype.SetLanguage = function(lang) {
    this.language = lang;
    if (this.IsValid()) {
        this.effect_manager.SetProperty(this.handle_, NProperty.LANGUAGE, this.language);
    }
}
