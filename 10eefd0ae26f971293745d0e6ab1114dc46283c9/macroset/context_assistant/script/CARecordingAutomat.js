#use(BaseRecorder.js)

function CARecordingAutomat() {

}

CARecordingAutomat.prototype = new BaseRecorder;
CARecordingAutomat.superClass = BaseRecorder.prototype;
var ca_recorder = new CARecordingAutomat();

function start_ca_record_engine(product_mode, recording_mode) {
    ca_recorder.init();
    ca_recorder.start();
}

CARecordingAutomat.prototype.init = function() {
    BaseRecorder.prototype.init.call(this);
    this.block_execution_at_start = true;
    this.bubble_minimized_ = true;
}

CARecordingAutomat.prototype.start = function() {
    this.bar_ = GetAutomationBar();
    BaseRecorder.prototype.start.call(this);
}

CARecordingAutomat.prototype.pause = function() {
    BaseRecorder.prototype.pause.call(this);
}

CARecordingAutomat.prototype.close = function() {
    this.continue_loop_ = false;
    BaseRecorder.prototype.close.call(this);
}

CARecordingAutomat.prototype.create_start_unit_ = function() {
    check_insert_startunit();
}

CARecordingAutomat.prototype.record_current_screen_ = function() {
    var ret = false;
    this.curr_screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_file_);

    //second try
    if (this.curr_screen_ == null) {
        this.windows_stack_.PushForeground();
        Sleep(500);
        this.curr_screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_file_);
    }

    if (this.curr_screen_ != null) {
        this.screen_processor_.SetScreen(this.curr_screen_);
        var always_chnage_profile = (this.settings_.AutoChange == ANY);
        this.screen_analyzer_.Flush();
        if (always_chnage_profile) {
            if (!this.profile_changed_) {
                this.set_profiles_from_collection_(); 
                this.config_template_ = ConfigTemplateAdmin.OpenConfigTemplate(this.config_file_, this.screen_processor_);
            }
        }
        if (this.update_screen_macro_(true)) {
            ret = this.handle_diagnosis_();
        }
    } else {
        alert(Translate("errScreenshot"));
    }
    return ret;
}

CARecordingAutomat.prototype.finalize_mac_ = function(mac) {
    if (!this.click_block_ && !this.executed_) {
        this.execute_action_(mac, this.mac_create_params_.Action, this.current_info_);
    }
    this.set_blank_for_password_(mac);
    Sleep(DELAY);
    Project.AppendEvent(mac);
    this.merge_listbox_();
    this.merge_consecutive_scrolls_for_ca_();
    this.executed_ = false;
}

CARecordingAutomat.prototype.prepare_project_steps = function(mac) {
    this.get_start_macros_();
    this.add_ns_for_ca_();
    this.finalize_mac_(mac);
}

CARecordingAutomat.prototype.get_start_macros_ = function() {
    check_insert_startunit();
    this.create_app_context_(true);
}

CARecordingAutomat.prototype.set_blank_for_password_ = function(mac){
    if (this.is_passwd_) {
        update_node_(mac, "text_d", "");
        this.is_passwd_ = false;
    }
}

CARecordingAutomat.prototype.merge_listbox_ = function() {
    ca_logger.Write(3, "CARecordingAutomat::merge_listbox_", "", "");

    var curr_mac = null;
    var prev_mac = null;

    var ts = Project.GetTourstop(Project.CurrentTourstop());
    prev_mac = curr_mac;
    curr_mac = ts.NextMacro();

    while (curr_mac) {
        var tmp_mac = ts.NextMacro(curr_mac.TourPosition());

        if (tmp_mac == null) break;

        prev_mac = curr_mac;
        curr_mac = tmp_mac;
    }
    var nmac = this.merge_listbox_macros_(prev_mac,curr_mac);
    if(nmac != null){
        this.handle_merged_dropdown_(nmac);
    }
    ca_logger.DeWrite(3);
}

CARecordingAutomat.prototype.merge_consecutive_scrolls_for_ca_ = function() {
    var curr_mac = null;
    var prev_mac = null;

    var ts = Project.GetTourstop(Project.CurrentTourstop());
    curr_mac = ts.NextMacro();

    while (curr_mac) {
        var tmp_mac = ts.NextMacro(curr_mac.TourPosition());
        if (tmp_mac == null) {
            break;
        }
        prev_mac = curr_mac;
        curr_mac = tmp_mac;
    }
    this.merge_scroll_macros_(prev_mac,curr_mac);
}

CARecordingAutomat.prototype.merge_scroll_macros_ = function(prev_mac,curr_mac) {
    if (prev_mac == null || curr_mac == null) {
        return;
    }

    var prev_type = "";
    var curr_type = "";

    prev_type = get_from_node_(prev_mac, "element_type");
    curr_type = get_from_node_(curr_mac, "element_type");
    if (is_scroll_type(prev_type) && is_scroll_type(curr_type) ||
        (this.is_prev_mouse_wheel_ && this.is_curr_mouse_wheel_)) {
            Project.DeleteEvent(curr_mac.TourPosition());
    } else if (is_scroll_type(prev_type) || this.is_prev_mouse_wheel_) {
        this.update_scroll_text_(prev_mac, curr_mac);
    }
}

CARecordingAutomat.prototype.merge_listbox_macros_ = function(prev_mac,curr_mac) {
    ca_logger.Write(3, "CARecordingAutomat::merge_listbox_macros_", "", "");

    if (prev_mac != null && curr_mac != null) {

        var prev_type = get_from_node_(prev_mac, "element_type");;
        var curr_type = get_from_node_(curr_mac, "element_type");;

        var type_m = {curr:curr_type,prev:prev_type};
        
        if (this.combo_identifier_ && this.combo_identifier_.IsValid()) {
            var nmac = Project.CreateMacro("select_single");
            var infotxt = ch_get_infotxt("WINListBox");
            var ns_index = Project.CurrentTourstop();

            update_node_(nmac, "macro_comment", Translate("select_single"));

            update_node_(nmac, "explanation_d", infotxt.prac);

            var val = get_from_node_(curr_mac, "fieldname");
            update_node_(nmac, "choose_text", val);
            if (this.al_v_ != "") {
                update_node_(nmac, "all_values", this.al_v_);
                var sel_indx_ = get_dditem_index(this.al_v_,val);
                update_node_(nmac, "choose_nr", sel_indx_);
            }
            this.copy_resource_(prev_mac, nmac);

            Project.DeleteEvent(curr_mac.TourPosition());
            Project.DeleteEvent(prev_mac.TourPosition());
            ca_logger.DeWrite(3);
            return nmac;
        }
    }
    ca_logger.DeWrite(3);
    return null;
}

CARecordingAutomat.prototype.add_ns_for_ca_ = function() {
    ca_logger.Write(3, "CARecordingAutomat::add_ns_for_pa", "", "");
    if (Project.CurrentTourstop() < 1) {
        Project.SetCurrentTourstop(1);
    }
    if (!this.ca_same_screen_) {
        var ns = Project.AddTourstop(this.curr_screen_.title);
        update_node_(this.tar_mac_, 'ts', ns.name);
        this.curr_screen_.Save();
        Project.AppendEvent(this.tar_mac_);
    }
    ca_logger.DeWrite(3);
}

CARecordingAutomat.prototype.undo = function() {
    this.reset_special_handlers_();
    var last_mac = get_last_prj_mac();

    if (last_mac.index >= 1) {
        Project.DeleteEvent(last_mac.macro.TourPosition());
        this.bar_.EnableButton(nautomation_bar_buttons["UNDO"], false);
    }
}

CARecordingAutomat.prototype.create_keypress_macro_ = function() {
    var key_code = this.current_action_.key_code;
    var key_name = KeyUtils.KeyName(key_code);
    this.create_keyboard_info_();
    var screen = this.windows_stack_.CaptureCurrentScreen(this.config_template_.filename);
    var type = nav_elem_xtype(this.current_info_);
    var hdl_obj = nhmap[type];
    if (hdl_obj != null) {
        return this.get_initial_macro_(hdl_obj, screen, type, this.current_info_, this.current_action_);
    }
    return null;
}

CARecordingAutomat.prototype.get_current_sc_ = function() {
    ca_logger.Write(3, "CARecordingAutomat::get_current_sc_", "", "");
    this.windows_stack_.PushForeground();
    this.curr_screen_ = this.windows_stack_.CaptureCurrentScreen(this.config_file_);

    if (this.curr_screen_ != null) {
        this.screen_processor_.SetScreen(this.curr_screen_);
        this.screen_analyzer_.Flush();
        this.screen_analyzer_.SetConfigTemplate(this.config_template_);
        this.screen_processor_.SetProcessorCfgParams(this.config_template_);
        this.screen_analyzer_.SetProcessor(this.screen_processor_);
        this.SavePrjContext();
        var curr_pagekey = this.screen_analyzer_.GetPageKey(this.windows_stack_, GET_PAGEKEY_TIMEOUT);
        var executable = this.windows_stack_.GetExecutable();
        if (curr_pagekey != "") {
            var existing_prj_res = this.handle_already_recorded_prj_(curr_pagekey, executable);
            if (!existing_prj_res.ignore_control) {
                this.ignore_duplicate_page_recording_ = false;
                this.tar_mac_ = (this.prev_pagekey_ != curr_pagekey) ? existing_prj_res.scr_mac : this.tar_mac_;
                this.ca_same_screen_ = (this.tar_mac_ != null);
                if (!this.ca_same_screen_) {
                    this.tar_mac_ = Project.CreateMacro("define_target");
                    nav_update_target(this.tar_mac_, curr_pagekey, this.config_file_, this.config_template_.revision, this.curr_screen_, -1, null, this.curr_screen_.title, executable);
                } 
                this.prev_pagekey_ = curr_pagekey;
            } else {
                this.ignore_duplicate_page_recording_ = true;
            }
        } else {
            alert(Translate("errExtractPagekey") + this.config_file_);
        }
    } else {
        alert(Translate("errScreenshot"));
    }
    ca_logger.DeWrite(3);
}

CARecordingAutomat.prototype.handle_already_recorded_prj_ = function(curr_pagekey, executable) {
    var ret = { scr_mac : null, ignore_control : false };
    if (Project.NumTourstops() == 0) {
        return ret;
    }
    var res = get_target_def(Translate('record_object_context'), curr_pagekey, executable);
    if (!res.cancel) {
        this.create_app_context_(true);

        ret.scr_mac = res.tarmac;
        if (ret.scr_mac != null) {
            Project.SetCurrentTourstop(res.nsindex);
        }
    } else {
        ret.ignore_control = true;
    }
    return ret;
}
