#use(automation_params.js)
#use(automation_helpers.js)
#use(navi_keymap.js)

function ActionCapturer() {
}

ActionCapturer.prototype.MouseActionHandler = null;
ActionCapturer.prototype.KeyActionHandler = null;
ActionCapturer.prototype.windows_stack_ = null;

ActionCapturer.prototype.action_queue_ = null;
ActionCapturer.prototype.carry_on_ = false;
ActionCapturer.prototype.executed_ = false;
ActionCapturer.prototype.mouse_wheel_ = false;

ActionCapturer.prototype.Start = function() {
    ca_logger.Write(3, "ActionCapturer::Init", "", "");

    this.action_queue_ = AutoEngine.GetActionQueue();
    this.action_queue_.Flush();
    this.carry_on_ = true;
    
    AutoEngine.EngineStart();
    AutoEngine.ConsumeMouseOver = true;
    
    this.loop_();
    AutoEngine.EngineStop();
    ca_logger.DeWrite(3);
}

ActionCapturer.prototype.Stop = function() {
    ca_logger.Write(3, "ActionCapturer::Stop", "", "");
    
    this.MouseActionHandler = null;
    this.KeyActionHandler = null;
    this.action_queue_ = null;
    this.carry_on_ = false;
    this.execute_ = false;
    
    ca_logger.DeWrite(3);
}

ActionCapturer.prototype.loop_ = function() {
    ca_logger.Write(3, "ActionCapturer::loop_", "", "");
    
    while (this.carry_on_ && !(this.MouseActionHandler == null && this.KeyActionHandler == null)) {
        
        var action = this.action_queue_.Front();
        
        this.action_queue_.Pop();
        
        ca_logger.Log(1, "ActionCapturer::loop_ - action type: " + action.type, "", ""); 
        
        if (action.type == naction_type["MOUSE_ACT"]) {
            ca_logger.Log(2, "ActionCapturer::loop_ - Mouse Action: " + action.click_type + " ctrl: " + action.mouse_ctrl, "", "");

            if (action.mouse_ctrl || (this.is_exception_wnd_(action)) || this.mouse_wheel_) {
                this.executed_ = true;
                action.Execute();
            } else {
                if (this.MouseActionHandler != null) {
                    this.MouseActionHandler(action);
                }
                this.executed_ = false;
            }
            if (this.mouse_wheel_) {
                ShowMouseTip(Translate('NavRecMouseWheel'));
            }
        } else if (action.type == naction_type["KEYBOARD_ACT"]) {
            ca_logger.Log(2, "ActionCapturer::loop_ - Key Action", "", "");

            if (this.KeyActionHandler != null) {
                this.KeyActionHandler(action);
            }
            this.executed_ = false;
        }
        
        GarbageCollect();
    }
    ca_logger.DeWrite(3);
}

ActionCapturer.prototype.is_exception_wnd_ = function(action) {
    ca_logger.Write(3, "ActionCapturer::is_exception_wnd_", "", "");
    this.windows_stack_.Push(action);
    var wnd_class = this.windows_stack_.ClassName();
    if (wnd_class == "TaskListThumbnailWnd" || wnd_class == "BaseBar" || wnd_class == "Shell_TrayWnd") {
        ca_logger.DeWrite(3);
        return true;
    } else {
        ca_logger.DeWrite(3);
        return false;
    }
}
