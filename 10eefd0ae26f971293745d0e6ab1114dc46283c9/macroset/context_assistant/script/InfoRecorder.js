#use(ActionCapturer.js)

function InfoRecorder() {
}

InfoRecorder.prototype = new ActionCapturer;
InfoRecorder.superClass = ActionCapturer.prototype;

InfoRecorder.prototype.config_temp_ = null;
InfoRecorder.prototype.processor_ = null;
InfoRecorder.prototype.analyzer_ = null;
InfoRecorder.prototype.info_ = null;
InfoRecorder.prototype.screen_ = null;
InfoRecorder.prototype.action_ = null;
InfoRecorder.prototype.success_ = false;
InfoRecorder.prototype.windows_stack_ = null;
InfoRecorder.prototype.prev_cntrl_type_ = null;

InfoRecorder.prototype.Record = function(cfgtemp, processor, wins, analyzer) {
    ca_logger.Write(3, "InfoRecorder::Record", "", "");
    
    ShowMouseTip(Translate('AutoBarReRecManual'));
    
    this.MouseActionHandler = this.record_;
    this.KeyActionHandler = this.escape_record_;
    
    AutoEngine.KeyEventCapture = true;
    AutoEngine.MouseEventCapture = true;
    
    this.success_ = false;
    this.config_temp_ = cfgtemp;
    this.processor_ = processor;
    this.analyzer_ = analyzer;
    this.action_ = null;
    this.screen_ = null;
    this.windows_stack_ = wins;
    
    this.Start();
    ca_logger.DeWrite(3);
    return this.success_;
}

InfoRecorder.prototype.GetInfo = function() {
    return this.info_;
}

InfoRecorder.prototype.GetAction = function() {
    return this.action_;
}

InfoRecorder.prototype.GetScreen = function() {
    return this.screen_;
}

InfoRecorder.prototype.SetPrevControlType = function(type) {
    this.prev_cntrl_type_ = type;
    return;
}

InfoRecorder.prototype.record_ = function(action) {
    ca_logger.Write(3, "InfoRecorder::record_", "", "");
    
    var wa_rect = GetWARect();
    if (wa_rect.PtInRect(action.x, action.y)) {
        HideMouseTip();

        this.windows_stack_.Flush();
        AutomationSettings.UseRect = false;
        this.windows_stack_.Push(action);
        
        if (this.executed_ == false && !this.popup_present_(this.prev_cntrl_type_)) {
            this.windows_stack_.BringToForeground();
        }

        Sleep(200);
        if (this.is_current_action_mouse_wheel_(action)) {
			this.create_mouse_wheel_info_();
            this.action_ = action;
            this.screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_temp_.filename);
			this.success_ = true;
			this.mouse_wheel_ = true;
		} else if (this.config_temp_ != null && this.processor_ != null && this.analyzer_ != null) {
            this.action_ = action;
            this.screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_temp_.filename);
            
            if (this.screen_ == null) {
                alert("Unable to screenshot. Please try again.");
                return;
            }
            
            this.processor_.SetProcessorPageParams(this.windows_stack_, false);
            this.processor_.SetScreen(this.screen_);
            this.processor_.SetProcessorCfgParams(this.config_temp_);
            
            this.analyzer_.Flush();
            this.analyzer_.SetConfigTemplate(this.config_temp_);
            this.analyzer_.SetProcessor(this.processor_);
            
            this.info_ = this.analyzer_.AnalyzePoint(action.x, action.y, this.windows_stack_, ANALYZE_POINT_TIMEOUT);
            this.success_ = true;
            
            if (this.info_) {
                this.update_rclick_info_();
            }
        } else {
            ca_logger.Log(1, "Config Template or Processor or Analyzer :: NULL", "", ""); 
        }
		if (!this.mouse_wheel_) {
			this.stop_record_();
		} else {
			this.mouse_wheel_continue_(action);
		}
    } else {
        action.Execute();
    }
    ca_logger.DeWrite(3);
}

InfoRecorder.prototype.mouse_wheel_continue_ = function(action) {
	if (action.type == naction_type["KEYBOARD_ACT"]) {
		if (KeyUtils.KeyName(action.key_code) == "esc") {
			this.mouse_wheel_= false;
		}
	}
}

InfoRecorder.prototype.escape_record_ = function(action) {
    ca_logger.Write(3, "InfoRecorder::escape_record_", "", "");
    
    if (KeyUtils.KeyName(action.key_code) == "esc") {
        this.stop_record_();
    } else {
        action.Execute();
    }
    ca_logger.DeWrite(3);
}
               
InfoRecorder.prototype.stop_record_ = function() {
    ca_logger.Write(3, "InfoRecorder::stop_record_", "", "");
    
    HideMouseTip();
    
    AutoEngine.KeyEventCapture = false;
    AutoEngine.MouseEventCapture = false;
    
    this.Stop();
    ca_logger.DeWrite(3);
}

InfoRecorder.prototype.popup_present_ = function(type) {
    ca_logger.Write(2, "InfoRecorder::popup_present_ type :" + type, "", "");
    
    if( type == "WINComboButtontpcd" ||
        type == "WINButtonCombo" ||
        type == "WINComboEdittpcd" ||
        type == "WINListBox" ||
        type == "WINRightMouse" ) 
    {
        ca_logger.DeWrite(2);
        return true;
    }   
    ca_logger.DeWrite(2);
    return false;
}

InfoRecorder.prototype.update_rclick_info_ = function() {
    if (this.action_.click_type == "rclick") {
        this.info_.SetProperty(ninfo_attributes["SUBTYPE"],"RightMouse");
    }
}

InfoRecorder.prototype.create_mouse_wheel_info_ = function() {
	this.info_ = CreateInfo();
	this.info_.SetProperty(ninfo_attributes["TYPE"], "MouseWheel");
}

InfoRecorder.prototype.is_current_action_mouse_wheel_ = function(action) {
	var ret = false;
	if((action) &&
	   ((action.click_type == "wheel_up") || (action.click_type == "wheel_down"))) 
	{
		ret = true;
	}
	return ret;
}