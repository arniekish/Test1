#use(nautomation_constants.js)
#use(NAutomationState.js)
#use(Screen.js)
#use(automation_params.js)
#use(NavInstantEditor.js)
#use(automation_functions.js)
#use(nhmap.js)
#use(InfoRecorder.js)
#use(keymap_handler.js)
#use(NavSettings.js)
#use(macroset!context_assistant:util.js)

function BaseRecorder() {
}

BaseRecorder.prototype = new keymap_handler;

BaseRecorder.prototype.choose_app_mode_ = SA_BASIC_MODE;
BaseRecorder.prototype.config_file_ = "";
BaseRecorder.prototype.project_type_ = "";
BaseRecorder.prototype.action_queue_ = null;
BaseRecorder.prototype.bar_ = null;
BaseRecorder.prototype.recognition_mode_ = null;
BaseRecorder.prototype.screen_processor_ = null;
BaseRecorder.prototype.screen_analyzer_ = null;
BaseRecorder.prototype.windows_stack_ = null;
BaseRecorder.prototype.config_template_ = null;
BaseRecorder.prototype.producer_rect_ = null;
BaseRecorder.prototype.wa_rect_ = null;
BaseRecorder.prototype.choose_app_params = null;
BaseRecorder.prototype.last_action_ = null;
BaseRecorder.prototype.current_action_ = null;
BaseRecorder.prototype.continue_loop_ = false;
BaseRecorder.prototype.editor_ = null;
BaseRecorder.prototype.click_block_ = false;
BaseRecorder.prototype.curr_screen_ = null;
BaseRecorder.prototype.tar_mac_ = null;
BaseRecorder.prototype.screen_exporter_ = null;
BaseRecorder.prototype.mac_create_params_ = new MacCreateCaParams();
BaseRecorder.prototype.al_v_ = "";
BaseRecorder.prototype.MouseActionHandler = null;
BaseRecorder.prototype.current_info_ = null;
BaseRecorder.prototype.profile_changed_ = false;
BaseRecorder.prototype.is_curr_mouse_wheel_ = false;
BaseRecorder.prototype.is_prev_mouse_wheel_ = false;
BaseRecorder.prototype.config_ = {};
BaseRecorder.prototype.my_trans_arr_ = [];
BaseRecorder.prototype.last_executable_ = null;
BaseRecorder.prototype.top_level_cls_ = [];
BaseRecorder.prototype.settings_ = null;
BaseRecorder.prototype.block_execution_at_start = false;
BaseRecorder.prototype.prev_pagekey_ = "";
BaseRecorder.prototype.executed_ = false;
BaseRecorder.prototype.bubble_minimized_ = false;
BaseRecorder.prototype.ignore_duplicate_page_recording_ = false;
BaseRecorder.prototype.dropdown_merged_ = false;
BaseRecorder.prototype.prev_type_ = null;
BaseRecorder.prototype.combo_identifier_ = null;
BaseRecorder.prototype.info_recorder_ = null;
BaseRecorder.prototype.default_config_file_ = "Standard";
BaseRecorder.prototype.display_warnings_ = true;
BaseRecorder.prototype.project_uid_ = "";
BaseRecorder.prototype.project_title_ = "";
BaseRecorder.prototype.ca_same_screen_ = false;

function RecordApplication() {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordApplication();
    Hook.Disable();
}

function RecordCompatApplication() {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordCompatApplication();
    Hook.Disable();
}

function InsertExplainLong() {
    Hook.Enable(HOOK_INPROC);
    base_rec.InsertExplainLong();
    Hook.Disable();
}

function RecordScreen(arg) {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordScreen(arg);
    Hook.Disable();
}

function RecordInclude() {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordInclude();
    Hook.Disable();
}

function UpdateObject() {
    Hook.Enable(HOOK_INPROC);
    base_rec.UpdateObject();
    Hook.Disable();
}

function RecordScreenSpecializer(arg) {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordScreenSpecializer(arg);
    Hook.Disable();
}

function RecordContextProperty() {
    base_rec.RecordContextProperty();
}

function RecordExplanation(arg, arg1) {
    Hook.Enable(HOOK_INPROC);
    base_rec.RecordExplanation(arg, arg1);
    Hook.Disable();
}

var base_rec = new BaseRecorder();

BaseRecorder.prototype.start = function() {
    Hook.Enable(HOOK_INPROC);
    this.show_choose_app(true, true, true);
}

BaseRecorder.prototype.init = function() {
    this.clean_();
    this.choose_app_mode_ = SA_NAVI_MODE;
    this.config_file_ = "";
    this.project_type_ = "context_assistant";
    if (Project && IsProjectOpened()) {
        this.project_uid_ = Project.UID;
        this.project_title_ = Project.DisplayName;
    }
}

BaseRecorder.prototype.show_choose_app = function(adjust_app, start_state, prepare_rec) {
    var choose_app_params = "{mode : " + this.choose_app_mode_ + "," +
                            " caption : '" + ca_js_encode(Translate('AutoBarChooseApp')) + "'," +
                            " project_type : '" + this.project_type_ + "'," +
                            " orig_project_uid : '" + this.project_uid_ + "'," +
                            " orig_project_title : '" + ca_js_encode(this.project_title_) + "'" +
                            "}";
    
    this.choose_app_params = ShowChooseAppDlg(choose_app_params);

    if (this.choose_app_params.success) {
        if (prepare_rec) {
            this.prepare(adjust_app);
        }
    } else {
        if (start_state) {
            this.bar_.Close();
            this.clean_();
            AutoEngine.ReturnState = CANCEL_STATE;
            SetMainWinForeground();
        }
    }
}

BaseRecorder.prototype.prepare = function(adjust_app) {
    this.last_executable_ = null;
    this.display_warnings_ = this.choose_app_params.diagnosis_result;
    this.create_analyzer_n_processor();
    this.init_members_();
    this.settings_ = new NavSettings();
    this.settings_.Load(this.mode_);
    this.push_app_();
    this.action_queue_ = AutoEngine.GetActionQueue();
    this.action_queue_.Flush();
    this.init_bar_params();
    if (adjust_app && this.settings_.RecBarPos == TOP) {
        this.adjust_appwin_();
    }
    this.set_recording_states();
    this.windows_stack_.Flush();
    if (!ca_select_project_language()) {
        alert(Translate("errLanguageSelection"));
        return;
    }
    this.initialize_keymap();
    this.loop();
}

BaseRecorder.prototype.create_analyzer_n_processor = function() {
    var rec_mode = cfg.standard.winrec.recognition_mode - 0;
    if (this.recognition_mode_ !=  rec_mode || this.screen_processor_ == 0 || this.screen_analyzer_ == 0) {
        this.screen_processor_ = AutoEngine.CreateScreenProcessor(rec_mode);
        this.screen_analyzer_ = AutoEngine.CreateScreenAnalyzer(rec_mode);
        this.screen_analyzer_.Flush();
        this.screen_analyzer_.SetProcessor(this.screen_processor_);
        this.recognition_mode_ = rec_mode;
    }
}

BaseRecorder.prototype.init_members_ = function() {
    this.screen_exporter_ = new Screen(this.windows_stack_);
    this.editor_ = new NavInstantEditor(this.windows_stack_);
    this.windows_stack_ = CreateAutomationWins();
    this.windows_stack_.InsertTopLevelWin("WindowsForms10.Window.8.app.0.370a08c");
    this.top_level_cls_.push("WindowsForms10.Window.8.app.0.370a08c");
    this.config_file_ = this.choose_app_params.config_file;
    this.config_template_ = ConfigTemplateAdmin.OpenConfigTemplate(this.config_file_, this.screen_processor_);
    this.action_queue_ = null;

    this.producer_rect_ = GetMainWinRect();
    this.wa_rect_ = GetWARect();
}

BaseRecorder.prototype.init_bar_params = function() {
    this.bar_.SetScaTemplateFile(this.config_file_);
    this.bar_.Init();

    var common_descrs = ndescriptor_map["common"];
    for (var i in ndescriptor_map) {
        var descrs = ndescriptor_map[i];

        for (var j = 0; j < common_descrs.length; j++) {
            this.bar_.AddDescriptor(i, common_descrs[j]);
        }

        for (var j = 0; j < descrs.length; j++) {
            this.bar_.AddDescriptor(i, descrs[j]);
        }
    }
    this.bar_.ToggleButtonAction(nautomation_bar_buttons["RECORD"]);
    this.bar_.Display(this.settings_.RecBarPos);
}

BaseRecorder.prototype.set_recording_states = function() {
    this.automation_state_ = new NAutomationState(this.bar_, "RECORD", this.windows_stack_);
    this.automation_state_.SetState("INACTIVE");
}

BaseRecorder.prototype.loop = function() {
    Project.StartRecording(Translate('AppAction'));
    this.click_block_ = this.bar_.BlockClicks();
    this.handle_queue();

    AutoEngine.EngineStop();
    Project.StopRecording();
    Hook.Enable(HOOK_NORMAL);
}

BaseRecorder.prototype.handle_queue = function() {
    do {
        this.last_action_ = this.current_action_;
        this.current_action_ = this.action_queue_.Front();
        this.action_queue_.Pop();
        switch(this.current_action_.type) {
            case naction_type["GENERAL_ACT"]        :       this.handle_general_actions();
                                                            break;
    
            case naction_type["MOUSE_ACT"]          :       this.handle_mouse_actions();
                                                            break;
    
            case naction_type["KEYBOARD_ACT"]       :       this.handle_key_actions();
                                                            break;
    
            case naction_type["EFFECT_ADJUSTED_ACT"]:       this.EffectAdjusted();
                                                            break;
                                                        
            case naction_type["CONTROL_CLICKED"]:          this.ApplyEffectChanges();
                                                            break;
        }
    } while(this.continue_loop_);
}

BaseRecorder.prototype.handle_general_actions = function() {
    if (this.is_pause_state_() && this.requires_diagnosis_() && !this.handle_diagnosis_()) {
        return;
    }

    switch(this.current_action_.subtype) {

        case naction_subtype["RECORD"]                   :   this.record();
                                                            break;
                                                            
        case naction_subtype["PAUSE"]                    :   this.pause();
                                                            break;
                                                            
        case naction_subtype["UNDO"]                     :   this.undo();
                                                            break;
                                                            
        case naction_subtype["EXPLANATION"]              :   this.insert_explanation();
                                                            break;
                                                            
        case naction_subtype["TOGGLE_CLICKBLOCK"]        :   this.toggle_block_clicks();
                                                            break;
                                                            
        case naction_subtype["CLOSE"]                    :   this.close();
                                                            break;
                                                            
        case naction_subtype["STOP"]                     :   this.stop();
                                                            break;
                                                            
        case naction_subtype["CHOOSE_APP"]               :   this.choose_app();
                                                            break;
                                                            
        case naction_subtype["CHANGE_PROFILE"]          :   this.change_profiles();
                                                            break;

        case naction_subtype["ON_ORIENTATION_UPDATE"]   :   this.change_orientation();
                                                            break;
    }
}

BaseRecorder.prototype.handle_mouse_actions = function() {
    if (this.is_valid_action()) {
        this.pause_action_capture_();
        if (this.automation_state_.CurrState() == "EXPLANATION_END") {
            this.add_explanation_(false);
            return;
        }
        this.automation_state_.SetState("BUSY");

        var valid_screen = this.record_current_screen_();
        if (valid_screen) {
            var ret = this.update_config_header_(null, this.config_template_);
            if (ret == CANCEL_BTN) {
                this.record();
                return;
            }
            this.bar_.EnableButton(nautomation_bar_buttons["UNDO"], false);
            this.continue_loop_ = true;
            this.fill_object_info();
            this.process_object_info_();
        } else {
            this.record();
        }
    } else {
        this.current_action_.Execute();
    }
}

BaseRecorder.prototype.handle_key_actions = function() {
    if (this.hotkey_validate(this.current_action_)) {
        ca_logger.DeWrite(3);
        return;
    }
    this.handle_keystrokes();
}

BaseRecorder.prototype.handle_keystrokes = function() {
    if (!this.handle_wysiwyg_state_()) {
        this.pause_action_capture_();
        this.automation_state_.SetState("BUSY");
        AutomationSettings.UseRect = false;
        this.windows_stack_.PushForeground();
        this.windows_stack_.BringToForeground();
        var valid_screen = this.record_current_screen_();
        if (valid_screen) {
            var ret = this.update_config_header_(null, this.config_template_);
            if (ret == CANCEL_BTN) {
                this.record();
                return;
            }
            this.bar_.EnableButton(nautomation_bar_buttons["UNDO"], false);
            var key_mac = this.create_keypress_macro_();
            this.wysiwyg_start_(key_mac);
        } else {
            this.record();
        }
    }
}

BaseRecorder.prototype.handle_wysiwyg_state_ = function() {
    if (this.is_wysiwyg_state()) {
        if (this.current_action_.ctrl && KeyUtils.KeyName(this.current_action_.key_code) == "enter") {
            this.apply_bubble_changes(true);
        } else if (KeyUtils.KeyName(this.current_action_.key_code) == "esc") {
            this.discard_bubble_changes(true);
        } else {
            this.current_action_.Execute();
        }
        return true;
    }
    return false;
}

BaseRecorder.prototype.pause = function() {
    if (this.automation_state_.CurrState() == "WYSIWYG_MODE") {
        this.wysiwyg_end_(true);
    }
    this.automation_state_.SetState("PAUSE");
    this.pause_action_capture_();
    AutoEngine.EnableGUIUpdates();
    AutoEngine.EngineStop();
}

BaseRecorder.prototype.record = function() {
    if (this.is_pause_state_()) {
        this.settings_.Load(this.mode_);
        this.bar_.Display(this.settings_.RecBarPos);
        if (this.has_old_wysiwyg_()) {
            this.resume_wysiwyg_();
            return;
        }
    }
    this.windows_stack_.PushForeground();
    this.windows_stack_.BringToForeground();
    this.continue_loop_ = true;
    this.automation_state_.SetState("RECORD");
    AutoEngine.DisableGUIUpdates();
    AutoEngine.EngineStart();
    AutoEngine.ConsumeMouseOver = true;
    AutoEngine.KeyEventCapture = true;
    AutoEngine.MouseEventCapture = true;
    if (this.block_execution_at_start) {
        this.bar_.ToggleButtonAction(nautomation_bar_buttons["CLICK_BLOCKED"]);
        this.block_execution_at_start = false;
    }
}

BaseRecorder.prototype.stop = function() {
    this.automation_state_.SetState("BUSY");
    
    this.automation_state_.SetState("INACTIVE");

    this.pause_action_capture_();

    AutoEngine.ConsumeMouseOver = false;
    AutoEngine.EnableGUIUpdates();
    AutoEngine.EngineStop();

    this.bar_.Close();
    this.clean_();

    SetMainWinForeground();
    
    AutoEngine.ReturnState = STOP_STATE;
}

BaseRecorder.prototype.undo = function() {
}

BaseRecorder.prototype.toggle_block_clicks = function() {
    this.click_block_ = this.bar_.BlockClicks();

    this.windows_stack_.Validate();
    this.windows_stack_.BringToForeground();
}

BaseRecorder.prototype.close = function() {
    this.clean_();
    SetMainWinForeground();
}

BaseRecorder.prototype.choose_app = function() {
    this.pause();
    this.show_choose_app(false, false, true);
}

BaseRecorder.prototype.apply_bubble_changes = function(resume) {
    this.wysiwyg_end_(true);
    this.append_mac_to_prj_();
    if (resume) {
        this.resume_recording_();
    }
}

BaseRecorder.prototype.discard_bubble_changes = function(resume) {
    this.wysiwyg_end_(false);
    this.remove_empty_tourstop_();
    this.reset_special_handlers_();
    if (resume) {
        this.resume_recording_();
    }
}

BaseRecorder.prototype.remove_empty_tourstop_ = function() {
    if (Project.NumTourstops() <= 0) {
        return;
    }
    var curr_ts = Project.CurrentTourstop();
    if (get_act_macro_from_index(curr_ts) == null) {
        Project.DeleteTourstop(curr_ts);
    }
    if (Project.NumTourstops() == 2) {
        Project.DeleteTourstop(1);
        Project.DeleteTourstop(0);
    }
}

BaseRecorder.prototype.prepare_project_steps = function(mac) {

}

BaseRecorder.prototype.adjust_appwin_ = function() {
    var old_rect = this.windows_stack_.GetRect();
    var new_rect = null;

    if (old_rect != null) {
        new_rect = CreateRect(old_rect.left, old_rect.top, old_rect.right, old_rect.bottom);
    }

    var bar_height = this.bar_.Height();
    
    if (new_rect != null) {
        if (this.settings_.RecBarPos == TOP && new_rect.top < bar_height) {
            new_rect.top = bar_height;
        }
        if (new_rect.left < 0) {
            new_rect.left = 0;
        }
    }

    if (this.do_not_adjust_appwin_(old_rect, new_rect)) {
        return;
    }

    if (old_rect != null && new_rect != null &&
        (old_rect.left != new_rect.left || 
         old_rect.top != new_rect.top || 
         old_rect.right != new_rect.right || 
         old_rect.bottom != new_rect.bottom))
    {
        ca_logger.Log(2, "old_rect is different from new_rect", "", ""); 

        if (this.windows_stack_.GetExecutable() == "Desktop" ||
            this.windows_stack_.ClassName() == "WorkerW") {
            ca_logger.DeWrite(2);
            return;
        } else {
            if (this.windows_stack_.GetExecutable() != "pcsws.exe") {
                this.windows_stack_.RestoreWindow();
            }

            if (this.is_special_exec_(this.windows_stack_.GetExecutable())) {
                this.windows_stack_.Resize(new_rect);
            } else if (!this.exempt_resize_exec_(this.windows_stack_.GetExecutable()) && 
                       win_window_resizable(this.windows_stack_) && 
                       this.windows_stack_.IsResizable()) {
                this.windows_stack_.Resize(new_rect);
                this.windows_stack_.BringToForeground();
                Sleep(FOREGROUND_DELAY);
            } else if (!this.windows_stack_.IsResizable()){
                this.handle_non_resizable_windows_(old_rect, bar_height);
            }
        }

        if (!is_taskbar_window(this.windows_stack_)) {
            this.windows_stack_.BringToForeground();
            Sleep(FOREGROUND_DELAY);
        }

        ca_logger.Log(2, "Stretching/adjusting...", "", "");
        var res_rect = this.windows_stack_.GetRect();
        if (res_rect && old_rect.left == res_rect.left &&
            old_rect.top == res_rect.top && old_rect.right == res_rect.right &&
            old_rect.bottom == res_rect.bottom) {
            ca_logger.Log(2, "Size stayed the same...", "", "");
        }
    }
}

BaseRecorder.prototype.push_app_ = function() {
    if (!IsWindowEnabled(this.choose_app_params.hwnd)) {
        this.windows_stack_.PushForeground();
    } else {
        this.windows_stack_.PushHandle(this.choose_app_params.hwnd);
    }
}

BaseRecorder.prototype.wysiwyg_start_ = function(mac) {
    ca_logger.Write(3, "BaseRecorder::wysiwyg_start_", "", "");
    if (!mac) {
        return;
    }

    AutoEngine.MouseEventCapture = false;
    AutoEngine.KeyEventCapture   = true;
    this.editor_.windows_stack_ = this.windows_stack_;
    this.editor_.Init(mac, this.curr_screen_);
    this.editor_.ShowAll();
    this.automation_state_.SetState("WYSIWYG_MODE");
    
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.execute_action_ = function(mac, action, info) {
    if (this.is_explanation_(mac)) {
        return;
    }
    var curr_type = get_from_node_(mac, "element_type");

    if (is_edit(curr_type)) {
        action.Execute();
        if(mac.HasParam("text_d")) {
            if (get_from_node_(mac, "text_d") == PASSWORD_CHAR) {
                this.set_blank_for_password_(mac);
                curr_in_text = "";
            } else {
                curr_in_text = get_from_node_(mac, "text_d");
                if (curr_in_text == "") curr_in_text = " ";
            }

            this.SetValue(curr_in_text, mac, action, info);
        }
    } else {
        action.Execute();
    }
}

BaseRecorder.prototype.SetValue = function(value,mac,action, info) {
    ca_logger.Write(3, "BaseRecorder::SetValue", "", "");
    var type = get_from_node_(mac, "element_type");
    this.screen_processor_.SetProcessorPageParams(this.windows_stack_, false);
    var do_synthesis = true;

    if (info && !(info.GetProperty(ninfo_attributes["DIRECT_SYNTHESIS"]) == "1")) {
        do_synthesis = !this.screen_processor_.SetValue(get_from_node_(mac, "path"), value, this.windows_stack_, 3000);

        if (type == "WINListBox") do_synthesis = false;
    }

    if (do_synthesis) {
        action.Execute();
        Sleep(DELAY);
        if (type == "WINMLEdit") {
            synthesize_string_ex(value, true);
        } else {
            synthesize_string(value, true);
        }
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.update_scroll_text_ = function(prev_mac,curr_mac) {
    CopyResource(curr_mac.GetResource(), prev_mac.GetResource());

    if (prev_mac.HasParam("fieldicon") && get_from_node_(curr_mac, "fieldicon") == "") {
        update_node_(prev_mac, "fieldicon", "");
    }

    var fieldname = "";
    fieldname = get_from_node_(curr_mac, "fieldname");

    var infotxt = ch_get_infotxt("WINScroll");
    var expl = infotxt.prac + " <b>" + fieldname + "&nbsp;$I{fieldicon}</b>";
    update_node_(prev_mac, "explanation_d", expl);
}

BaseRecorder.prototype.SavePrjContext = function() {
    if (!Project || !IsProjectOpened()) {
        return;
    }
    var waprj = Project.GetWAProject();
    if (waprj) {
        var ctx_config = this.screen_processor_.GetCtxConfig(this.windows_stack_, GET_PAGEKEY_TIMEOUT);
        if (waprj.ContextId == "") {
            waprj.ContextId = ctx_config;
        } else {
            ctx_config += waprj.ContextId; 
        }
        this.evaluate_string_(ctx_config);
        this.SetPrjContext();
    }
}

BaseRecorder.prototype.evaluate_string_ = function(str) {
    ca_logger.Write(3, "BaseRecorder::evaluate_string_", "", "");
    var temp = [];
    var key = "";
    var value = "";
    var res_2 = [];
    var elem = [];
    var res = str.split(",");
    
    for (var i = 0; i < res.length; i++) {
        res_2 = res[i].split("=");
        temp.push(res_2);
    }
    
    for (var len = 0; len < temp.length; len++) {
        elem = temp[len];
        key = elem[0];
        value = elem[1];
        
        if ((key != "") && (value != "")) {
            if (this.size_of_map(this.config_) == 0) {
                this.config_[key] = [];
                this.config_[key].push(value);
            } else {
                if ((key in this.config_)) {
                    var add = true;
                    for (var i = 0; i < this.config_[key].length; i++) {
                        if (value == this.config_[key][i]) {
                            add = false;
                            break;
                        }
                    }
                    if (add) {
                        this.config_[key].push(value);
                    }
                } else {
                    this.config_[key] = [];
                    this.config_[key].push(value);
                }
            }
        }
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.SetPrjContext = function(config) {
    var waprj = Project.GetWAProject();
    waprj.ContextId = this.process_to_string_(this.config_);
    waprj.ContextId = html_encode(waprj.ContextId);
    this.config_ = {};
}

BaseRecorder.prototype.process_to_string_ = function(config) {
    var txt = "";
    for (var x in config) {
        for (var i=0; i<config[x].length; i++) {
            if (txt.length != 0) {
                txt=txt + ",";
            }
            txt=txt + x + "=" + config[x][i] ;
        }
    }
    return txt;
}

BaseRecorder.prototype.size_of_map = function(map) {
    var count = 0;
    for (var key in map) {
        count++ ;
    }
    return count;
}

BaseRecorder.prototype.change_profiles = function() {
    if (this.has_profile_changed_()) {
        this.display_warnings_ = true;
        this.profile_changed_ = true;
        this.config_file_ = this.bar_.ScaTemplateFile();
        this.config_template_ = ConfigTemplateAdmin.OpenConfigTemplate(this.config_file_, this.screen_processor_);
        this.handle_diagnosis_();
    }
}

BaseRecorder.prototype.set_profiles_from_collection_ = function() {
    if (this.profile_changed_) {
        return;
    }
    if (this.is_last_control_exceptional_()) {
        this.windows_stack_.Push(this.current_action_);
        return;
    }

    var win_changed = this.has_application_changed_();
    var exec_changed = this.has_executable_changed_();
    if (exec_changed) {
        this.display_warnings_ = true;
    }

    this.update_window_handle_();

    if (win_changed || exec_changed) {
        if (!this.is_taskbar_window(this.windows_stack_)) {
            this.windows_stack_.BringToForeground();
            Sleep(FOREGROUND_DELAY);
        }
        var config_files = ConfigTemplateAdmin.GetConfigFiles(this.windows_stack_);
        var interesting_cfgs = this.get_max_score_cfgs_(config_files);
        if (interesting_cfgs.length != 0) {
            if (!this.is_current_cfg_max_(interesting_cfgs)) {
                this.config_file_ = config_files[config_files.length - 1].cfg_file;
            }
        } else {
            this.config_file_ = this.default_config_file_;
        }
    }
    this.bar_.SetScaTemplateFile(this.config_file_);
}

BaseRecorder.prototype.is_current_cfg_max_ = function(cfgs) {
    var found = false;
    if (cfgs.length > 1) {
        for (var i = 0; i < cfgs.length; i++) {
            if (this.config_file_ == cfgs[i].cfg_file) {
                found = true;
                break;
            }
        }
        
    }
    return found;
}

BaseRecorder.prototype.get_max_score_cfgs_ = function(config_files) {
    if (config_files.length <= 0) {
        return [];
    }
    var interesting_cfgs = [];
    var last_index = config_files.length - 1;
    var max_score = config_files[last_index].score;
    if (max_score > 0) {
        interesting_cfgs.push(config_files[last_index]);
        for (var i = last_index - 1; i >= 0; i--) {
            if (config_files[i].score != max_score) {
                break;
            }
            interesting_cfgs.push(config_files[i]);
        }
    }
    return interesting_cfgs;
}

BaseRecorder.prototype.insert_explanation = function() {
    var ret = this.update_config_header_(null, this.config_template_);
    this.windows_stack_.BringToForeground();
    Sleep(FOREGROUND_DELAY);
    if (ret == CANCEL_BTN) {
        return;
    }
    this.create_explanation_info_();
    this.add_explanation_(true);
}

BaseRecorder.prototype.create_explanation_macro_ = function() {
    AutomationSettings.UseRect = false;
    var screen = this.windows_stack_.CaptureCurrentScreen(this.config_template_.filename);
    var type = nav_elem_xtype(this.current_info_);
    var hdl_obj = nhmap[type];
    if (hdl_obj != null) {
        return this.get_initial_macro_(hdl_obj, screen, type, this.current_info_);
    }
    return null;
}

BaseRecorder.prototype.handle_no_recognition_ = function() {
    this.automation_state_.SetState("NO_RECOGNITION");
    var create_explanation = this.show_no_recognition_dlg_();
    if (create_explanation) {
        this.show_expl_at_curr_pos_();
    } else {
        this.resume_from_no_recognition_state_();
    }
}

BaseRecorder.prototype.is_explanation_ = function(mac) {
    return (mac.Template() == "explanation_long");
}

BaseRecorder.prototype.get_rel_position_ = function(show_direct) {
    var pt = CreatePoint(this.current_action_.x, this.current_action_.y);
    this.windows_stack_.Push(this.current_action_);
    var rect = this.windows_stack_.GetRect();
    if (show_direct) {
        pt.x = (rect.right - rect.left) / 2;
        pt.y = (rect.bottom - rect.top) / 2;
        return pt;
    }

    if (rect != null) {
        pt.x = pt.x - rect.left;
        pt.y = pt.y - rect.top;
    }
    return pt;
}

BaseRecorder.prototype.set_rel_position_ = function(mac, show_direct) {
    var pt = this.get_rel_position_(show_direct);
    update_node_(mac, "click_pos_rel", pt);
}

BaseRecorder.prototype.get_initial_macro_ = function(hdl_obj, screen, type, info) {
    this.screen_exporter_.Init();
    this.screen_exporter_.SetScreenDump(screen);

    this.mac_create_params_.Init();
    this.mac_create_params_.SetParams(type, info, this.current_action_, this.screen_exporter_, this.current_action_, -1, this.windows_stack_, null);
    
    var pagekey = this.get_current_sc_();
    if (pagekey) {
        this.tar_mac_ = Project.CreateMacro("define_target");
        nav_update_target(this.tar_mac_, pagekey, this.config_file_, this.config_template_.revision, this.curr_screen_, -1, null, this.curr_screen_.title, this.windows_stack_.GetExecutable());
    }
    return (hdl_obj.handler(this.mac_create_params_));
}

BaseRecorder.prototype.check_mouse_wheel_ = function() {
    this.is_prev_mouse_wheel_ = this.is_curr_mouse_wheel_;
    if (this.current_action_.click_type == "wheel_up" || this.current_action_.click_type == "wheel_down") {
        this.is_curr_mouse_wheel_ = true;
    } else {
        this.is_curr_mouse_wheel_ = false;
    }
}

BaseRecorder.prototype.append_mac_to_prj_ = function() {
    this.automation_state_.SetState("BUSY");
    if (this.dropdown_merged_) {
        Project.AppendEvent(this.editor_.mac_);
        this.dropdown_merged_ = false;
        this.combo_identifier_.Cleanup();
        this.combo_identifier_ = null;
    } else {
        this.prepare_project_steps(this.editor_.mac_);
    }
}

BaseRecorder.prototype.resume_recording_ = function() {
    if (this.valid_wysiwyg_bubble_()) {
        return;
    }
    Hook.Enable(HOOK_INPROC);
    this.editor_.mac_ = null;
    this.automation_state_.SetState("RECORD");
    this.record();
    this.continue_loop_ = true;
    this.bar_.EnableButton(nautomation_bar_buttons["UNDO"], (Project.NumTourstops() > 2));
}

BaseRecorder.prototype.update_macro_from_live_ = function(mac) {
    if (check_editable_type_(mac)) {
        var live_value = this.screen_processor_.GetValue(get_from_node_(mac, "path"), this.windows_stack_, GET_VALUE_TIMEOUT);
        if (get_from_node_(mac, "element_type") == "WINListBox") {
            this.update_listbox_live_(mac,live_value);
        }
        if (is_edit(get_from_node_(mac, "element_type"))) {
            this.update_edit_live_(mac, live_value);
        }
        if (get_from_node_(mac, "explanation_d_modified")) {
            return;
        }
        var infotext = nav_get_infotxt(mac, get_from_node_(mac, "element_type"), get_from_node_(mac, "action"), this.current_action_);
        nav_set_msg_param(mac, infotext);
    }
}

BaseRecorder.prototype.update_listbox_live_ = function(mac, live_value) {
    var selected_item = get_selected_item(live_value);
    update_node_(mac, "choose_text", selected_item);
    update_node_(mac, "choose_nr", get_dditem_index(live_value, selected_item));
}

BaseRecorder.prototype.update_edit_live_ = function(mac, live_value) {
    var type = get_from_node_(mac, "element_type");
    if (type == "WINMLEdit" && mac.HasParam("text_full")) {
        update_node_(mac, "text_full", live_value);
    }
    update_node_(mac, "text_d", live_value)
}

BaseRecorder.prototype.fill_info_recorder_ = function() {
    this.info_recorder_ = new InfoRecorder();
    this.info_recorder_.config_temp_ = this.config_template_;
    this.info_recorder_.processor_ = this.screen_processor_;
    this.info_recorder_.analyzer_ = this.screen_analyzer_;
    this.info_recorder_.windows_stack_ = this.windows_stack_;
    this.info_recorder_.SetPrevControlType(this.prev_cntrl_type_);
}

BaseRecorder.prototype.clean_ = function() {
    this.config_file_ = "";
    this.project_type_ = "";
    this.action_queue_ = null;
    this.bar_ = null;
    this.recognition_mode_ = null;
    this.screen_processor_ = null;
    this.screen_analyzer_ = null;
    this.windows_stack_ = null;
    this.config_template_ = null;
    this.producer_rect_ = null;
    this.wa_rect_ = null;
    this.choose_app_params = null;
    this.last_action_ = null;
    this.current_action_ = null;
    this.continue_loop_ = false;
    this.editor_ = null;
    this.click_block_ = false;
    this.curr_screen_ = null;
    this.tar_mac_ = null;
    this.screen_exporter_ = null;
    this.mac_create_params_ = new MacCreateCaParams();
    this.al_v_ = "";
    this.MouseActionHandler = null;
    this.current_info_ = null;
    this.profile_changed_ = false;
    this.is_curr_mouse_wheel_ = false;
    this.is_prev_mouse_wheel_ = false;
    this.config_ = {};
    this.my_trans_arr_ = [];
    this.last_executable_ = null;
    this.top_level_cls_ = [];
    this.block_execution_at_start = false;
    this.prev_pagekey_ = "";
    this.prev_type_ = "";
    this.combo_identifier_ = null;
    this.info_recorder_ = null;
    this.executed_ = false;
    this.bubble_minimized_ = false;
    this.ignore_duplicate_page_recording_ = false;
    this.dropdown_merged_ = false;
    this.display_warnings_ = true;
    this.project_uid_ = "";
    this.project_title_ = "";
    this.ca_same_screen_ = false;
}

BaseRecorder.prototype.copy_resource_ = function(source_mac, dest_mac) {
    CopyResource(source_mac.GetResource(), dest_mac.GetResource());

    update_from_node_(dest_mac, "element_type", source_mac);

    update_from_node_(dest_mac, "fieldname", source_mac);

    update_from_node_(dest_mac, "click_pos", source_mac);

    update_from_node_(dest_mac, "path", source_mac);

    update_from_node_(dest_mac, "text_d", source_mac);

    update_from_node_(dest_mac, "choose_text", source_mac);

    update_from_node_(dest_mac, "all_values", source_mac);

    update_from_node_(dest_mac, "fieldicon", source_mac);

    update_from_node_(dest_mac, "screenshot_rect", source_mac);

    update_from_node_(dest_mac, "action", source_mac);

    update_from_node_(dest_mac, "key_desc", source_mac);
}

BaseRecorder.prototype.get_current_sc_ = function() {
    ca_logger.Write(3, "BaseRecorder::get_current_sc_", "", "");
    
    this.windows_stack_.PushForeground();
    this.curr_screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_file_);

    if (this.curr_screen_ != null) {
        this.screen_processor_.SetScreen(this.curr_screen_);
        this.screen_analyzer_.Flush();
        this.screen_analyzer_.SetConfigTemplate(this.config_template_);
        this.screen_processor_.SetProcessorCfgParams(this.config_template_);
        this.screen_analyzer_.SetProcessor(this.screen_processor_);
        this.SavePrjContext();
        var pagekey = this.screen_analyzer_.GetPageKey(this.windows_stack_, GET_PAGEKEY_TIMEOUT);
        if (pagekey != "") {
            ca_logger.DeWrite(3);
            return pagekey;
        } else {
            alert(Translate("errExtractPagekey") + this.config_file_);
        }
    } else {
        alert(Translate("errScreenshot"));
    }
    ca_logger.DeWrite(3);
    return null;
}

BaseRecorder.prototype.create_explanation_info_ = function() {
    this.current_info_ = CreateInfo();
    this.current_info_.SetProperty(ninfo_attributes["SUBTYPE"], "#explanation_l");
}

BaseRecorder.prototype.add_explanation_ = function(show_direct) {
    var expl_mac = this.create_explanation_macro_();
    this.set_rel_position_(expl_mac, show_direct);
    this.wysiwyg_start_(expl_mac);
}

BaseRecorder.prototype.create_keyboard_info_ = function() {
    this.current_info_ = CreateInfo();
    this.current_info_.SetProperty(ninfo_attributes["TYPE"], "KeyPress");
}

BaseRecorder.prototype.wysiwyg_end_ = function(save_bubble_changes) {
    this.editor_.HideAll(save_bubble_changes);
    this.update_macro_from_live_(this.editor_.mac_);
}

BaseRecorder.prototype.is_pause_state_ = function() {
    return (this.automation_state_.CurrState() == "PAUSE");
}

BaseRecorder.prototype.has_old_wysiwyg_ = function() {
    return (this.editor_ && this.editor_.mac_ != null);
}

BaseRecorder.prototype.resume_wysiwyg_ = function() {
    this.wysiwyg_start_(this.editor_.mac_);
    this.bar_.EnableButton(nautomation_bar_buttons["STOP"], false);
    this.bar_.EnableButton(nautomation_bar_buttons["CHOOSE_APPL"], false);
    this.bar_.EnableButton(nautomation_bar_buttons["CLICK_BLOCKED"], false);
}

BaseRecorder.prototype.show_expl_at_curr_pos_ = function() {
    this.automation_state_.SetPrevState();
    this.windows_stack_.BringToForeground();
    Sleep(FOREGROUND_DELAY);
    this.create_explanation_info_();
    this.add_explanation_(false);
}

BaseRecorder.prototype.resume_from_no_recognition_state_ = function() {
    this.automation_state_.SetState("RECORD");
    this.record();
}

BaseRecorder.prototype.show_no_recognition_dlg_ = function() {
    var dlg = CreateWizard();
    dlg.SetCaption(Translate("record_control"));
    dlg.SetSize(400, 50);

    dlg.AddWizardButton(EXPL_BTN, Translate("wizAddExplanation"),true,100);
    dlg.AddWizardButton(OK_BTN, Translate("wizCancel"));
    dlg.AddTextSection(Translate("no_control"), 1);
    return (dlg.Show(this.windows_stack_) == EXPL_BTN);
}

BaseRecorder.prototype.pause_action_capture_ = function() {
    AutoEngine.KeyEventCapture = false;
    AutoEngine.MouseEventCapture = false;
}

BaseRecorder.prototype.is_wysiwyg_state = function() {
    return (this.automation_state_.CurrState() == "WYSIWYG_MODE");
}

BaseRecorder.prototype.do_not_process_action = function() {
    return (this.current_action_ && this.current_action_.mouse_ctrl);
}

BaseRecorder.prototype.is_valid_action = function() {
    return (this.wa_rect_.PtInRect(this.current_action_.x, this.current_action_.y) && 
            !this.is_wysiwyg_state() &&
            !this.do_not_process_action());
}

BaseRecorder.prototype.change_orientation = function() {
    if (this.editor_) {
        this.editor_.UpdateOrientation();
    }
}

BaseRecorder.prototype.EffectAdjusted = function() {
    if (this.editor_) {
        this.editor_.EffectAdjusted(this.current_action_.bubble_id);
    }
}

BaseRecorder.prototype.ApplyEffectChanges = function() {
    if (this.current_action_.action_id == APPLY_CHANGES) {
        this.apply_bubble_changes(true);
    } else if (this.current_action_.action_id == DISCARD_CHANGES) {
        this.discard_bubble_changes(true);
    }
}

BaseRecorder.prototype.has_executable_changed_ = function() {
    var is_same = true;

    var curr_executable = this.current_action_.executable;

    if (this.last_executable_) {
        is_same = (curr_executable == this.last_executable_) ||
                  (curr_executable == "csrss.exe") ||
                  (curr_executable == "") ||
                          (this.last_executable_ == "") ||
                          (this.last_executable_ == "csrss.exe" ||
                  (this.last_executable_ == "Desktop" && this.current_action_.wnd_class == "WorkerW")); //HACK for windows 7 Desktop
    }

    this.last_executable_ = curr_executable;
    return !is_same;
}

BaseRecorder.prototype.update_window_handle_ = function() {
    var prev_cls = this.windows_stack_.ClassName();

    this.windows_stack_.Push(this.current_action_);

    //HACK for word + plugin
    var cls = this.windows_stack_.ClassName();

    if (cls == "TMFrameClass" ||
        (prev_cls != cls &&
        (this.is_top_level_cls_(prev_cls) ||
         this.is_top_level_cls_(cls))))
    {
            this.windows_stack_.BringToForeground();
            Sleep(FOREGROUND_DELAY);
    }
}

BaseRecorder.prototype.has_application_changed_ = function() {
    this.windows_stack_.Validate();
    return this.windows_stack_.ApplicationChanged(this.current_action_);
}

BaseRecorder.prototype.is_taskbar_window = function(windows_stack) {
    return this.is_taskbar(windows_stack.ClassName());
}

BaseRecorder.prototype.is_taskbar = function(wnd_class) {
    return (wnd_class == "TaskListThumbnailWnd" ||
            wnd_class == "BaseBar" ||
            wnd_class == "Shell_TrayWnd");
}

BaseRecorder.prototype.is_top_level_cls_ = function(cls) {
    for (var i = 0; i < this.top_level_cls_.length; i++) {
        if (this.top_level_cls_[i] == cls) {
            return true;
        }
    }

    return false;
}

BaseRecorder.prototype.do_diagnosis_ = function() {
    return Diagnosis(this.bar_.Hwnd(), this.windows_stack_, this.config_template_, this.display_warnings_, true, "context_assistant", this.project_uid_, this.project_title_);
}

BaseRecorder.prototype.handle_diagnosis_error_ = function(cmm, after_diagnosis) {
    this.automation_state_.SetPrevState();
    this.bar_.EnableProfileCombo(BAR_PROFILES, false);

    AutoEngine.ConsumeMouseMoves = cmm;
    this.windows_stack_.BringToForeground();

    if (this.config_template_ == null) {
        this.abort_();
    }
    this.bar_.SetButtonState(RECORD_BTN_ID, true);
}

BaseRecorder.prototype.handle_diagnosis_ = function() {
    var result = false;
    var diagnosis_res = this.do_diagnosis_();
    if (diagnosis_res == D_WARN && !this.display_warnings_) {
        return true;
    }
    if (diagnosis_res != D_SUCCESS) {
        var old_keyevent_capture = AutoEngine.KeyEventCapture;
        var old_mouseevent_capture = AutoEngine.MouseEventCapture
        AutoEngine.KeyEventCapture = false;
        AutoEngine.MouseEventCapture = false;
        AutoEngine.ConsumeMouseOver = false;

        this.bar_.EnableProfileCombo(BAR_PROFILES, false);
        this.automation_state_.SetState("DIAGNOSIS");

        var wnd = this.windows_stack_.IsEmpty() ? 0 : this.windows_stack_.Hwnd();
        var choose_app_params = "{mode : " + SA_CHOOSE_APP_MODE + "," +
                                " caption : '" + ca_js_encode(Translate('diagnosis_dlg.caption')) + "'," +
                                " project_type : 'context_assistant'," +
                                " orig_project_uid : '" + this.project_uid_ + "'," +
                                " orig_project_title : '" + ca_js_encode(this.project_title_) + "'," +
                                " only_diagnosis : true," +
                                " diagnosis_wnd : '" + wnd + "'" +
                                "}";
    
        var params = ShowChooseAppDlg(choose_app_params);

        result = this.process_diagnosis_res_(diagnosis_res, params);

        AutoEngine.KeyEventCapture = old_keyevent_capture;
        AutoEngine.MouseEventCapture = old_mouseevent_capture;
    } else {
        result = true;
        this.windows_stack_.BringToForeground();
        Sleep(FOREGROUND_DELAY);
    }
    return result;
}

BaseRecorder.prototype.process_diagnosis_res_ = function(diagnosis_res, params) {
    var result = false;
    if (params.success) {
        if (diagnosis_res == D_WARN) {
            this.display_warnings_ = false;
        }
        this.automation_state_.SetPrevState();
        this.bar_.EnableProfileCombo(BAR_PROFILES,true);
        var changed_profile = (params.config_file != this.bar_.ScaTemplateFile());
        if (changed_profile) {
            this.bar_.SetScaTemplateFile((params.config_file == "") ? this.bar_.ScaTemplateFile() : params.config_file);
            this.config_file_ = this.bar_.ScaTemplateFile();
            this.config_template_ = ConfigTemplateAdmin.OpenConfigTemplate(this.config_file_, this.screen_processor_);
            this.update_screen_macro_(false);
            this.profile_changed_ = true;
        }
        result = true;
    } else {
        if (diagnosis_res == D_ERROR) {
            this.handle_diagnosis_error_(false, true);
            this.pause();
        }
        result = false;
    }
    this.bar_.EnableProfileCombo(BAR_PROFILES,true);
    return result;
}

BaseRecorder.prototype.is_last_control_exceptional_ = function() {
    if (this.current_info_ != null) {
        var prev_type = nav_elem_xtype(this.current_info_);
        if (prev_type == "WINComboButtontpcd" ||
            prev_type == "WINButtonCombo" ||
            prev_type == "WINComboEdittpcd" ||
            prev_type == "WINListBox") {
            return true;
        }
    }
    return false;
}

BaseRecorder.prototype.abort_ = function() {

    AutoEngine.EnableGUIUpdates();
    AutoEngine.EngineStop();

    AutoEngine.KeyEventCapture = false;
    AutoEngine.MouseEventCapture = false;
    AutoEngine.ConsumeMouseOver = false;

    this.bar_.Close();
    this.clean_();
    this.automation_state_.SetState("INACTIVE");
    this.analyzer_.Flush();

    this.create_analyzer_n_processor();
    this.bar_.SetButtonState(RECORD_BTN_ID, true);
    AutoEngine.ReturnState = CANCEL_STATE;
}

BaseRecorder.prototype.update_screen_macro_ = function (create_scr_mac) {
    this.screen_analyzer_.SetConfigTemplate(this.config_template_);
    this.screen_processor_.SetProcessorCfgParams(this.config_template_);
    this.screen_analyzer_.SetProcessor(this.screen_processor_);

    var pagekey = this.screen_analyzer_.GetPageKey(this.windows_stack_, GET_PAGEKEY_TIMEOUT);
    var executable = this.windows_stack_.GetExecutable();
    if (pagekey != "") {
        if (create_scr_mac) {
            this.tar_mac_ = Project.CreateMacro("define_target");
        }
        nav_update_target(this.tar_mac_, pagekey, this.config_file_, this.config_template_.revision, this.curr_screen_, -1, null, this.curr_screen_.title, executable);
        return true;
    } else {
        alert(Translate("errExtractPagekey") + this.config_file_);
    }
    return false;
}

BaseRecorder.prototype.has_profile_changed_ = function() {
    return (this.config_file != this.bar_.ScaTemplateFile());
}

BaseRecorder.prototype.hotkey_explanation = function() {
    this.insert_explanation();
    return true;
}

BaseRecorder.prototype.hotkey_pause = function() {
    this.pause();
    this.bar_.ToggleButtonAction(nautomation_bar_buttons["RECORD"]);
    return true;
}

BaseRecorder.prototype.hotkey_toggle_mouse_execution = function() {
    this.bar_.ToggleButtonAction(nautomation_bar_buttons["CLICK_BLOCKED"]);
    return true;
}

BaseRecorder.prototype.hotkey_undo = function() {
    this.undo();
    return true;
}

BaseRecorder.prototype.hotkey_stop = function() {
    this.stop();
    return true;
}

BaseRecorder.prototype.hotkey_choose_application = function() {
    this.pause();
    this.bar_.ToggleButtonAction(nautomation_bar_buttons["RECORD"]);
    this.choose_app();
    return true;
}

BaseRecorder.prototype.is_special_exec_ = function(exec) {
    var special_execs = ["nwbcclient.exe", "nwbc.exe", "webirichclient.exe"];

    for (var i = 0; i < special_execs.length; i++) {
        if (exec == special_execs[i]) {
            return true;
        }
    }
    return false;
}

BaseRecorder.prototype.handle_non_resizable_windows_ = function(app_rect, bar_height) {
    var rec_rc = this.wa_rect_;
    rec_rc.top += bar_height;
    if (app_rect.left < rec_rc.left ||
        app_rect.top < rec_rc.top ||
        app_rect.right > rec_rc.right ||
        app_rect.bottom > rec_rc.bottom)
    {
        var left = rec_rc.left + ((rec_rc.right - rec_rc.left) / 2) - ((app_rect.right - app_rect.left) / 2);
        var right = left + app_rect.width;
        var top = rec_rc.top + ((rec_rc.bottom - rec_rc.top) / 2) - ((app_rect.bottom - app_rect.top) / 2);
        var bottom = top + app_rect.height;

        var rc = CreateRect(left, top, right, bottom);
        this.windows_stack_.Resize(rc);
    }
    this.windows_stack_.BringToForeground();
    Sleep(FOREGROUND_DELAY);
}

BaseRecorder.prototype.exempt_resize_exec_ = function(exec) {
    if (exec == "sapguiserver.exe") {
        return true;
    }
    return false;
}

BaseRecorder.prototype.do_not_adjust_appwin_ = function(old_rect, new_rect) {
    return ((!this.windows_stack_.IsResizable() || !win_window_resizable(this.windows_stack_)) &&
        !this.is_special_exec_(this.windows_stack_.GetExecutable()) &&
        old_rect != null &&
        new_rect != null &&
        old_rect.left == new_rect.left &&
        old_rect.top == new_rect.top &&
        (!this.windows_stack_.IsResizable() ||
        !win_window_resizable(this.windows_stack_) ||
        (old_rect.bottom - new_rect.bottom) <= 2) &&
        !this.is_special_exec_(this.windows_stack_.GetExecutable()));
}

BaseRecorder.prototype.handle_merged_dropdown_ = function(nmac) {
    this.dropdown_merged_ = true;
    this.update_macro_from_live_(nmac);
    this.wysiwyg_start_(nmac);
}

BaseRecorder.prototype.valid_wysiwyg_bubble_ = function() {
    return (this.editor_ && this.editor_.bubble_ != null);
}

BaseRecorder.prototype.set_mac_props_from_info_ = function(info, mac) {
    var val_ = info.GetProperty(ninfo_attributes["VALUE"]);
    this.is_passwd_ = info.GetProperty(ninfo_attributes["PASSWORD"]) == "1" ? true : false;
    update_node_(mac, "text_d", val_);
     
    if (mac.HasParam("element_type")) {
        update_node_(mac, "b_minimized", this.bubble_minimized_);
        var el_type = get_from_node_(mac, "element_type");
        if (is_combo_type(el_type)) {
            this.al_v_ = info.GetProperty(ninfo_attributes["ALLVALUES"]);
        } else if (el_type == "WINCBListItem") {
            var all_values = info.GetProperty(ninfo_attributes["ALLVALUES"]);
            this.al_v_ =  (all_values != "") ? all_values : this.al_v_;
        }
    }
    this.set_rel_position_(mac);
}

BaseRecorder.prototype.is_select_single_candidate_ = function(type,prev_mac) {
    if (is_dropdown(type.prev) && (prev_mac.Template() != "select_single")
        && (type.curr == "WINCBListItem" || is_menu(type.curr))) {
        return true;
    }
    return false;
}

BaseRecorder.prototype.fill_object_info = function() {
    this.fill_info_recorder_();
    this.info_recorder_.record_(this.current_action_);
    this.current_info_ = this.info_recorder_.GetInfo();
}

BaseRecorder.prototype.process_object_info_ = function() {
    if (this.current_info_ != null) {
        var mac = this.prepare_macro_(this.current_info_, this.info_recorder_.GetScreen());
        if (mac != null) {
            this.show_editable_bubble_(mac);
        } else {
            this.handle_no_recognition_();
        }
    } else {
        this.handle_no_recognition_();
    }
}

BaseRecorder.prototype.prepare_macro_ = function(info, screen) {
    this.update_info_(info);
    this.check_special_actions_();
    var mac = null;
    var handler = this.get_handler_object_(info);
    if (handler.obj != null) {
        mac = this.get_initial_macro_(handler.obj, screen, handler.type, info);
        if (this.ignore_duplicate_page_recording_) {
            mac = null;
            this.resume_recording_();
            return;
        }
        this.fill_macro_(info, mac);
    }
    return mac;
}

BaseRecorder.prototype.fill_macro_ = function(info, mac) {
    this.set_mac_props_from_info_(info, mac);
}

BaseRecorder.prototype.get_handler_object_ = function(info) {
    var type = nav_elem_xtype(info);
    return {obj : nhmap[type], type : type};
}

BaseRecorder.prototype.check_special_actions_ = function() {
    this.check_mouse_wheel_();
}

BaseRecorder.prototype.handle_special_types_ = function(type) {
    this.click_block_ = is_list_combo_type(type) ? false : this.bar_.BlockClicks();
}

BaseRecorder.prototype.update_info_ = function(info) {
    combo_check(info);
}

BaseRecorder.prototype.show_editable_bubble_ = function(mac) {
    var type = get_from_node_(mac, "element_type");
    this.handle_special_types_(type);
    this.handle_execute_first_ctrls_(type);
    this.handle_ctrl_types_(type, mac);
    this.prev_type_ = type;
}

BaseRecorder.prototype.handle_ctrl_types_ = function(type, mac) {
    this.combo_identifier_ = new ComboIdentifier(type, this.prev_type_);
    switch(this.combo_identifier_.GetComboType()) {
        case LISTBOX_COMBO  :   this.current_action_.Execute();
                                this.executed_ = true;

        case CLASSIC_COMBO  :   this.editor_.mac_ = mac;
                                this.append_mac_to_prj_();
                                break;

        case NO_COMBO       :   this.wysiwyg_start_(mac);
                                break;
    }
}

BaseRecorder.prototype.handle_execute_first_ctrls_ = function(type) {
    if (is_list(type) || is_menu(type) || is_edit(type)) {
        this.current_action_.Execute();
        this.executed_ = true;
    }
}

BaseRecorder.prototype.reset_special_handlers_ = function() {
    this.combo_identifier_ = null;
    this.executed_ = false;
    this.click_block_ = this.bar_.BlockClicks();
    this.prev_type_ = null;
    this.dropdown_merged_ = false;
    this.prev_pagekey_ = "";
    this.tar_mac_ = null;
}

BaseRecorder.prototype.requires_diagnosis_ = function() {
    return (this.current_action_.subtype == naction_subtype["CHOOSE_APP"] ||
            this.current_action_.subtype == naction_subtype["OPTIONS"] ||
            this.current_action_.subtype == naction_subtype["RECORD"] ||
            this.current_action_.subtype == naction_subtype["STOP"]);
}

BaseRecorder.prototype.create_app_context_ = function(update_hdr) {
    var curr_ts = Project.CurrentTourstop();
    var executable = this.windows_stack_.GetExecutable();
    var appmac = get_app_context(executable);
    
    if (appmac == null) {
        this.profile_changed_ = false;

        appmac = Project.CreateMacro("application_context");

        update_node_(appmac, "macro_comment", executable);
        update_node_(appmac, "display_name", executable);
        update_node_(appmac, "executable", executable);
        
        if (update_hdr) {
            create_header(appmac, this.config_template_);
        }

        set_appcontextns_current();

        Project.AppendEvent(appmac);
    } else if (update_hdr) {
        update_header(appmac, this.config_template_);
    }
    Project.SetCurrentTourstop(curr_ts);
}

BaseRecorder.prototype.RecordApplication = function() {
    ca_logger.Write(0, "BaseRecorder::RecordApplication", "", "");
    if (!this.pre_app_recording_(SA_BASIC_MODE)) {
        ca_logger.DeWrite(0);
        return;
    }
    
    var executable = this.windows_stack_.GetExecutable();
    if (executable == "") {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }
    var created = false;
    var mac = get_app_context(executable);
    if (mac == null) {
        created = true;
        mac = Project.CreateMacro("application_context");

        var dlg = CreateWizard();

        dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
        dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));
        dlg.AddWizardButton(NEXT_BTN, Translate("wizNext"), true, 100);

        dlg.SetCaption(Translate('record_application_context'));
        dlg.AddParam("executable", ParamType_STATIC_TEXT_SINGLE, Translate('executable'));
        dlg.AddParam("display_name", ParamType_TEXT_SINGLE, Translate('display_name'));
        dlg.SetParam("executable", executable);

        dlg.SetParam("display_name", executable.replace(".exe", ""));

        dlg.SetSize(300, 150);

        dlg.SetMacroEnvironment(mac.GetResource());
        var ret = dlg.Show();
        dlg.UnsetMacroEnvironment();

        if (ret == OK_BTN || ret == NEXT_BTN) {
            this.create_app_context_(false);
        }

        if (ret == NEXT_BTN) {
            this.RecordApplication();
        }
    } else {
        alert(Translate("errDuplicateContext"));
    }
    AutoEngine.EnableGUIUpdates();
    SetMainWinForeground();
    ca_logger.DeWrite(0);
}

BaseRecorder.prototype.RecordCompatApplication = function() {
    ca_logger.Write(2, "BaseRecorder::RecordCompatApplication", "", "");
    var mac = Project.CurrentEvent();

    if (mac == null || mac.Template() != "application_context") {
        alert(Translate("errNoApplicationContext"));
        return;
    }

    if (!this.pre_app_recording_(SA_BASIC_MODE)) {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }
    
    var executable = this.windows_stack_.GetExecutable();
    if (executable == "") {
        ca_logger.DeWrite(0);
        return;
    }

    var dlg = CreateWizard();

    dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
    dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));

    dlg.SetCaption(Translate('record_compatible_application'));
    dlg.AddParam("executable", ParamType_STATIC_TEXT_SINGLE, Translate('executable'));

    dlg.SetParam("executable", executable);
    dlg.SetSize(200, 150);

    var ret = dlg.Show();

    if (ret == OK_BTN) {
        var exe = mac.GetParam("executable");
        mac.SetParam("executable", exe + ";" + executable);
    }
    SetMainWinForeground();
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.pre_app_recording_ = function(mode) {
    this.init();
    this.choose_app_mode_ = mode;
    
    this.show_choose_app(false, false, false);

    if (!this.choose_app_params.success) {
        this.clean_();
        AutoEngine.ReturnState = CANCEL_STATE;
        SetMainWinForeground();
        ca_logger.DeWrite(3);
        return false;
    }
    this.create_analyzer_n_processor();
    this.init_members_();
    this.settings_ = new NavSettings();
    this.settings_.Load(this.mode_);
    
    AutomationSettings.UseRect = false;
    this.push_app_();
    
    Sleep(500);
    
    this.config_file_ = this.choose_app_params.config_file;
    ca_logger.Log(1, "config file: " + this.config_file_, "", ""); 
    if (this.config_file_ == "") {
        this.config_file_ = this.default_config_file_;
    }

    return true;
}

BaseRecorder.prototype.InsertExplainLong = function() {
    ca_logger.Write(2, "BaseRecorder::InsertExplanation", "", "");
    
    if (!this.check_for_correct_macro_()) {
        ca_logger.DeWrite(2);
        return;
    }
    
    this.find_insert_pos_(true);

    var mac = Project.CreateMacro("explanation_long");
    var dlg = CreateWizard();

    dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
    dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));

    dlg.SetCaption(Translate('explanation_long'));

    dlg.AddParam("macro_comment", ParamType_TEXT_SINGLE, Translate('explanation_long'));
    dlg.AddParam("explanation_d", ParamType_HTML, Translate('explanation_d'));

    dlg.SetParam("macro_comment", Translate('explanation_long'));

    dlg.SetSize(300, 200);

    var local_ctx = CreateContext("macro", mac.GetUID(), "project", Project.UID);
    dlg.SetContext(local_ctx);
    dlg.SetMacroEnvironment(mac.GetResource());
    var ret = dlg.Show();
    dlg.UnsetMacroEnvironment();

    if (ret == OK_BTN) {
        mac.SetParam("macro_comment", dlg.GetParam("macro_comment"));
        mac.SetParam("explanation_d",  dlg.GetParam("explanation_d"));
        update_node_(mac, "explanation_d_modified", true);
        Project.InsertEventAfter(mac);
    }
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.check_for_correct_macro_ = function() {
    var curr_macro = Project.CurrentEvent();
    
    if (is_not_insert_expl_type(curr_macro)) {
        alert(Translate('errInsertExplanation'));
        return false;
    }
    return true;
}

BaseRecorder.prototype.find_insert_pos_ = function(not_at_end) {
    ca_logger.Write(3, "BaseRecorder::find_insert_pos_", "", "");
    var mac = Project.CurrentEvent();
    var ts;
    if (mac) {
        ts = Project.GetTourstopAt(mac.TourPosition());
    }
    if (!ts) {
        ca_logger.DeWrite(3);
        return;
    }
    var last_mac = mac;
    mac = ts.NextMacro(mac.TourPosition());
    while (mac && mac.Template() != "application_context") {
        last_mac = mac;
        mac = ts.NextMacro(mac.TourPosition());
    }

    if (last_mac) {
        last_mac.SetCurrent();
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.RecordScreen = function(update) {
    ca_logger.Write(2, "BaseRecorder::RecordScreen", "", "");
    var uid = "";
    var config_file = "";
    
    if (update) {
        var mac = Project.CurrentEvent();
        
        if (is_not_page_macro(mac)) {
            alert(Translate('errNoTargetDefinition'));
            ca_logger.DeWrite(2);
            return;
        }
        
        if (mac != null && mac.Template() == "define_target" && mac.HasParam('config_file')) {
            config_file = mac.GetParam('config_file');
        }
    }
    
    if (!this.pre_app_recording_(SA_NAVI_MODE)) {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }

    var pagekey = this.get_current_sc_();
    if (!pagekey) {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }
    
    var dlg = null;
    var ret = CANCEL_BTN;

    if (!update) {
        dlg = CreateWizard();

        dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
        dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));

        dlg.SetCaption(Translate('record_screen_context'));
        dlg.AddParam("target_name", ParamType_TEXT_SINGLE, Translate('target_name'));

        var hack_mac = Project.CreateMacro("define_target");
        dlg.SetParam("target_name", this.curr_screen_.title);

        dlg.SetSize(300, 150);

        dlg.CreateMacroEnvironment();
        ret = dlg.Show();
        if (ret == 1) {
            ret = OK_BTN;
        }
        if (ret == OK_BTN) {
            uid = dlg.UnsetMacroEnvironment();
        } else {
            dlg.DeleteMacroEnvironment();
        }
    }

    if (update || ret == OK_BTN) {
        var appmac = this.create_app_context_(false);
        set_define_target_current();

        var ns = null;
        var mac = null;

        if (!update) {
            check_insert_startunit();

            if (Project.CurrentTourstop() == 0) {
                Project.SetCurrentTourstop(1);
            }
            ns = Project.AddTourstop(this.curr_screen_.title);
            mac = Project.CreateMacro("define_target", uid);
        } else {
            mac = Project.CurrentEvent();

            if (is_not_page_macro(mac)) {
                alert(Translate("errNoTargetDefinition"));
                if (appmac != null){
                    Project.DeleteEvent(appmac.TourPosition());
                }
                SetMainWinForeground();
                ca_logger.DeWrite(2);
                return;
            }

            ns = get_ns_from_mac(mac);
        }
        
        ret = this.update_config_header_(appmac);
        if (ret == CANCEL_BTN) {
            if (!update) {
                var ns_index = Project.CurrentTourstop();
                Project.DeleteTourstop(ns_index);
            }
            SetMainWinForeground();
            ca_logger.DeWrite(2);
            return;
        }

        if (ns != null && mac != null) {
            nav_update_target(mac, pagekey, this.config_file_, this.config_template_.revision, this.curr_screen_, -1, ns.Name, this.curr_screen_.title, this.windows_stack_.GetExecutable());

            if (mac.HasParam("process_id")) {
                mac.SetParam("process_id", "*");
            }

            this.curr_screen_.Save();

            if (!update) {
                mac.SetParam("macro_comment", dlg.GetParam("target_name"));
                mac.SetParam("target_name", dlg.GetParam("target_name"));

                Project.AppendEvent(mac);
            }
        }
    }
    SetMainWinForeground();
    AutoEngine.EnableGUIUpdates();
    ca_logger.DeWrite(2);
}


BaseRecorder.prototype.update_config_header_ = function(appmac, cfg_template) {
    var ret = -1;
    if (!appmac) {
        appmac = this.get_appmac_(cfg_template); // get app mac from current executable
        if (!appmac) {
            return ret;
        }
    }
    
    var old_header = get_header(appmac, this.config_template_.filename);
    
    if (old_header == "") {
        update_header(appmac, this.config_template_);
        return ret;
    }

    var equal_headers = false;

    if (IsHeaderHash(old_header)) {
        var new_header_hash = CreateRuntimeProfile(this.config_template_.GetHeader(), this.config_template_.filename);
        equal_headers = (old_header == new_header_hash);
    } else {
        equal_headers = CompareHeaders(old_header, this.config_template_.GetHeader());
    }

    if (!equal_headers) {
        var dlg = CreateWizard();

        dlg.AddWizardButton(CONTINUE_BTN, Translate("wizContinue"));
        dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));
        
        dlg.AddTextSection(Translate('config_headers_differ1'));
        dlg.AddTextSection(Translate('config_headers_differ2'));

        dlg.SetCaption(Translate('record_screen_context'));
        dlg.SetSize(500, 20);
        
        var ret = dlg.Show(this.windows_stack_);
        if (ret == CONTINUE_BTN) {
            update_header(appmac, this.config_template_);
        }
    }
    return ret;
}

BaseRecorder.prototype.get_appmac_ = function(cfg_template) {
    var executable = this.windows_stack_.GetExecutable();
    var appmac = get_app_context(executable);
    if (!appmac) {
        return null;
    }
    if (cfg_template) {
        this.config_template_ = cfg_template;
    }
    return appmac;
}

BaseRecorder.prototype.RecordInclude = function() {
    ca_logger.Write(2, "BaseRecorder::RecordInclude", "", "");
    Project.StartRecording("");

    var dlg = CreateWizard();

    dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
    dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));
    dlg.AddWizardButton(NEXT_BTN, Translate("wizNext"), true, 100);

    dlg.SetCaption(Translate('record_context_assistant_include'));
    dlg.AddParam("project", ParamType_LINK, Translate('project'));
    dlg.SetParamProperty("project", "type", "project");
    dlg.SetParamProperty("project", "src", "trainer-");

    dlg.SetParamProperty("project", "type", "project");
    dlg.SetParamProperty("project", "macroset", "context_assistant");

    dlg.SetSize(300, 200);

    var ret = dlg.Show();

    if (ret == OK_BTN || ret == NEXT_BTN) {
        var prj = dlg.GetParam("project");
        if (prj != "") {
            var obj = WA.GetObject(prj);
            if (obj != null) {
                var mac = Project.CreateMacro("context_assistant_include");

                check_insert_startunit();
                Project.SetCurrentTourstop(0);

                mac.SetParam("macro_comment", obj.Caption);
                mac.SetParam("project_id", dlg.GetParam("project"));

                Project.AppendEvent(mac);
            }
        }
    }
    Project.StopRecording();
    if (ret == NEXT_BTN) {
        this.RecordInclude();
    }
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.UpdateObject = function() {
    ca_logger.Write(2, "BaseRecorder::UpdateObject", "", "");
    var mac = Project.CurrentEvent();
    
    if (!this.check_if_update_possible_(mac)) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    if (!ca_select_project_language()) {
        alert(Translate("errLanguageSelection"));
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return false;
    }
    
    if (!this.pre_app_recording_(SA_BASIC_MODE)) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var ns = get_ns_from_mac(mac);
    if (ns == null) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var tar_mac = get_target_from_ns(ns);
    if (tar_mac == null) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var cfg_template = this.get_cfg_template_(tar_mac);
    if (!cfg_template) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var ret = this.update_config_header_(null, cfg_template);
    if (ret == CANCEL_BTN) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    this.fill_info_recorder_();
    if (!this.info_recorder_.Record(cfg_template, this.screen_processor_, this.windows_stack_, this.screen_analyzer_)) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }
    
    var info = this.info_recorder_.GetInfo();
    if (info != null) {
        if (nav_elem_xtype(info) == get_from_node_(mac, "element_type")) {
            this.bar_ = GetAutomationBar();
            this.set_recording_states();
            this.current_info_ = info;
            this.current_action_ = this.info_recorder_.GetAction();
            this.process_object_info_();

            this.action_queue_ = AutoEngine.GetActionQueue();
            this.action_queue_.Flush();
            
            var accept_changes = -1;
            var continue_loop = true;                
            do {
                this.current_action_ = this.action_queue_.Front();
                this.action_queue_.Pop();
                switch(this.current_action_.type) {
                    case naction_type["EFFECT_ADJUSTED_ACT"]:   
                        this.EffectAdjusted(); 
                        break;
                    case naction_type["CONTROL_CLICKED"]:
                        switch (this.current_action_.action_id) {
                            case APPLY_CHANGES:
                                continue_loop = false;
                                accept_changes = 1;
                                break;
                            case DISCARD_CHANGES:
                                continue_loop = false;
                                accept_changes = 0;
                                break;
                        }
                        break;
                    case naction_type["KEYBOARD_ACT"]:
                        if (this.current_action_.ctrl && KeyUtils.KeyName(this.current_action_.key_code) == "enter") {
                            continue_loop = false;
                            accept_changes = 1;
                        } else if (KeyUtils.KeyName(this.current_action_.key_code) == "esc") {
                            continue_loop = false;
                            accept_changes = 0;
                        }
                        break;
                }
            } while (continue_loop);
            if (accept_changes == 1) {
                this.apply_bubble_changes(false);
                Project.ReplaceEvent(mac.TourPosition(), this.editor_.mac_);
            } else if (accept_changes == 0) {
                this.discard_bubble_changes(false);
            }
            this.stop();
        } else {
            alert(Translate("errObjectUpdate"));
        }
    } else {
        alert(Translate("errObjectInformation"))  ;
    }
    SetMainWinForeground();
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.check_if_update_possible_ = function(mac) {
    ca_logger.Write(3, "BaseRecorder::check_if_update_possible_", "", "");
    if (mac == null || mac.Template() == "step" || mac.Template() == "define_target") {
        ca_logger.DeWrite(3);
        alert(Translate("errActionMacroSelection"));
        return false;
    }

    if (is_not_update_mac_type(mac)) {
        ca_logger.DeWrite(3);
        alert(Translate("errUpdateObject"));
        return false;
    }
    ca_logger.DeWrite(3);
    return true;
}


BaseRecorder.prototype.get_cfg_template_ = function(tar_mac) {
    var cfg_template = null;
    if (tar_mac && tar_mac.HasParam('config_file')) {
        var cfg_file = tar_mac.GetParam('config_file');

        cfg_template = ConfigTemplateAdmin.OpenConfigTemplate(cfg_file, this.screen_processor_);

        if (cfg_template == null) {
            alert(Translate("errLoadTemplate")+ cfg_file);
        }
    }
    return cfg_template;
}

BaseRecorder.prototype.RecordScreenSpecializer = function(select_app) {
    ca_logger.Write(2, "BaseRecorder::RecordScreenSpecializer", "", "");
    var tar_mac = Project.CurrentEvent();

    if (tar_mac == null || tar_mac.Template() != "define_target") {
        alert(Translate("errNoTargetDefinition"));
        ca_logger.DeWrite(2);
        return;
    }
    
    if (select_app && !this.pre_app_recording_(SA_BASIC_MODE)) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var cfg_template = this.get_cfg_template_(tar_mac);
    if (!cfg_template) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;
    }

    var info_recorder = new InfoRecorder();

    if (!info_recorder.Record(cfg_template, this.screen_processor_, this.windows_stack_, this.screen_analyzer_)) {
        SetMainWinForeground();
        ca_logger.DeWrite(2);
        return;        
    }
    
    var info = info_recorder.GetInfo();
    if (info != null) {
        this.add_specializer_macro_(info, info_recorder.GetAction(), info_recorder.GetScreen());
    } else {
        alert(Translate("errSpecializedInformation"));
    }
    SetMainWinForeground();
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.add_specializer_macro_ = function(info, action, screen) {
    ca_logger.Write(3, "BaseRecorder::add_specializer_macro_", "", "");

    if (info != null) {
        var type = nav_elem_xtype(info);
        var hdl_obj = nhmap[type];

        if (hdl_obj != null) {
            this.screen_exporter_.Init();
            this.screen_exporter_.SetScreenDump(screen);

            var mac = Project.CreateMacro("target_specializer");
            this.mac_create_params_.Init();
            this.mac_create_params_.SetParams(type, info, action, this.screen_exporter_, action, -1, this.windows_stack_, mac);

            hdl_obj.update(mac, this.mac_create_params_);

            var ctrl_type = info.GetProperty(ninfo_attributes["TYPE"]);
            if ((ctrl_type == "checkbox" || ctrl_type == "radio") && mac.HasParam("text_d")) {
                 var newvalue = info.GetProperty(ninfo_attributes["STATE"]);
                 mac.SetParam("text_d", newvalue);
            }
            if (mac.HasParam("match_value")) {
                mac.SetParam("match_value", true);
            }
            this.record_specialmac_attrs_(mac, info);
        } else {
             ca_logger.Log(2, "add_specialized_macro - no handler for " + type, "", "");
        }
    } else {
        alert(Translate("errSpecializedInformation"));
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.record_specialmac_attrs_ = function(mac, info) {
    ca_logger.Write(3, "BaseRecorder::record_specialmac_attrs_", "", "");
    
    var dlg = this.create_n_update_dlg_(mac, info);
    var ret = dlg.Show();
    
    if (ret == OK_BTN || ret == NEXT_BTN) {
    
        if (mac.HasParam("element_type")) {
            if (is_dropdown(mac.GetParam("element_type"))) {
                update_node_(mac, "text_d", dlg.GetParam("choose_text"));
                update_node_(mac, "match_value", dlg.GetParam("match_value"));
            } else if (is_edit(mac.GetParam("element_type"))) {
                update_node_(mac, "text_d", dlg.GetParam("text_d"));
                update_node_(mac, "match_value", dlg.GetParam("match_value"));
            }            
        }
        if (ret == NEXT_BTN) {
            this.RecordScreenSpecializer();
        }
        Project.InsertEventAfter(mac);
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.create_n_update_dlg_ = function(mac, info) {
    ca_logger.Write(3, "BaseRecorder::create_n_update_dlg_", "", "");
    var dlg = CreateWizard();
    dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
    dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));
    dlg.AddWizardButton(NEXT_BTN, Translate("wizNext"), true, 100);
    
    dlg.SetCaption(Translate('record_target_specializer'));
    
    this.add_n_update_dlg_params_(dlg, "static_txt", ParamType_STATIC_TEXT_SINGLE, mac, "fieldname");
    
    if (mac.HasParam("element_type")) {
        if (dlg.GetParam("static_txt") == "") {
            dlg.SetParam("static_txt", mac.GetParam("element_type"));
        }
        var ctrl_type = info.GetProperty(ninfo_attributes["TYPE"]);
        
        if (is_dropdown(mac.GetParam("element_type"))) {
            this.update_for_dropdown(dlg, mac, info);            
        } else if (is_edit(mac.GetParam("element_type")) || 
                    (ctrl_type == "checkbox" ) || 
                    (ctrl_type == "radio")) 
        {
            this.update_for_edit_n_radio(dlg, mac, ctrl_type);            
        } else {
            this.update_for_others(dlg, mac);
        }
    }
    
    if (mac.HasParam("element_type") && is_edit(mac.GetParam("element_type"))) {
        dlg.SetParam("text_d", info.GetProperty(ninfo_attributes["VALUE"]));
    }
    
    return dlg;
}

BaseRecorder.prototype.update_for_dropdown = function(dlg, mac, info) {
    this.al_v_ = info.GetProperty(ninfo_attributes["ALLVALUES"]);
    if (this.al_v_ == "") {
        this.al_v_ = info.GetProperty(ninfo_attributes["VALUE"]);
    }
    
    dlg.AddParam("choose_text", ParamType_ENUM, Translate('choose_text'));
    dlg.SetParam("choose_text", this.get_selected_value(dlg));
    this.add_n_update_dlg_params_(dlg, "match_value", ParamType_BOOL_0_1, mac, "match_value");
}

BaseRecorder.prototype.update_for_edit_n_radio = function(dlg, mac, ctrl_type) {
    this.add_n_update_dlg_params_(dlg, "text_d", ParamType_TEXT_SINGLE, mac, "text_d");
    this.add_n_update_dlg_params_(dlg, "match_value", ParamType_BOOL_0_1, mac, "match_value");
}

BaseRecorder.prototype.update_for_others = function(dlg, mac) {
    dlg.AddTextSection(dlg.GetParam("static_txt") + " " + Translate('target_static_text'));

    if (mac.HasParam("path") && mac.GetParam("path") == "") {
        dlg.AddTextSection("");
        dlg.AddTextSection(Translate('target_spec_warning'));
    }
}

BaseRecorder.prototype.get_selected_value = function(dlg) {
    var sel_val = "";
    if (this.al_v_ == "") {
        return sel_val;
    }
    
    this.val_arr_ = this.al_v_.split('\n');
    for (var i = 0; i < this.val_arr_.length; i++) {
         if (this.val_arr_[i] != "") {
            var val = this.val_arr_[i];
            index = this.val_arr_[i].indexOf("{*}");

            if (index != -1) {
                val = this.val_arr_[i].substr(index + 3, this.val_arr_[i].length);
                sel_val = val;
                this.val_arr_[i] = val;
            }
            dlg.AddStringEnumValue("choose_text", val, val);
        }
    }
    return sel_val;
}

BaseRecorder.prototype.add_n_update_dlg_params_ = function(dlg, param, type, node, name) {
    if (node != null && node.HasParam(name)) {
        dlg.AddParam(param, type, Translate(name));
        dlg.SetParam(param, node.GetParam(name));
    }
}

BaseRecorder.prototype.RecordContextProperty = function() {
    ca_logger.Write(3, "BaseRecorder::RecordContextProperty", "", "");

    var content = WA.GetCurrContent();
    
    if (!content.IsEditable()) {
        var ca = WA.GetObject("macroset!context_assistant");
        var glossary = ca ? ca.GetLocalDictionary(content.Language) : null;
        alert(glossary ? glossary["errNoWriteToken"] : "Write token is missing for the selected entity.");
        return;
    }
    this.update_if_old_context_(content);
    if (content && content.DAContextId == "") {
        return this.record_context_(EMPTY_CONTEXT, content);
    }

    var dlg = CreateContextIdDlg();
    var ret = dlg.Show();

    if (ret.success) {
        return this.record_context_(ret.selected_option, content);
    } else {
        SetMainWinForeground();
        return;
    }
    ca_logger.DeWrite(3);
}

BaseRecorder.prototype.update_if_old_context_ = function(content) {
    var context = content.ContextId;
    var context_params = context.split("|$|");

    if (context_params.length == 4) {
        content.DAContextId = ConvertDAContext(context);
        content.ContextId = "";
    }
}

BaseRecorder.prototype.record_new_context_ = function() {
    var res = {pagekey : "" , exec : ""};
    if (!this.pre_app_recording_(SA_NAVI_MODE)) {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }
    
    res.pagekey = this.get_current_sc_();

    if (!res.pagekey || res.pagekey.indexOf('PageAtt') == -1) {
        SetMainWinForeground();
        ca_logger.DeWrite(0);
        return;
    }
    res.exec = this.windows_stack_.GetExecutable();
    return res;
}
    
BaseRecorder.prototype.record_context_ = function(category, content) {
    switch(category) {

        case EMPTY_CONTEXT      :   var res = this.record_new_context_();
                                    if (res != null) {
                                        this.update_context_id_success_(res.exec, res.pagekey, "", content);
                                    }
                                    break;
                            
        case DELETE_CONTEXT     :   var res = this.update_contexts_(content, false);
									if (res != null) {
										content.DAContextId = res.context;
									}
                                    break;
                                
        case APPEND_CONTEXT     :   var res = this.record_new_context_();
                                    if (res != null) {
                                        this.update_context_id_success_(res.exec, res.pagekey, content.DAContextId, content);
                                    }
                                    break;

        case REPLACE_ALL_CTX    :   var res = this.record_new_context_();
                                    if (res != null) {
                                        this.update_context_id_success_(res.exec, res.pagekey, "", content);
                                    }
                                    break;
                                    
        case REPLACE_CONTEXT    :   var res = this.update_contexts_(content, true);
									if (res != null) {
										var ret = this.record_new_context_();
										if (ret != null) {
											this.update_context_id_success_(ret.exec, ret.pagekey, res.context, content);
										}
									}
                                    break;
    }
    content.Save();
    SetMainWinForeground();
    return;
}


BaseRecorder.prototype.update_contexts_ = function(content, replace) {
	var result = null;
	SetMainWinForeground();
    var update_dlg = CreateContextUpdateDlg();
    var ret = update_dlg.Show(content.DAContextId, replace);
    if (ret.success) {
        result = ret;
    }
	return result;
}

BaseRecorder.prototype.update_context_id_success_ = function(exec, pagekey, existing_context, content) {
    var header_hash = CreateRuntimeProfile(this.config_template_.GetHeader(), this.config_template_.filename);
    SyncRuntimeProfiles([header_hash]);
    
    var root = "<DAContexts></DAContexts>";
    if (existing_context != "") {
        root = existing_context;
        if (IfDuplicateContext(root, this.config_template_.filename, pagekey, header_hash)) {
            alert(Translate("errDuplicateContext"));
            return false;
        }
    }
    content.DAContextId = AddDAContext(root, exec, pagekey, this.config_template_.filename, header_hash);
    return true;
}

BaseRecorder.prototype.RecordExplanation = function() {
    ca_logger.Write(2, "BaseRecorder::RecordExplanation", "", "");
    this.init();
    this.create_analyzer_n_processor();
    this.is_curr_mouse_wheel_ = false;

    var tar_mac = Project.CurrentEvent();
    if (tar_mac == null || tar_mac.Template() != "define_target") {
        alert(Translate("errNoTargetDefinition"));
        ca_logger.DeWrite(2);
        return;
    }

    var pt = CreatePoint(50, 50);
    this.show_expl_dlg_(pt);
    
    SetMainWinForeground();
    ca_logger.DeWrite(2);
}

BaseRecorder.prototype.show_expl_dlg_ = function(pt) {
    var dlg = CreateDialog();
    dlg.SetSize(400, 200);
    dlg.SetCaption(Translate('explanation_long'));
    dlg.AddParam("explanation_d", ParamType_HTML, Translate('explanation_d'));
    dlg.CreateMacroEnvironment();
    
    var exp_mac = null;
    var exp_show = dlg.Show();
    
    if (exp_show) {
        exp_mac = Project.CreateMacro("explanation_long", dlg.UnsetMacroEnvironment());

        update_node_(exp_mac, "macro_comment", Translate('explanation_long'));
        update_node_(exp_mac, "explanation_d", dlg.GetParam("explanation_d"));
        update_node_(exp_mac, "click_pos_rel", pt);
        update_node_(exp_mac, "explanation_d_modified", true);

        Project.AppendEvent(exp_mac);
    } else {  
        dlg.DeleteMacroEnvironment();
    }
}

function ComboIdentifier(type, prev_type) {
    this.curr_type_ = type;
    this.prev_type_ = prev_type;
}

ComboIdentifier.prototype.curr_type_ = "";
ComboIdentifier.prototype.prev_type_ = "";

ComboIdentifier.prototype.ListBoxCombo = function() {
    return is_list_combo_type(this.prev_type_);
}

ComboIdentifier.prototype.ClassicCombo = function() {
    return ((is_list(this.curr_type_) || is_menu(this.curr_type_)) && 
                            is_combo_type(this.prev_type_));
}

ComboIdentifier.prototype.GetComboType = function() {
    if (this.ListBoxCombo()) {
        return LISTBOX_COMBO;
    }
    if (this.ClassicCombo()) {
        return CLASSIC_COMBO;
    }

    return NO_COMBO;
}

ComboIdentifier.prototype.IsValid = function() {
    return (this.ListBoxCombo() || this.ClassicCombo());
}

ComboIdentifier.prototype.Cleanup = function() {
    this.curr_type_ = "";
    this.prev_type_ = "";
}
