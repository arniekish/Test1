#use(config.js)
#use(nautomation_constants.js)
#use(automation_helpers.js)

function nav_update_explain(mac, params) {
    ca_logger.Write(3, "nav_update_explain", "", "");
    set_default_duration(mac);
    
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    
    nav_set_path(mac, params);

    if (params.ReplaceTxt) {
        var infotext = ch_get_infotxt(params.Type);
        
        if (mac.HasParam("fieldname")) {
            mac.SetParam("fieldname", get_fieldname(params.Info));
        }

        nav_set_msg_param(mac, infotext);
    }
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", "WINExplain");
    }
    ca_logger.DeWrite(3);
}

function nav_update_explain_l(mac, params) {
    ca_logger.Write(3, "nav_update_explain_l", "", "");
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);

    if (params.ReplaceTxt) {
        var infotext = ch_get_infotxt(params.Type);

        if (mac.HasParam("fieldname")) {
             mac.SetParam("fieldname", get_fieldname(params.Info));
        }

        nav_set_msg_param(mac, infotext);
    }
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", "WINExplainLong");
    }
    ca_logger.DeWrite(3);
}

function nav_update_keypress(mac, params) {
    // xxx keyname in js
    ca_logger.Write(3, "nav_update_keypress", "", "");
    var key_name = KeyUtils.KeyName(params.Action.key_code, params.Action.shift, params.Action.ctrl, params.Action.alt);
    if (mac.HasParam("key_name")) {
    	mac.SetParam("key_name", key_name);
    }

    if (mac.HasParam("key_desc")) {
        var key_desc = KeyUtils.LocalizedName(params.Action.key_code, params.Action.shift, params.Action.ctrl, params.Action.alt);
        if (key_desc == "ctrl pause_break") {
            key_desc = "ctrl pause/break";
        }
        mac.SetParam("key_desc", key_desc);
    }
    
    if (mac.HasParam("hotkey")) {
        mac.SetParam("hotkey", KeyUtils.KeysV2(params.Action.key_code, params.Action.shift, params.Action.ctrl, params.Action.alt));
    }
    
    if (params.ReplaceTxt) {
        var infotext = ch_get_infotxt(params.Type);

        nav_set_msg_param(mac, infotext);
    }
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", "WINKeyPress");
    }

    if (mac.HasParam("orientation")) {
        mac.SetParam("orientation", "C");
    }

    var rect = params.WindowsStack.GetRect();
    var width = rect.right - rect.left;
    var height = rect.bottom - rect.top;
    var pt = CreatePoint(width/2, height/2);
	if (mac.HasParam("click_pos_rel") && pt != undefined) {
		mac.SetParam("click_pos_rel", pt);
	}
    ca_logger.DeWrite(3);
}

function nav_update_edit(mac, params) {
    ca_logger.Write(3, "nav_update_edit", "", "");
    var fieldname = get_fieldname(params.Info);
    var newvalue = ""; //xxx end value here   params.Info.GetProperty(ninfo_attributes["VALUE"]);
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);
    var is_passwd =  (params.Info.GetProperty(ninfo_attributes["PASSWORD"]) == "1") ? true : false;
    
    if (params.Action.click_type != "rclick") {
        
        var key_name = "";
        
        if (params.Action.type == naction_type["KEYBOARD_ACT"]) {
            key_name = KeyUtils.KeyName(params.Action.key_code);
        }
        
        var tab = (key_name == "tab");
        var enter = (key_name == "enter");
        var button = false;

        if (params.Info.GetProperty(ninfo_attributes["SUBTYPE"]) == "ComboEdittpcd") { 
             tab = false;
             enter = true;
             button = false;
             infotext = ch_get_infotxt("WINComboEdittpcd");
        } else if (!tab && !enter) {
            /* xxx
            tab    = cfg.standard.winrec.input_confirm_tab;
            enter  = cfg.standard.winrec.input_confirm_enter;
            button = cfg.standard.winrec.input_confirm_button;
            */
        }

        if (mac.HasParam("confirmation_tab")) {
            mac.SetParam("confirmation_tab", tab);
        }

        if (mac.HasParam("confirmation_enter")) {
            mac.SetParam("confirmation_enter", enter);
        }

        if (mac.HasParam("confirmation_key") && (key_name == "enter" || key_name == "tab")) {
            mac.SetParam("confirmation_key", key_name);
        }
       
       /* 
        var confirmtext = ch_input_infotxt(tab, enter, button);

        if (confirmtext != null) {
            infotext.demo += confirmtext.demo;
            infotext.prac += confirmtext.prac;
        }
        */
    }
    
    nav_set_click_type(mac, params.action, params.LastMouseAction);
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    if (mac.HasParam("text_d") && !is_passwd) mac.SetParam("text_d", newvalue);
    if (mac.HasParam("regexp") && is_passwd) mac.SetParam("regexp", ".*");
    if (mac.HasParam("fieldname")) mac.SetParam("fieldname", fieldname);
    if (mac.HasParam("macro_comment"))  mac.SetParam("macro_comment", fieldname);
    // xxx if (mac.HasParam("set_focus")) mac.SetParam("set_focus", cfg.standard.winrec.insert_inactive_edit_macros);
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    
    if (mac.HasParam("all_values")) {
        var all_vals = params.Info.GetProperty(ninfo_attributes["ALLVALUES"]);
        
        if (all_vals != "") {
            mac.SetParam("all_values", all_vals);
        }
    }
    ca_logger.DeWrite(3);
}

//
function nav_update_mledit(mac, params) {
    ca_logger.Write(3, "nav_update_mledit", "", "");
    var fieldname = get_fieldname(params.Info);
    var initvalue = params.Info.GetProperty(ninfo_attributes["VALUE"]);
    var newvalue = "";
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);
    var is_passwd =  (params.Info.GetProperty(ninfo_attributes["PASSWORD"]) == "1") ? true : false;

    if (params.Action.click_type != "rclick") {

        var key_name = "";

        if (params.Action.type == naction_type["KEYBOARD_ACT"]) {
            key_name = KeyUtils.KeyName(params.Action.key_code);
        }

        var tab = (key_name == "tab");
        var enter = (key_name == "enter");
        var button = false;


        if (params.Info.GetProperty(ninfo_attributes["SUBTYPE"]) == "ComboEdittpcd") {
             tab = false;
             enter = true;
             button = false;
             infotext = get_infotxt("WINComboEdittpcd");
        }

        if (mac.HasParam("confirmation_tab")) {
            mac.SetParam("confirmation_tab", tab);
        }

        if (mac.HasParam("confirmation_enter")) {
            mac.SetParam("confirmation_enter", enter);
        }

        if (mac.HasParam("confirmation_key") && (key_name == "enter" || key_name == "tab")) {
            mac.SetParam("confirmation_key", key_name);
        }

        var confirmtext = ch_input_infotxt(tab, enter, button);

        infotext.demo += confirmtext.demo;
        infotext.prac += confirmtext.prac;
    }

    nav_set_click_type(mac, params.Action, params.LastMouseAction);
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    if (mac.HasParam("text_d") && !is_passwd) mac.SetParam("text_d", newvalue);
    if (mac.HasParam("text_full") && !is_passwd) mac.SetParam("text_full", newvalue);
    if (mac.HasParam("fieldname")) mac.SetParam("fieldname", fieldname);
    if (mac.HasParam("macro_comment"))  mac.SetParam("macro_comment", fieldname);
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    
    if (mac.HasParam("all_values")) {
        var all_vals = params.Info.GetProperty(ninfo_attributes["ALLVALUES"]);
        
        if (all_vals != "") {
            mac.SetParam("all_values", all_vals);
        }
    }
    ca_logger.DeWrite(3);
}
//

function nav_update_checkbox(mac, params) {
    ca_logger.Write(3, "nav_update_checkbox", "", "");
    var fieldname = get_fieldname(params.Info);
    var newvalue = params.Info.GetProperty(ninfo_attributes["STATE"]);

    if (params.Type != "WINRadio") {
        newvalue = (newvalue == "checked" ? "unchecked" : "checked");
    } else {
        newvalue = "checked";
    }
    var infotext = ch_get_infotxt(params.Type);
    
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    update_node_(mac, "choose_bool", (newvalue == "checked" ? "1" : "0"));

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    ca_logger.DeWrite(3);
}

function nav_update_selectbox(mac, params) {
    ca_logger.Write(3, "nav_update_selectbox", "", "");
    var fieldname = get_fieldname(params.Info);
    var newvalue = params.Info.GetProperty(ninfo_attributes["VALUE"]);
    var infotext = ch_get_infotxt(params.Type);

    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (mac.HasParam("choose_text") && newvalue != "") {
        var arr = newvalue.split('\n');
        
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != "") {
                var index = arr[i].indexOf("{*}");
                if (index != -1) {
                    var val = arr[i].substr(index + 3, arr[i].length);
                    mac.SetParam("choose_text", val);
                }
            }
        }
    }
    
    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    
    if (mac.HasParam("all_values")) {
        var all_vals = params.Info.GetProperty(ninfo_attributes["ALLVALUES"]);
        
        if (all_vals != "") {
            mac.SetParam("all_values", all_vals);
        } else {
            mac.SetParam("all_values", newvalue);
        }
    }
    ca_logger.DeWrite(3);
}

function nav_update_tpcd_click(mac, params) {
    ca_logger.Write(3, "nav_update_tpcd_click", "", "");
    var fieldname = get_fieldname(params.Info);
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);

    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    nav_set_click_type(mac, params.Action, params.LastMouseAction);

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    ca_logger.DeWrite(3);
}

function nav_set_hotkey(mac, params, infotext) {
    ca_logger.Write(3, "nav_set_hotkey", "", "");
    var hotkey = params.Info.GetProperty(ninfo_attributes["HOTKEY"]);
    var tooltip = params.Info.GetProperty(ninfo_attributes["TOOLTIP"]);
    var key_desc = hotkey;

    if (!(hotkey && hotkey != "")) {
        key_desc = tooltip;
        if (key_desc && key_desc != "") {
            var res = key_desc.match(/\(((\w|\s)+(\+(\w|\s)+)*)\)/g); //(WORD  WORD (+WORD)*)
            if (res) {
                key_desc = res[res.length - 1];
                key_desc = key_desc.substr(1, key_desc.length - 2);
            } else {
                key_desc = "";
            }
        }
    } else {
        var pos = hotkey.indexOf(";");
        if (pos != -1) {
            hotkey = hotkey.substr(0, pos);
            key_desc = hotkey;
        }
        
        var res = hotkey.match(/Alt,/g);
        if (res) {
            hotkey = "";
            key_desc = "";
        }
    }
    
    if (key_desc && key_desc != "") {
        var hotkey = key_desc.toLowerCase();
        var key_arr = hotkey.split('+');
        
        for (var i = 0; i < key_arr.length; i++) {
            if (key_desc_table[key_arr[i]] != undefined) {
                key_arr[i] = key_desc_table[key_arr[i]];
            }
        }
        
        hotkey = key_arr.join(' ');
        var action = get_keyaction(hotkey);
        
        if (mac.HasParam("hotkey")) {
            mac.SetParam("hotkey", KeyUtils.KeysV2(action.key_code, action.shift, action.ctrl, action.alt));
        }
        
        if (mac.HasParam("key_name")) {
            mac.SetParam("key_name", hotkey);
        }
        
        if (mac.HasParam("key_desc")) {
            mac.SetParam("key_desc", key_desc);
        }
        
        infotext.demo += ch_get_key_infotxt("confirm_hotkey").demo;
        infotext.prac += ch_get_key_infotxt("confirm_hotkey").prac;
    }
    ca_logger.DeWrite(3);
    return infotext;
}


function nav_update_click(mac, params) {
    ca_logger.Write(3, "nav_update_click", "", "");
    var fieldname = get_fieldname(params.Info);
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    //if (fieldname.length == 0) {
        nav_set_images(mac, params);
        nav_set_pos_rect(mac, params);
    //}
    
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    infotext = nav_set_hotkey(mac, params, infotext);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    nav_set_click_type(mac, params.Action, params.LastMouseAction);
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    
    if (mac.HasParam("all_values")) {
        var all_vals = params.Info.GetProperty(ninfo_attributes["ALLVALUES"]);
        
        if (all_vals != "") {
            mac.SetParam("all_values", all_vals);
        }
    }
    ca_logger.DeWrite(3);
}

function nav_update_tab_click(mac, params) {
    ca_logger.Write(3, "nav_update_tab_click", "", "");
    var fieldname = get_fieldname(params.Info);
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    nav_set_click_type(mac, params.Action, params.LastMouseAction);
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    ca_logger.DeWrite(3);
}

function nav_update_text_click(mac, params) {
    ca_logger.Write(3, "nav_update_text_click", "", "");
    var fieldname = get_fieldname(params.Info);
    var infotext = nav_get_infotxt(mac, params.Type, params.Action, params.LastMouseAction);

    if (mac.HasParam("fieldname")) {
        mac.SetParam("fieldname", fieldname);
    }
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", fieldname);
    }
    nav_set_images(mac, params);
    nav_set_pos_rect(mac, params);
    nav_set_path(mac, params);
    nav_set_manual_rerec(mac, params.Type);

    if (params.ReplaceTxt) {
        nav_set_msg_param(mac, infotext);
    }

    nav_set_click_type(mac, params.Action, params.LastMouseAction);
    
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", params.Type);
    }
    ca_logger.DeWrite(3);
}

function nav_update_asset(mac, screen, webcompat) {
    ca_logger.Write(3, "nav_update_asset", "", "");
    if (mac.HasParam("element_type")) {
        mac.SetParam("element_type", "screenshot");
    }

    if (screen != null && mac.HasParam("new_step")) {
        mac.SetParam("new_step", screen.Title());
    }

    if (mac.HasParam("dump_page")) {
        /*
        if (webcompat && screen != null && screen.Filename() != "" && screen.GetWebCompat()) {
            mac.SetParam("dump_page", screen.Filename());
        } else {
            mac.SetParam("dump_page", "index.html");
        }
        */
        var res = mac.GetResource();
        var subres = res.CreateUniqueSubResource("dump_page");
    
        screen.SetResource(subres);
        
        mac.SetObjectParam("dump_page", screen.GetScreenDump());
    }

    if (mac.HasParam("screenshot_rect")) {
        var r = CreateRect(0, 0, screen.Width(), screen.Height());
        
        mac.SetParam("screenshot_rect", r);
    }
        
    if (mac.HasParam("screenshot_file")) {
        mac.SetParam("screenshot_file", "img.png");
    }
    ca_logger.DeWrite(3);
}

function nav_update_activearea(mac, screen, rect) {
    ca_logger.Write(3, "nav_update_activearea", "", "");
    if (mac.HasParam('area') && rect != null) {
        mac.SetParam('area', rect);
    }
    
    if (screen != null) {
        screen.SaveImgFragment("fieldicon.png", mac.GetResource(), rect);
        
        if (mac.HasParam("fieldicon")) {
            mac.SetParam("fieldicon", "fieldicon.png");
        }
    }
    ca_logger.DeWrite(3);
}

function nav_update_target(mac, pagekey, config_file, revision, screen, proc_id, ts, name, exe) {
    ca_logger.Write(3, "nav_update_target", "", "");
    screen.SetResource(mac.GetResource());
    
    if (mac.HasParam('key') && pagekey != "") {
       mac.SetParam('key', pagekey);
    }
    
    if (mac.HasParam('executable') && exe != "") {
        mac.SetParam('executable', exe);
    }
   
    if (mac.HasParam('config_file')) {
       mac.SetParam('config_file', config_file);
    }
   
    if (mac.HasParam('revision')) {
       mac.SetParam('revision', revision);
    }
   
    if (mac.HasParam("win_rect")) {
        var r = CreateRect(0, 0, screen.width, screen.height);
         
        mac.SetParam("win_rect", r);
    }

    if (mac.HasParam("dump_page")) {
        var res = mac.GetResource();
        var subres = res.CreateUniqueSubResource("dump_page");
    
        screen.SetResource(subres);
        
        mac.SetObjectParam("dump_page", screen);
    }
   
    if (mac.HasParam("process_id")) {
        mac.SetParam("process_id", "" + proc_id);
    }
    
    if (mac.HasParam('ts')) {
        mac.SetParam('ts', ts);
    }
 
    if (mac.HasParam("target_name"))  {
        mac.SetParam("target_name", name);
    }
    
    if (mac.HasParam("macro_comment"))  {
        mac.SetParam("macro_comment", name);
    }
    ca_logger.DeWrite(3);
}

function nav_update_list_click(mac,params) {
    if (mac) {
        if (update_if_not_prev_combo_(mac,params)) {
            return;
        }
        update_the_prev_combo_(mac,params);
    }
}

function update_if_not_prev_combo_(mac,params) {
    if (params.PrevMac.GetParam("element_type") != "WINButtonCombo") {
        nav_update_text_click(mac,params); 
        return true;
    }
    return false;
}

function update_the_prev_combo_(mac,params) {
    ca_logger.Write(3, "update_the_prev_combo_", "", "");
    var fieldname="";
    fieldname = get_fieldname(params.Info);
    update_node_(params.PrevMac,"choose_text",fieldname);

    var sel_indx_= -1;
    if (params.PrevMac.HasParam("all_values"))
    {
        sel_indx_ = get_dditem_index(params.PrevMac.GetParam("all_values"),fieldname);
    }

    update_node_(params.PrevMac,"choose_nr",sel_indx_);
    update_from_node_(mac,"fieldname",params.PrevMac);
    ca_logger.DeWrite(3);
}
