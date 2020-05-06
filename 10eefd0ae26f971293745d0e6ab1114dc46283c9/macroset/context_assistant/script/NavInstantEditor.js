#use(automation_helpers.js)
#use(HilightEffect.js)
#use(NBubbleEffect.js)
#use(macro_functions.js)

NavInstantEditor.prototype.mode_ = NAVI_MODE;
NavInstantEditor.prototype.bubble_ = null;
NavInstantEditor.prototype.hint_ = null;
NavInstantEditor.prototype.hilight_ = null;
NavInstantEditor.prototype.windows_stack_ = null;
NavInstantEditor.prototype.current_screen_ = null;
NavInstantEditor.prototype.screen_rect_ = null;
NavInstantEditor.prototype.mac_ = null;
NavInstantEditor.prototype.hilight_rect_ = null;
NavInstantEditor.prototype.base_path_ = "";
NavInstantEditor.prototype.effect_manager_ = 0;
NavInstantEditor.prototype.effect_manager_ = 0;
NavInstantEditor.prototype.rect = null;


function NavInstantEditor(windows_stack) {
    this.effect_manager_ = AutoEngine.CreateEffectManager();
    this.effect_manager_.SetBase(WA.BaseURL);
    this.effect_manager_.SetActionQueue(ActionQueueType["AUTO_ENGINE_QUEUE"]);
    var css_href = HttpLocalUrl() + "adaptable/text_styles/text_styles.css";
    this.effect_manager_.SetCss(css_href); 
    this.effect_manager_.Install();    
    
    this.windows_stack_ = windows_stack;
    this.mode_ = NAVI_MODE;
}


NavInstantEditor.prototype.Init = function(mac, screen) {
    ca_logger.Write(3, "NavInstantEditor::Init", "", "");
    this.mac_ = mac;
    this.base_path_ = "";

    var path = this.mac_.GetResourcePath(this.mac_.GetResource());
    this.current_screen_ = screen;

    this.screen_rect_ = CreateRect(0, 0, 0, 0);

    if (this.current_screen_ != null) {
        this.screen_rect_ = this.current_screen_ ? this.current_screen_.ScreenRect() : null;
        if (this.current_screen_ != null && this.current_screen_.basepath.length >= 3) {
            this.base_path_ = this.current_screen_.basepath.substr(0, this.current_screen_.basepath.length - 3);
            
        }
    }

    if (this.mac_.HasParam("screenshot_rect") && this.mac_.ParamSpecified("screenshot_rect")) {
        this.hilight_rect_ = get_from_node_(this.mac_, "screenshot_rect");
    }
    ca_logger.DeWrite(3);
}


NavInstantEditor.prototype.IsInEditMode = function() {
    if (this.bubble_) {
        return this.bubble_.IsInEditMode();
    }
    return false;
}



NavInstantEditor.prototype.resolve_html_ = function(params, html_txt, format) {
    var resolved = "";
    var ctx = null;

    if (params != null) {
        ctx = CreateContext("macro", params.uid, "project", Project.UID);
    }
    
    resolved = Document.ResolveHtml(html_txt, format, ctx, params);
    return resolved;
}

NavInstantEditor.prototype.resolve = function(name, params) {
    var uid =  this.mac_.GetUID();
    var html_txt = this.resolve_html_(params, name, 1);
    html_txt = this.resolve_html_(null, html_txt, 2);
    return html_txt;
}

NavInstantEditor.prototype.unresolve = function(text) {
    var regex = new RegExp("src=\"project/" + Project.UID + "/macro/" + this.mac_.GetUID() + "/","g");
    text = text.replace(regex, "src=\"");
    return text;
}


NavInstantEditor.prototype.ShowBubble = function(show_toolbar) {
    ca_logger.Write(2, "NavInstantEditor::ShowBubble", "", "");
    if (this.mac_ == null) {
        return;
    }

    var params = mac_as_js(this.mac_);
    var text = "";
    var orientation = "C";
    var style = "";
    var expl = "";
    var position = null;
    var width = 180;
    var height = 40;

    orientation = get_from_node_(this.mac_, "orientation");
    expl = get_from_node_(this.mac_, "explanation_d");
    text = this.resolve(expl, params);
    position = get_from_node_(this.mac_, "click_pos");
    if (this.mac_.HasParam("click_pos_rel")) {
        position = get_from_node_(this.mac_, "click_pos_rel");
    }
    style = get_from_node_(this.mac_, "bubblestyle_d");
    width = get_from_node_(this.mac_, "b_width");

    var rect = CreateRect(0, 0, 0, 0);

    var pos_x = 0;
    var pos_y = 0;
    if (this.is_relative_to_screen_(position)) {
        rect = this.screen_rect_.Clone();
        pos_x = Math.round(((rect.width / 100) * position.X));
        pos_y = Math.round(((rect.height / 100) * position.Y));
        rect = get_from_node_(this.mac_, "screenshot_rect");
    } else {
        if (this.mac_.HasParam("screenshot_rect")) {
            rect = this.mac_.GetParam("screenshot_rect");
        }
        pos_x = position.OffsetX;
        pos_y = position.OffsetY;
    }

    if (this.bubble_ != null) {
        this.bubble_.Destroy();
    }

    this.bubble_ = new NBubbleEffect(this.effect_manager_);

    this.bubble_.editing_mode = NAVI_MODE;
    this.bubble_.show_toolbar = show_toolbar;
    this.bubble_.width = width;
    this.bubble_.height = height;
    this.bubble_.text = text;
    this.bubble_.orientation = orientation;
    this.bubble_.style = style;
    this.bubble_.offset_x = 0;
    this.bubble_.offset_y = 0;
    this.bubble_.rtl = IsRTL(Project.Language);
    this.bubble_.language = Project.Language;
    this.bubble_.enable_editing = true;

    if (rect.left == 0 && rect.top == 0 && rect.right == 0 && rect.bottom == 0) {
        rect.left = position.x;
        rect.top = position.y;
        rect.right = position.x;
        rect.bottom = position.y;
    }
    this.rect = rect;
    this.clamp_rect(rect, this.windows_stack_.GetRect());
    this.bubble_.Create(rect, this.windows_stack_);

    ca_logger.DeWrite(2);
}


NavInstantEditor.prototype.ShowHilight = function() {
    ca_logger.Write(2, "NavInstantEditor::ShowHilight", "", "");
    if (this.mac_ == null || !(this.mac_.HasParam("screenshot_rect") && this.mac_.ParamSpecified("screenshot_rect"))) {
        ca_logger.DeWrite(3);
        return;
    }

    this.hilight_ = new HilightEffect(this.effect_manager_); 
    var rect = this.mac_.GetParam("screenshot_rect");
    this.clamp_rect(rect, this.windows_stack_.GetRect());
    this.hilight_.htype = "frame";

    this.hilight_.Create(rect, BLUE_COLOR, 3, this.windows_stack_.Hwnd());
    this.hilight_.Show();
    ca_logger.DeWrite(2);
}

NavInstantEditor.prototype.HideBubble = function(save) {
    if (this.bubble_) {
        if (save) {
            this.update_bubble_data_();
        }
        this.bubble_.Destroy();
        this.bubble_ = null;
    }
}


NavInstantEditor.prototype.HideHilight = function(save) {
    if (this.hilight_) {
        if (save) {
            this.update_hilight_data_();
        }
        this.hilight_.Destroy();
        this.hilight_ = null;
    }
}


NavInstantEditor.prototype.ShowAll = function() {
    HideMouseTip();
    if (!is_explanation(this.mac_)) {
        this.ShowHilight();
    }
    this.ShowBubble(false);
}


NavInstantEditor.prototype.HideAll = function(save) {
    this.HideHilight(save);
    this.HideBubble(save);
}

NavInstantEditor.prototype.is_relative_to_screen_ = function(relpos) {
    return relpos.ID == 'page';
}

NavInstantEditor.prototype.update_bubble_data_ = function() {
    ca_logger.Write(3, "NavInstantEditor::update_bubble_data_", "", "");
    var orientation = this.get_bubble_orientation_();
    var pos = this.get_bubble_pos_();
    var text = this.get_bubble_text_();
    var width = this.get_bubble_width_();
    var height = this.get_bubble_height_();

    var orig_pos = null;
    var params = mac_as_js(this.mac_);
    
    
    if (this.mac_.HasParam("click_pos_rel") && pos != undefined) {
        var rect = this.windows_stack_.GetRect();
        pos.x = ((pos.x) / (rect.right - rect.left)) * 100;
        pos.y = ((pos.y) / (rect.bottom - rect.top)) * 100;
        this.mac_.SetParam("click_pos_rel", pos);
    }
    expl = this.mac_.GetParam("explanation_d");
    var old_text = this.resolve(expl, params);

    var text_changed = (RenderHtml(old_text) != RenderHtml(text));
    if (text_changed) {
        this.mac_.SetParam("explanation_d", this.unresolve(text));
        this.mac_.SetParam("explanation_d_modified", true);
    }

    this.mac_.SetParam("orientation", orientation);
    this.mac_.SetParam("b_width", width);
    this.mac_.SetParam("b_height", height);
    ca_logger.DeWrite(3);
}


NavInstantEditor.prototype.update_hilight_data_ = function() {
    ca_logger.Write(3, "NavInstantEditor::update_hilight_data_", "", "");
    var rect = this.hilight_rect_;

    if (rect != null) {
        var click_pos = CreatePoint(0, 0);
        click_pos.x = Math.round(rect.left + (rect.right - rect.left) / 2);
        click_pos.y = Math.round(rect.top + (rect.bottom - rect.top) / 2);
        this.mac_.SetParam("screenshot_rect", rect);
        if (this.mac_.HasParam("click_pos")) {
            this.mac_.SetParam("click_pos", click_pos);
        }
    }
    ca_logger.DeWrite(3);
}


NavInstantEditor.prototype.get_bubble_pos_ = function() {
    var pos = CreatePoint(0, 0);

    if (this.bubble_) {
        pos = this.bubble_.GetPos();
    }
    return pos;
}

NavInstantEditor.prototype.get_bubble_text_ = function() {
    var expl = "";

    if (this.bubble_) {
        expl = this.bubble_.GetBubbleText();
    }

    return expl;
}

NavInstantEditor.prototype.get_bubble_width_ = function() {
    var width = 180;

    if (this.bubble_) {
        width = this.bubble_.GetBubbleWidth();
    }

    return width;
}

NavInstantEditor.prototype.get_bubble_height_ = function() {
    var height = 40;

    if (this.bubble_) {
        height = this.bubble_.GetBubbleHeight();
    }

    return height;
}

NavInstantEditor.prototype.get_bubble_orientation_ = function() {
    var or = "SE";

    if (this.bubble_) {
        or = this.bubble_.GetBubbleOrientation();
    }

    return or;
}

NavInstantEditor.prototype.UpdateOrientation = function() {
    if (this.bubble_) {
        this.bubble_.UpdateOrientation(this.rect);
    }
}

NavInstantEditor.prototype.EffectAdjusted = function(bubble_id) {
    if (this.bubble_ && this.bubble_.GetHandle() == bubble_id) {
        this.bubble_.EffectAdjusted();
    }
}

NavInstantEditor.prototype.clamp_rect = function(rect, boundary) {
    if (boundary != null && rect != null) {
        var offset_x = (boundary.left < 0) ? -1 * boundary.left : 0;
        var offset_y = (boundary.top < 0) ? -1 * boundary.top : 0;
        rect.MoveBy(offset_x, offset_y);
    } 
    
    var shadow_offset = this.windows_stack_.GetShadowBorder();
    rect.left += shadow_offset.left;
    rect.top += shadow_offset.top;
    rect.right += shadow_offset.right;
}
