#use(BaseRecorder.js)

function PARecordingAutomat() {

}

PARecordingAutomat.prototype = new BaseRecorder;
PARecordingAutomat.superClass = BaseRecorder.prototype;
var pa_recorder = new PARecordingAutomat();

function start_nav_record_engine(product_mode, recording_mode) {
    pa_recorder.init();
    pa_recorder.start();
}

PARecordingAutomat.prototype.init = function() {
    BaseRecorder.prototype.init.call(this);
    this.bubble_minimized_ = false;
}

PARecordingAutomat.prototype.start = function() {
    this.bar_ = GetAutomationBar();
    if (get_start_unit() != null) {
        alert(Translate("errRecordProcessStep"));
        this.bar_.Close();
        return;
    }
    BaseRecorder.prototype.start.call(this);
}

PARecordingAutomat.prototype.pause = function() {
    BaseRecorder.prototype.pause.call(this);
}

PARecordingAutomat.prototype.close = function() {
    this.continue_loop_ = false;
    BaseRecorder.prototype.close.call(this);
}

PARecordingAutomat.prototype.create_start_unit_ = function() {
    if (get_process_start_unit() == null) {
        var ts = 0;
        if (Project.NumTourstops() > 0) {
            ts = Project.GetTourstopAt(Project.CurrentTourstop());
        }
        
        Project.AddTourstopAt(Translate("start_topic"), 0, Tourstop_HIDE_NOJUMP);
        
        var mac = Project.CreateMacro("process_start_unit");
        update_node_(mac, "macro_comment", Translate("guided_tour"));
        Project.InsertEventAfter(mac);
        
        if (ts) {
            Project.SetCurrentTourstop(ts.TourPosition());
        }
    }
}

PARecordingAutomat.prototype.record_current_screen_ = function() {
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
        var always_change_profile = (this.settings_.AutoChange == ANY);
        this.screen_analyzer_.Flush();
        if (always_change_profile) {
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

PARecordingAutomat.prototype.finalize_mac_ = function(mac) {
    if (!this.click_block_ && !this.executed_) {
        this.execute_action_(mac, this.mac_create_params_.Action, this.current_info_);
    }
    this.set_blank_for_password_(mac);
    Sleep(DELAY);
    Project.AppendEvent(mac);
    this.merge_listbox_for_pa_();
    this.merge_consecutive_scrolls_for_pa_();
    this.executed_ = false;
}

PARecordingAutomat.prototype.prepare_project_steps = function(mac) {
    this.get_start_macros_();
    this.finalize_mac_(this.process_mac_pa_(mac));
}

PARecordingAutomat.prototype.get_start_macros_ = function() {
    if (get_process_start_unit() == null) {
        this.create_start_unit_();
    }
    this.create_app_context_(true);
}

PARecordingAutomat.prototype.set_blank_for_password_ = function(mac){
    if (this.is_passwd_) {
        update_node_(mac, "text_d", "");
        this.is_passwd_ = false;
    }
}

PARecordingAutomat.prototype.merge_listbox_for_pa_ = function() {
    ca_logger.Write(3, "PARecordingAutomat::merge_listbox_for_pa_", "", "");
    var curr_mac = null;
    var prev_mac = null;
    curr_mac = this.get_action_macro_(Project.GetTourstop(Project.CurrentTourstop()));
    prev_mac = this.get_action_macro_(Project.GetTourstop(Project.CurrentTourstop() - 1));
    var nmac = this.merge_listbox_macros_(prev_mac,curr_mac);
    if(nmac != null){
        this.update_after_merge_(nmac);
    }
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.merge_consecutive_scrolls_for_pa_ = function() {
    var curr_mac = null;
    var prev_mac = null;
    curr_mac = this.get_action_macro_(Project.GetTourstop(Project.CurrentTourstop()));
    prev_mac = this.get_action_macro_(Project.GetTourstop(Project.CurrentTourstop() - 1));
    this.merge_scroll_macros_(prev_mac,curr_mac);
}

PARecordingAutomat.prototype.merge_listbox_macros_ = function(prev_mac,curr_mac) {
    ca_logger.Write(3, "PARecordingAutomat::merge_listbox_macros_", "", "");

    if (prev_mac != null && curr_mac != null) {

        var prev_type = get_from_node_(prev_mac, "element_type");;
        var curr_type = get_from_node_(curr_mac, "element_type");;

        var type_m = {curr:curr_type,prev:prev_type};

        if (this.combo_identifier_ && this.combo_identifier_.IsValid()) {
            var nmac = Project.CreateMacro("select_single");
            var infotxt = ch_get_infotxt("WINListBox");
            var ns_index = Project.CurrentTourstop();
            var action_ = this.get_action_type_(nmac);
            if (this.next_step_uid_ != null) {
                this.set_next_process_attrib_(nmac, ns_index, action_);
            }
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

            update_node_(nmac, "b_minimized", false);

            Project.DeleteEvent(curr_mac.TourPosition());
            Project.DeleteEvent(prev_mac.TourPosition());
            ca_logger.DeWrite(3);
            return nmac;
        }
    }
    ca_logger.DeWrite(3);
    return null;
}

PARecordingAutomat.prototype.update_after_merge_ = function(nmac) {
    ca_logger.Write(3, "PARecordingAutomat::update_after_merge_", "", "");
    var ns_index = Project.CurrentTourstop();
    var trans = get_transition_from_ns(Project.GetTourstop(ns_index - 1));
    var trans_temp = get_transition_from_ns(Project.GetTourstop(ns_index));
    Project.DeleteTourstop(ns_index);
    if(nmac.Template() == "select_single"){
        var action = "FocusLost";
        if((trans_temp != null) && (trans != null) && trans_temp.HasParam("step_name1")){
            trans.SetParam("macro_comment", trans_temp.GetParam("macro_comment"));
            trans.SetParam("action", action);

            trans.SetParam("step_name1", trans_temp.GetParam("step_name1"));
        }
    }
    var tar_mac = get_target_from_ns(Project.GetTourstop(ns_index - 1));
    if(tar_mac != null){
        tar_mac.SetCurrent();
    }
    this.handle_merged_dropdown_(nmac);
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.get_action_type_ = function(mac) {
    ca_logger.Write(3, "PARecordingAutomat::get_action_type_", "", "");
    var action = "LClick";
    var template = mac.Template();

    if (template == "input_text" || template == "select_single") {
        action = "FocusLost";
    } else if (mac.HasParam("action")) {
        var act = get_from_node_(mac, "action");

        if (act == "ldblclick") {
            action = "LDblClick";
        } else if (act == "rclick") {
            action = "RClick";
        }
    }
    ca_logger.DeWrite(3);
    return action;
}

PARecordingAutomat.prototype.set_next_process_attrib_ = function(mac, ns_index, action) {
    ca_logger.Write(3, "PARecordingAutomat::set_next_process_attrib_", "", "");

    update_node_(mac, "step_name1", this.next_step_uid_);
    update_node_(mac, "trans_action", action);
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.get_action_macro_ = function(ts) {
    ca_logger.Write(3, "PARecordingAutomat::get_action_macro_", "", "");
    var temp_macro = null;
    temp_macro = ts.NextMacro();
    while (temp_macro != null) {
        if (temp_macro.Template() != "step" && temp_macro.Template() != "define_target") {
            ca_logger.DeWrite(3);
            return temp_macro;
        }
        temp_macro  = ts.NextMacro(temp_macro.TourPosition());
    }
    ca_logger.DeWrite(3);
    return temp_macro;
}

PARecordingAutomat.prototype.process_mac_pa_ = function(mac) {
    ca_logger.Write(3, "PARecordingAutomat::process_mac_pa_", "", "");
    var prev_macro = null;
    var next_step_name = null;
    var prev_step_index = null;
    
    this.my_trans_arr_ = get_transition_name("step");
    var ns_index = Project.CurrentTourstop();
    var pos = { prev: -1, next: -1 };
    var r = this.validate_ns_pos_(ns_index, pos);
    pos = r.pos;
    
    if (r.ret) {
        pos = this.get_prev_and_next_trans_(ns_index);
    }
    
    var prev_step = (pos.prev != -1) ? (pos.prev * 1) : -1;
    var next_step = (pos.next != -1) ? (pos.next * 1) : -1;
    var elem_type = get_from_node_(mac, "element_type");
    

    if (prev_step >= 0){
        prev_step_index = this.my_trans_arr_[prev_step].pos;
        prev_macro = get_macro_from_index("transition",this.my_trans_arr_[prev_step].pos);
        if (prev_macro == null) {
            var prev_ctrl = get_act_macro_from_index(this.my_trans_arr_[prev_step].pos);
            prev_macro = prev_ctrl;
        }
    } else {
        prev_macro = get_macro_from_index("step",0);
        prev_step_index = 0;
    }

    if (next_step >= 0){
        next_step_name = this.my_trans_arr_[next_step].name;
        this.next_step_uid_ = this.my_trans_arr_[next_step].uid;
    }else {
        this.next_step_uid_ = null;
    }

    this.add_ns_for_pa_();
    this.update_ns_for_pa_(mac, prev_macro, prev_step_index);
    ca_logger.DeWrite(3);
    return mac;
}

PARecordingAutomat.prototype.validate_ns_pos_ = function(ns_index, pos) {
    ca_logger.Write(3, "PARecordingAutomat::validate_ns_pos_", "", "");
    ret = true;
    if (this.my_trans_arr_.length > 0) {
        if (ns_index < 2){
            pos.next = 0;
            ret = false
        } else if (ns_index == this.my_trans_arr_[this.my_trans_arr_.length -1].pos) {
            pos.prev = this.my_trans_arr_.length -1;
            ret = false;
        }
    } else {
        ret = false;
    }
    ca_logger.DeWrite(3);
    return {"ret": ret, "pos" : pos};
}

PARecordingAutomat.prototype.get_prev_and_next_trans_ = function(ns_index) {
    ca_logger.Write(3, "PARecordingAutomat::get_prev_and_next_trans_", "", "");
    var pos = { prev: -1, next: -1 };

    for (var i = 0; i < this.my_trans_arr_.length; i++) {
        if (ns_index == this.my_trans_arr_[i].pos) {
            var prev_index = null;
            var next_index = null;
            if (ns_index > 1) {
                prev_index = i ;
            }
            if (i + 1 < this.my_trans_arr_.length) {
                next_index = i + 1;
            }
            pos = {prev:prev_index,next:next_index};
        }
    }
    ca_logger.DeWrite(3);
    return pos;
}

PARecordingAutomat.prototype.add_ns_for_pa_ = function() {
    ca_logger.Write(3, "PARecordingAutomat::add_ns_for_pa", "", "");
    if (Project.CurrentTourstop() < 1) {
        Project.SetCurrentTourstop(1);
    }
    var ns = Project.AddTourstop(this.curr_screen_.title);
    update_node_(this.tar_mac_, 'ts', ns.name);
    this.curr_screen_.Save();
    Project.AppendEvent(this.tar_mac_);
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.update_ns_for_pa_ = function(mac, prev_macro,prev_step_index) {
    ca_logger.Write(3, "PARecordingAutomat::update_ns_for_pa_", "", "");
    var stepname = this.get_comment_(mac);

    var org_ns_index = Project.CurrentTourstop() - 1;
    var uid = this.add_new_step_macro_(stepname, false, org_ns_index);
    var prev_name = null;

    if (prev_macro != null) {
        if (prev_macro.Template() == "step") {
            update_node_(prev_macro, "macro_comment","1." + stepname);
            update_node_(prev_macro, "name","1." + stepname);
        } else {
            var prev_page_key = get_page_key_from_index(prev_step_index);
            var act = null;
            if (prev_macro.HasParam("trans_action")) {
                act = get_from_node_(prev_macro, "trans_action");
            } else {
                act = get_from_node_(prev_macro, "action");
                var trans_comment = org_ns_index +"."+ stepname + ":" + act;
                update_node_(prev_macro, "macro_comment",trans_comment);
            }

            update_node_(prev_macro, "step_name1", uid);
        }
    }
    this.add_new_transition_(uid, mac, prev_macro, prev_step_index);
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.get_comment_ = function(new_mac) {
    ca_logger.Write(3, "PARecordingAutomat::get_comment_", "", "");
    var comment = "";
    if (this.is_curr_mouse_wheel_) {
        return Translate('click');
    }
    comment = get_from_node_(new_mac, "fieldname");

    if (comment == "") {
        comment = Translate(new_mac.Template());

        if (new_mac.HasParam("text_d")) {
            comment = comment + " - " + get_from_node_(new_mac, "text_d");
        }
    }
    ca_logger.DeWrite(3);
    return comment;
}

PARecordingAutomat.prototype.add_new_step_macro_ = function(stepname,append,org_ns_index) {
    ca_logger.Write(3, "PARecordingAutomat::add_new_step_macro_", "", "");
    var uid = "";
    var step = Project.CreateMacro("step");
    var stepname = org_ns_index + "." + stepname;
    update_node_(step, "macro_comment", stepname);
    update_node_(step, "name", stepname);
    
    if (append) {
        Project.AppendEvent(step);
    } else {
        Project.InsertEventAfter(step);
    }
    
    uid = get_from_node_(step, "uid");
    ca_logger.DeWrite(3);
    return uid;
}

PARecordingAutomat.prototype.add_new_transition_ = function(uid, mac, prev_macro, prev_step_index) {
    ca_logger.Write(3, "PARecordingAutomat::add_new_transition_", "", "");
    var ns_index = Project.CurrentTourstop();
    var action = this.get_action_type_(mac);

    if (this.next_step_uid_ != null) {
         this.set_next_process_attrib_(mac, ns_index, action);
    }
    prev_macro = get_act_macro_from_index(prev_step_index);
    var prev_page_key = get_page_key_from_index(prev_step_index);

    var mac_elem_type = "";
    var prev_mac_elem_type = "";

    mac_elem_type = get_from_node_(mac, "element_type");
    prev_mac_elem_type = get_from_node_(prev_macro, "element_type");

    if (prev_macro != null) {
        if (!is_scroll_type(mac_elem_type) || !is_scroll_type(prev_mac_elem_type)) {
            this.trans_mac_for_prev_ns_(uid, mac,prev_macro,ns_index,prev_step_index,prev_page_key);
        }
    }
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.trans_mac_for_prev_ns_ = function(uid, mac, prev_macro, ns_index, prev_step_index, prev_page_key) {
    ca_logger.Write(3, "PARecordingAutomat::trans_mac_for_prev_ns_", "", "");

    var action = this.get_action_type_(prev_macro);

    update_node_(prev_macro, "step_name1", uid);
    update_node_(prev_macro, "trans_action", action);
    ca_logger.DeWrite(3);
}

PARecordingAutomat.prototype.undo = function() {
    this.reset_special_handlers_();
    var last_mac = get_last_prj_mac();
    if (last_mac.index >= 2) {
        Project.DeleteEvent(last_mac.macro.TourPosition());
        Project.DeleteTourstop(Project.CurrentTourstop());
        this.bar_.EnableButton(nautomation_bar_buttons["UNDO"], false);
    }
}

PARecordingAutomat.prototype.create_keypress_macro_ = function() {
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

PARecordingAutomat.prototype.merge_scroll_macros_ = function(prev_mac,curr_mac) {
    if (prev_mac == null || curr_mac == null) {
        return;
    }

    var prev_type = "";
    var curr_type = "";

    prev_type = get_from_node_(prev_mac, "element_type");
    curr_type = get_from_node_(curr_mac, "element_type");
    if (is_scroll_type(prev_type) && is_scroll_type(curr_type) ||
        (this.is_prev_mouse_wheel_ && this.is_curr_mouse_wheel_)) {
        Project.DeleteTourstop(Project.CurrentTourstop());
    } else if (is_scroll_type(prev_type) || this.is_prev_mouse_wheel_) {
        this.update_scroll_text_(prev_mac, curr_mac);
    }
}
