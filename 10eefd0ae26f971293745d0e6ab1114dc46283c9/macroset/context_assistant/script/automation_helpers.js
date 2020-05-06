#use(config.js)
#use(nlang.js)
#use(nautomation_constants.js)

function nav_types_compatible(mac_type, new_type) {
    if (mac_type == "WINComboEdittpcd") mac_type = "WINEdit";
    if (new_type == "WINComboEdittpcd") new_type = "WINEdit";
    
    return (mac_type == new_type);
}

function nav_elem_xtype(info) {
    var type = "";

    if (info != null) {
        var subtype = info.GetProperty(ninfo_attributes["SUBTYPE"]);
        var ctrl_type = info.GetProperty(ninfo_attributes["TYPE"]);

        if (subtype == "#explanation") {
            type = "WINExplain";
        } else if (subtype == "#explanation_l") {
            type = "WINExplainLong";
        } else if (subtype == "ClickToActivate") {
            type = "WINClickToActivate";
        } else if (subtype == "RightMouse") {
            type = "WINRightMouse";
        } else if (subtype == "ComboEdittpcd") {
            type = "WINComboEdittpcd";
        } else if (ctrl_type == "edit") {
            type = "WINEdit";
        } else if (ctrl_type == "mledit") {
            type = "WINMLEdit";
        } else if (ctrl_type == "mledit") {
            type = "WINMLEdit";
        } else if (ctrl_type == "MouseWheel") {
			type = "WINScrollWheel";
		} else if (ctrl_type == "KeyPress") {
			type = "WINKeyPress";
		} else if (ctrl_type == "checkbox" || ctrl_type == "radio") {
            var newvalue = info.GetProperty(ninfo_attributes["STATE"]);

            if (ctrl_type == "radio") {
                type = "WINRadio";
            } else if (newvalue == "checked") {
                type = "WINCBChecked";
            } else {
                type = "WINCBUnchecked";
            }
        } else if (ctrl_type == "listbox" || ctrl_type == "ddlistbox") {
            type = "WINListBox";
        } else if (ctrl_type != "") {

            if (subtype == "tpcd") {
                type = "WINTransCode";
            } else {
                
                // some special buttons, hrefs here
                if (subtype == "Enter") {
                    type = "WINButtonEnter";
                } else if (subtype == "Confirm") {
                    type = "WINButtonConfirm";
                } else if (subtype == "Save") {
                    type = "WINButtonSave";
                } else if (subtype == "Back") {
                    type = "WINButtonBack";
                } else if (subtype == "End") {
                    type = "WINButtonEnd";
                } else if (subtype == "HelpValue") {
                    type = "WINButtonHelpValue";
                } else if (subtype == "ComboButton") {
                    type = "WINButtonCombo";
                } else if (subtype == "ListItem") {
                    type = "WINListItem";
                } else if (subtype == "ComboBoxListItem") {
                    type = "WINCBListItem";
                } else if (subtype == "ComboBoxCalendarItem") {
                    type = "WINCBCalendarItem";
                } else if (subtype == "GeneralMenue") {
                    type = "WINGeneralMenue";
                } else if (subtype == "Menue") {
                    type = "WINMenue";
                } else if (subtype == "ActiveMenueItem") {
                    type = "WINMenueItem";
                } else if (subtype == "PageTab") {
                    type = "WINPageTab";
                } else if (subtype == "SelectRow") {
                    type = "WINTableRow";
                } else if (subtype == "InactiveEdit") {
                    type = "WINInactiveEdit";
                } else if (subtype == "OpenFolder") {
                    type = "WINOpenFolder";
                } else if (subtype == "vscrollbar") {
                    type = "WINScrollBarVertical";
                } else if (subtype == "hscrollbar") {
                    type = "WINScrollBarHorizontal";
                } else if (subtype == "scrollarealeft") {
                    type = "WINScrollAreaLeft";
                } else if (subtype == "scrollarearight") {
                    type = "WINScrollAreaRight";
                } else if (subtype == "scrollareaup") {
                    type = "WINScrollAreaUp";
                } else if (subtype == "scrollareadown") {
                    type = "WINScrollAreaDown";
                } else if (subtype == "scrollbutton") {
                    type = "WINButtonScroll";
                } else if (subtype == "Text") {
                    type = "WINTextClick";
                } else if (subtype == "CloseFolder") {
                    type = "WINCloseFolder";
                } else if (subtype == "ComboButtontpcd") {
                    type = "WINComboButtontpcd";
                } else if (ctrl_type == "button") {
                    type = "WINButton";
                } else {
                    type = "WINClick";
                }
            }
        }
    }

    return type;
}

function navtype_to_type_desc(wintype) { 
    var type = "";
    var desc = "";

    if (wintype == "WINExplain") {
        desc = "#explanation";
    } else if (wintype == "WINExplainLong") {
        desc = "#explanation_l";
    } else if (wintype == "WINRightMouse") {
        desc = "RightMouse";
    } else if (wintype == "WINComboEdittpcd") {
        type = "edit";
        desc = "ComboEdittpcd";
    } else if (wintype == "WINEdit") {
        type = "edit";
    } else if (wintype == "WINRadio") {
        type = "radio";
    } else if (wintype == "WINCBChecked") {
        type = "checkbox";
    } else if (wintype == "WINCBUnchecked") {
        type = "checkbox";
    } else if (wintype == "WINListBox") {
        type = "ddlistbox";
    } else {
        type = "hrefarea";
     
        if (wintype == "WINTransCode") {
            desc = "tpcd";
        } else if (wintype == "WINButtonEnter") {
            desc = "Enter";
        } else if (wintype == "WINButtonConfirm") {
            desc = "Confirm";
        } else if (wintype == "WINButtonSave") {
            desc = "Save";
        } else if (wintype == "WINButtonBack") {
            desc = "Back";
        } else if (wintype == "WINButtonEnd") {
            desc = "End";
        } else if (wintype == "WINButtonHelpValue") {
            desc = "HelpValue";
        } else if (wintype == "WINButtonCombo") {
            desc = "ComboButton";
        } else if (wintype == "WINListItem") {
            desc = "ListItem";
        } else if (wintype == "WINCBListItem") {
            desc = "ComboBoxListItem";
        } else if (wintype == "WINCBCalendarItem") {
            desc = "ComboBoxCalendarItem";
        } else if (wintype == "WINMenue") {
            desc = "Menue";
        } else if (wintype == "WINMenueItem") {
            desc = "ActiveMenueItem";
        } else if (wintype == "WINTableRow") {
            desc = "SelectRow";
        } else if (wintype == "WINInactiveEdit") {
            desc = "InactiveEdit";
        } else if (wintype == "WINOpenFolder") {
            desc = "OpenFolder";
        } else if (wintype == "WINScrollBarVertical") {
            desc = "vscrollbar";
        } else if (wintype == "WINScrollBarHorizontal") {
            desc = "hscrollbar";
        } else if (wintype == "WINScrollAreaLeft") {
            desc = "scrollarealeft";
        } else if (wintype == "WINScrollAreaRight") {
            desc = "scrollarearight";
        } else if (wintype == "WINScrollAreaUp") {
            desc = "scrollareaup";
        } else if (wintype == "WINScrollAreaDown") {
            desc = "scrollareadown";
        } else if (wintype == "WINButtonScroll") {
            desc = "scrollbutton";
        } else if (wintype == "WINTextClick") {
            desc = "Text";
        } else if (wintype == "WINCloseFolder") {
            desc = "CloseFolder";
        } else if (wintype == "WINComboButtontpcd") {
            desc = "ComboButtontpcd";
        } else if (wintype == "WINButton") {
            desc = "button";
        } else if (wintype == "WINPageTab") {
            desc = "PageTab";
        }
    }

    return {t:type, d:desc};
} 

function nav_scroll_action(subtype) {
    
    if (subtype == "vscrollbar" || subtype == "hscrollbar" ||
        subtype == "scrollarealeft" || subtype == "scrollarearight" ||
        subtype == "scrollareaup" || subtype == "scrollareadown" ||
        subtype == "scrollbutton")
    {
        return true;
    }

    return false;
}

function is_scroll_type(type) {
    
    if (type.indexOf("Scroll") != -1){
        return true;
    }

    return false;
}

function is_scroll_info(info) {
    return is_scroll_type(nav_elem_xtype(info));
}

function is_scroll_mac(mac) {
    
    if (mac.HasParam("element_type")) {
        var type = mac.GetParam("element_type");
        
        return is_scroll_type(type);
    }
    
    return false;
}

function is_checkbox_type(type) {
    
    if (type == "WINCBChecked" || type == "WINCBUnchecked"){
        return true;
    }

    return false;
}

function is_checkbox_info(info) {
    return is_checkbox_type(nav_elem_xtype(info));
}

function is_checkbox_mac(mac) {
    
    if (mac.HasParam("element_type")) {
        var type = mac.GetParam("element_type");
        
        return is_checkbox_type(type);
    }
    
    return false;
}

function is_confirmation_type (mac) {
    var temp = mac.Template();
    var elem_type = "";
    elem_type = get_from_node_(mac, "element_type");
    
    if ((temp == "explanation_long") || 
        (temp == "active_area") || 
        (temp == "key_press") || 
        (temp == "input_text") || 
        (is_scroll_type(elem_type))) 
    {
        return true;
    }
    return false;
}

function set_default_duration(mac) {
    if (mac.HasParam("b_duration")) {
       // xxx mac.SetParam("b_duration", cfg.standard.winrec.default_bubble_duration);
    }
}

function nav_set_path(mac, params) {
    
    if (mac.HasParam("path")) {
        mac.SetParam("path", params.Info.Key);
    } 
}

function nav_use_fieldname_icon(wintype) {

    if (wintype == "WINClickToActivate" ||
        wintype == "WINInactiveEdit" ||
        wintype == "WINEdit" ||
        wintype == "WINMLEdit" ||
        wintype == "WINRadio" ||
        wintype == "WINCBChecked" ||
        wintype == "WINCBUnchecked" ||
        wintype == "WINListBox" ||
        wintype == "WINButtonCombo")
    {
        return true;
    }

    return false;
} 

function get_fieldname(info) {
    var fieldname = info.GetProperty(ninfo_attributes["FIELDNAME"]);
    fieldname = fieldname.replace('\u2028', ' ');
    return fieldname;
}


function nav_set_images(mac, params) {
    ca_logger.Write(3, "nav_set_images", "", "");
    if (params.Info != null && params.Screen != null) {
        var sc_dump = params.Screen.GetScreenDump();
        
        if (sc_dump != null) {
            sc_dump.SaveImgFragment("screenshot_file.png", mac.GetResource(), params.Info.GetRect());
            if (mac.HasParam("screenshot_file")) {
                mac.SetParam("screenshot_file", "screenshot_file.png");
            }
        
            var fieldname = get_fieldname(params.Info);
            var img_name = "";

            if (nav_use_fieldname_icon(nav_elem_xtype(params.Info))) {
                if (fieldname == "") {
                    img_name = sc_dump.SaveUniqueImgFragment("fieldicon.png", mac.GetResource(), params.Info.GetFieldnameRect());
                }
            } else {
                img_name = sc_dump.SaveUniqueImgFragment("fieldicon.png", mac.GetResource(), params.Info.GetRect());
            }

            if (mac.HasParam("fieldicon")) {
                mac.SetParam("fieldicon", img_name);
            }
        }
    }
    ca_logger.DeWrite(3);
}

function nav_set_pos_rect(mac, params) {
    ca_logger.Write(3, "nav_set_pos_rect", "", "");
    var info = params.Info;
    var action = params.Action;
    var screen_rect = params.Screen.GetScreenDump().ScreenRect();
    var ctrl_rect = info.GetRect();
    
    if (params.LastMouseAction != null && params.LastMouseAction.type == naction_type["MOUSE_ACT"]) {
        action = params.LastMouseAction;
    }
    
    if (action != null && screen_rect != null) {
        ca_logger.Log(2, "action2: " + action.x + "," + action.y + " screen: " + screen_rect.left + "," + screen_rect.top, "", "");
        var click_pos = CreatePoint(action.x - screen_rect.left, action.y - screen_rect.top);
        if (mac.HasParam("click_pos")) {
            mac.SetParam("click_pos", click_pos);
        }
    }

    if (mac.HasParam("screenshot_rect")) {
        mac.SetParam("screenshot_rect", ctrl_rect);
    }

    if (mac.HasParam("overlay_pos")) {
        mac.SetParam("overlay_pos", ctrl_rect.topleft);
    }
    ca_logger.DeWrite(3);
}

function nav_set_msg_param(mac, infotext) {
    ca_logger.Write(3, "nav_set_msg_param", "", "");
    if (infotext.prac != "" && mac.HasParam("explanation_d")) {
        var replace = true;
        
        if (mac.HasParam("explanation_d_modified") && mac.GetParam("explanation_d_modified")) {
            replace = false;
        }
        
        if (replace) {
            mac.SetParam("explanation_d", infotext.prac);
        }
    }
    ca_logger.DeWrite(3);
}
        
function nav_set_click_type(mac, action, prev_mouse_act) {
    var myaction = action;
    
    if (prev_mouse_act != null && prev_mouse_act.type == naction_type["MOUSE_ACT"]) {
        myaction = prev_mouse_act;
    }
    
    if (mac.HasParam("action")) {
        mac.SetParam("action", myaction.click_type);
    }
}

function ch_get_key_infotxt(tk) {
    ca_logger.Write(2, "ch_get_key_infotxt(" + tk + ")", "", "");
    var dt = '';
    var pt = '';

    //DPS-3839 because console error (nav_lang_tbl is null) was coming if additional id recorded is not select single or input text
    if (nav_lang_tbl != null) {
        if (typeof(nav_lang_tbl[tk+'.demo']) == 'string') {
            dt = nav_lang_tbl[tk+'.demo'];
        }

        if (typeof(nav_lang_tbl[tk+'.prac']) == 'string') {
            pt = nav_lang_tbl[tk+'.prac'];
        }
    }
    
    res = {
        demo: dt,
        prac: pt
    };
    ca_logger.DeWrite(3);
    return res;
}

function ch_get_infotxt(type) {
    ca_logger.Write(2, "ch_get_infotxt(" + type + ")", "", "");
    var hdl = nhmap[type];

    var res;
    var tk = '?';

    if (nav_lang_tbl != null && typeof(hdl) == 'object') {
        tk = hdl.textkey;
        ca_logger.Log(1, "textkey: " + tk, "", ""); 
        res = ch_get_key_infotxt(tk);
    } else if (typeof(hdl) == 'object') {
        ca_logger.Log(1, "nav_lang_tbl == null: " + hdl.textkey, "", "");
    } else if (nav_lang_tbl != null) {
        ca_logger.Log(1, "typeof(hdl) == " + typeof(hdl), "", "");
    }

    if (typeof(res) != 'object') {
        res = {
            demo: "Click on ... (" + type + "/" + tk + "/" + Project.Language + ")",
            prac: "Please click on ... (" + type + "/" + tk + "/"  + Project.Language + ")",
        }
    }
    if (res) {
        res.demo = transform(res.demo);
        res.prac = transform(res.prac);
    }
    ca_logger.DeWrite(2);
    return res;
}

function transform(s) {
    if (!s) {
        return s;
    }
    s = RenderHtml(s, 4);
    return s;
}

function ch_input_infotxt(tab, enter, button) {
    var infotxt;
    if (tab && enter && button) {
        infotxt = ch_get_infotxt("INPUTtextTabEnterButton");
    } else if (tab && enter) {
        infotxt = ch_get_infotxt("INPUTtextTabEnter");
    } else if (tab) {
        infotxt = ch_get_infotxt("INPUTtextTab");
    } else if (enter && button) {
        infotxt = ch_get_infotxt("INPUTtextEnterButton");
    } else if (enter) {
        infotxt = ch_get_infotxt("INPUTtextEnter");
    } else if (button) {
        infotxt = ch_get_infotxt("INPUTtextButton");
    } else {
        infotxt = { demo: '', prac: '' };
    }
    return infotxt;
}

function nav_get_infotxt(mac, type, action, prev_mouse_act) {
    var infotext = ch_get_infotxt(type);
    var myaction = action;
    
    if (prev_mouse_act != null && prev_mouse_act.type == naction_type["MOUSE_ACT"]) {
        myaction = prev_mouse_act;
    }
    
    if (mac.HasParam("action")) {
        var my_type = nhmap[type + "::" + myaction.click_type];
        if (my_type != null) {
            infotext = ch_get_infotxt(type + "::" + myaction.click_type);
        }
    }
    return infotext;
}

function nav_set_manual_rerec(mac, type) {

    if (mac.HasParam("rerec_manual")) {
        var my_type = nhmap[type];
        if (my_type != null) {
            //mac.SetParam("rerec_manual", my_type.manual_rerec);
        }
    }
}


function info_to_string(info) {
    var info_txt = "";
    
    if (info != null) {
        var type = info.GetProperty(ninfo_attributes["TYPE"]);
        var subtype = info.GetProperty(ninfo_attributes["SUBTYPE"]);
        var fieldname = get_fieldname(info);
        var value = info.GetProperty(ninfo_attributes["VALUE"]);
               
        info_txt += type;
        
        if (subtype.length > 0) {
            info_txt = info_txt + " / " + subtype;
        }
        if (fieldname.length > 0) {
            info_txt = info_txt + " - \"" + fieldname + '"';
        }
        if (value.length > 0) {
            info_txt = info_txt + " : \"" + value + '"';
        }
    }
    
    if (info_txt) {
        info_txt = " (" + info_txt + ")";
    }
    
    return info_txt;
}

function is_inactive_edit(info) {
    
    if (info != null) { 
        var subtype = info.GetProperty(ninfo_attributes["SUBTYPE"]);
        
        if (subtype == "InactiveEdit" || subtype == "ListItem") {
            return true;
        }
    }

    return false;
}

function inactive_edit_check(info) {

    if (is_inactive_edit(info)) { 
        info.SetProperty(ninfo_attributes["TYPE"], "hrefarea");

        return true;
    }

    return false;
}

function combo_check(info) {

    if (info != null) {
        var subtype = info.GetProperty(ninfo_attributes["SUBTYPE"]);
        
        if (subtype == "ComboEdit") {
            info.SetProperty(ninfo_attributes["TYPE"], "hrefarea");
            info.SetProperty(ninfo_attributes["SUBTYPE"], "ComboButton");
        }
    }
}

function is_modifier(keyname) {
    return keyname == "shift" || keyname == "alt" || keyname == "ctrl";
}

function is_scroll_action(descriptor) {
    
    if (descriptor == "vscrollbar" || descriptor == "hscrollbar" ||
        descriptor == "scrollarealeft" || descriptor == "scrollarearight" ||
        descriptor == "scrollareaup" || descriptor == "scrollareadown" ||
        descriptor == "scrollbutton")
    {
        return true;
    }

    return false;
}

function rects_equal(r1, r2) {
    
    if (r1 != null && r2 != null) {
        
        if (r1.left == r2.left && r1.right == r2.right && r1.top == r3.top && r1.bottom == r4.bottom) {
            return true;
       }
    }
    
    return false;
}

 function get_dditem_index(all_values, fieldname) {
    ca_logger.Write(3, "get_dditem_index", "", "");
    if (all_values.length > 0) {
        var arr = all_values.split('\n');
        
        for (var i = 0; i < arr.length; i++) {
            var val = arr[i];

            if (val != "") {
                var index = arr[i].indexOf("{*}");
                if (index != -1) {
                    val = arr[i].substr(index + 3, arr[i].length);
                }

                if (val == fieldname) {
                    ca_logger.DeWrite(3);
                    return i;
                }
            }
        }
    }
    ca_logger.DeWrite(3);
    return -1;
}

function get_keyaction(name) {
    ca_logger.Write(3, "get_keyaction", "", "");
    var action = CreateAction(naction_type["KEYBOARD_ACT"]);
    
    action.key_code = -1;
    action.shift = false;
    action.ctrl = false;
    action.alt = false;
    
    var len = name.length;
    if (len > 0) {
        var index = name.lastIndexOf(' ');

        action.key_code = KeyUtils.KeyCode(name.substr(index+1, len-index+1));
        action.scancode = KeyUtils.ScanCode(name.substr(index+1, len-index+1));

        if (name.indexOf("shift") != -1) action.shift = true;
        if (name.indexOf("ctrl") != -1) action.ctrl = true;
        if (name.indexOf("alt") != -1) action.alt = true;
    }
    ca_logger.DeWrite(3);
    return action;
}

function mouse_move(x, y) {
    var action = CreateAction(naction_type["MOUSE_ACT"]);
    
    action.x = x;
    action.y = y;
    action.click_type = "enter";
    
    action.Execute();
}

function check_types(mac, info, same_lang) {
    var mac_type = "";
    var info_type = nav_elem_xtype(info);

    if (mac.HasParam("element_type")) {
        mac_type = mac.GetParam("element_type");
    }

    if (mac_type == info_type || nav_types_compatible(mac_type, info_type)) {
        
        if (same_lang) {
            var mfieldname = ""; 
            var ifieldname = get_fieldname(info);
            
            if (mac.HasParam("fieldname")) { 
                 fieldname = mac.GetParam("fieldname"); 
            }
            
            if (mfieldname != ifieldname) {
                return "lang_mismatch";
            }
        }
        
        return "match"; 
    }

    return "mismatch";
}


function synthesize_string(value, clear) {
    var action = get_keyaction("end");

    if (clear) {
        action.Execute();

        action = get_keyaction("home");
        action.shift = true;
        action.Execute();

        action = get_keyaction("del");
        action.Execute();
    }

    for (var i = 0; i < value.length; i++) {
        action = KeyUtils.KeyAction("" + value[i]);
        action.Execute();
    }
}

function get_obj_count(obj) {
    var count = 0;
    
    for (var i in obj) {
        count++;
    }
    
    return count;
}

function get_ns_index(pagekey, p_id) {
    ca_logger.Write(2, "get_ns_index() - " + pagekey, "", "");
    var found = false;
    var ts = Project.GetTourstop(0);
    var mac = ts.NextMacro();
    
    while (mac != null) {
        
        if (mac.Template() == "define_target") {
            
            if (mac.HasParam("key")) {
                var has_all = true;
                var proc_id = -1;
                
                if (mac.HasParam("process_id")) {
                    proc_id = mac.GetParam("process_id")
                }
                
                eval("var keys=" + mac.GetParam("key"));
                eval("var keys_new= {" + pagekey + "}"); 
                
                if (get_obj_count(keys) != get_obj_count(keys_new)) {
                    ca_logger.Log(1, "key attributes length mismatch", "", "");
                    has_all = false;
                } else if (proc_id != p_id) {
                    ca_logger.Log(1, "process id (" + p_id + "!=" + proc_id + ") mismatch", "", "");
                    has_all = false;
                } else {
                    
                    for (var i in keys) {
                        
                        if (keys_new[i] == null) {
                            ca_logger.Log(1, "key attribute <" + i + "> not found", "", "");
                            has_all = false;
                            break;
                        } else if (keys[i].constructor == RegExp && !keys[i].test(keys_new[i])) {
                            ca_logger.Log(1, "key attribute <" + i + "> regular expression mismatch", "", "");
                            has_all = false;
                            break;
                        } else if (keys[i].constructor == String && keys[i] != keys_new[i]) {
                            ca_logger.Log(1, "key attribute <" + i + "> string mismatch", "", "");
                            has_all = false;
                            break;
                        }
                    }
                }
                found = has_all;
            }
        }
        
        if (found) break;
        
        mac = ts.NextMacro(mac.TourPosition());
    }
    
    if (found && mac != null) {
        ca_logger.Log(1, "get_ns_index() - found", "", "");
        
        if (mac.HasParam('ts')) {
            var ts_name = "";
            ts_name = mac.GetParam('ts');

            for (var i = 0; i < Project.NumTourstops(); i++) {
                var ts = Project.GetTourstop(i);
    
                if (ts.Name == ts_name) return i;
            }
        }
    } else {
        ca_logger.Log(1, "get_ns_index() - not found", "", "");
    }
     ca_logger.DeWrite(2);
    return -1;
}

function set_unique_comment(objmac) {
    ca_logger.Write(3, "set_unique_comment", "", "");
    if (objmac.HasParam("macro_comment")) {
        
        var ns_index = 0;
        var name_index = 0;
        var comment = Translate(objmac.Template());
        
        if (objmac.HasParam("fieldname")) {
            var fname = objmac.GetParam("fieldname");
            
            if (fname != "") {
                comment = fname;
            }
        }
        
        comment = comment.replace(/"/g, "_");
        comment = comment.replace(/'/g, "_");
        
        var newname = comment;
        while (ns_index < Project.NumTourstops()) {
            var ts = Project.GetTourstop(ns_index);
            var mac = ts.NextMacro();
        
            while (mac != null) {
                if (mac.HasParam("macro_comment") && mac.GetParam("macro_comment") == newname) {
                    newname = comment + " " + name_index;
                    name_index++;
                    ns_index = -1;
                    break;
                }
                
                mac = ts.NextMacro(mac.TourPosition());
            }
            
            ns_index++;
        }
        
        objmac.SetParam("macro_comment", newname);
    }
    ca_logger.DeWrite(3);
}

function get_unique_attrval(val, attrname) {
    ca_logger.Write(3, "get_unique_attrval::val: " + val + " attr: " + attrname, "", "");
    var ns_index = 0;
    var name_index = 0;
    var newval = val;
    
    while (ns_index < Project.NumTourstops()) {
        var ts = Project.GetTourstop(ns_index);
        var mac = ts.NextMacro();
    
        while (mac != null) {
           
            if (mac.HasParam(attrname) && mac.GetParam(attrname) == newval) {
                newval = val + " " + name_index;
                name_index++;
                ns_index = -1;
                break;
            }
            
            mac = ts.NextMacro(mac.TourPosition());
        }
        
        ns_index++;
    }
    ca_logger.DeWrite(3);
    return newval;
}

function get_variables(name) {
    ca_logger.Write(3, "get_variables", "", "");
   var ns_index = 0;
   var arr = [];
   
   while (ns_index < Project.NumTourstops()) {
        var ts = Project.GetTourstop(ns_index);
        var mac = ts.NextMacro();
    
        while (mac != null) {
           
            if (mac.Template() == name && mac.HasParam("var_name")) {
                arr.push(mac.GetParam("var_name"));
            }
            
            mac = ts.NextMacro(mac.TourPosition());
        }
        
        ns_index++;
    }
    ca_logger.DeWrite(3);
    return arr;
}

function get_transition_name(name) {
    ca_logger.Write(3, "get_transition_name", "", "");
   var ns_index = 1;
   var arr = [];
   
   while (ns_index < Project.NumTourstops()) {
        var ts = Project.GetTourstop(ns_index);
        var mac = ts.NextMacro();
    
        while (mac != null) {
            if (mac.Template() == name && mac.HasParam("name") && mac.HasParam("uid")) {
                arr.push({name : mac.GetParam("name"), pos : ns_index, uid : mac.GetParam("uid")});
            }
            mac = ts.NextMacro(mac.TourPosition());
        }
        ns_index++;
    }
    ca_logger.DeWrite(3);
    return arr;
}

function get_macro_from_index(mac_type,index) {
    ca_logger.Write(3, "get_macro_from_index", "", "");
   var ns_index = 0;
   
    var ts = Project.GetTourstop(index);
    var mac = ts.NextMacro();

    while (mac != null) {
       
        if (mac.Template() == mac_type) {
            ca_logger.DeWrite(3);
            return mac;
            break;
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_page_key_from_index(index) {
    ca_logger.Write(3, "get_page_key_from_index", "", "");
    var ts = Project.GetTourstop(index);
    var mac = ts.NextMacro();
    while (mac != null) {
        if (mac.Template() == "define_target") {
            if (mac.HasParam("key")) {
                var page_key = mac.GetParam("key");
                ca_logger.DeWrite(3);
                return page_key;
            }
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}
function get_act_macro_from_index(index) {
    ca_logger.Write(3, "get_act_macro_from_index", "", "");
   var ns_index = 0;
   
    var ts = Project.GetTourstop(index);
    var mac = ts.NextMacro();

    while (mac != null) {
        var temp = mac.Template();
        if ((temp  == "click") || (temp  == "active_area") || (temp  == "key_press") || (temp  == "input_text") || (temp  == "select_single") || (temp  == "input_radio")){
            ca_logger.DeWrite(3);
            return mac;
            break;
        }
        if(temp == "explanation_long") {
            ca_logger.DeWrite(3);
            return mac;
            break;
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function html_encode(s) {
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/</g, '&lt;');
    return s;
}

function convert_to_active_area(mac) {
    ca_logger.Write(3, "convert_to_active_area", "", "");
    var nmac = Project.CreateMacro("active_area");
    
    CopyResource(mac.GetResource(), nmac.GetResource());

    if (mac.HasParam("fieldname") && nmac.HasParam("fieldname")) {
        nmac.SetParam("fieldname", mac.GetParam("fieldname"));
    }

    if (mac.HasParam("click_pos") && nmac.HasParam("click_pos")) {
        nmac.SetParam("click_pos", mac.GetParam("click_pos"));
    }

    if (mac.HasParam("elem_key") && nmac.HasParam("elem_key")) {
        nmac.SetParam("elem_key", mac.GetParam("elem_key"));
    }

    if (mac.HasParam("text_d") && nmac.HasParam("text_d")) {
        nmac.SetParam("text_d", mac.GetParam("text_d"));
    }

    if (mac.HasParam("choose_text") && nmac.HasParam("choose_text")) {
        nmac.SetParam("choose_text", mac.GetParam("choose_text"));
    }

    if (mac.HasParam("explanation_d") && nmac.HasParam("explanation_d")) {
        nmac.SetParam("explanation_d", mac.GetParam("explanation_d"));
    }

    if (mac.HasParam("fieldicon") && nmac.HasParam("fieldicon")) {
        nmac.SetParam("fieldicon", mac.GetParam("fieldicon"));
    }

    if (mac.HasParam("screenshot_rect") && nmac.HasParam("area")) {
        nmac.SetParam("area", mac.GetParam("screenshot_rect"));
    }

    if (mac.HasParam("action") && nmac.HasParam("action")) {
        nmac.SetParam("action", mac.GetParam("action"));
    }
    
    if (mac.HasParam("type") && nmac.HasParam("type")) {
        nmac.SetParam("type", mac.GetParam("type"));
    }
    
    if (mac.HasParam("macro_comment") && nmac.HasParam("macro_comment")) {
        nmac.SetParam("macro_comment", mac.GetParam("macro_comment"));
    }
    ca_logger.DeWrite(3);
    return nmac;
}

function is_edit(type) {
    return (type == "WINEdit" || type == "WINMLEdit" || type == "WINComboEdittpcd");
}

function is_dropdown(type) {
    return (type == "WINListBox" || type == "WINButtonCombo" || type == "WINComboButtontpcd");
}

function is_listbox(type) {
    return (type == "WINListBox");
}

function is_menu(type) {
    return (type == "WINGeneralMenue" || type == "WINMenueItem" || type == "WINMenue");
}

function synthesize_string_ex(value, clear) {
    var action = get_keyaction("A");

    if (clear) {
        action.ctrl = true;
        action.Execute();

        action = get_keyaction("del");
        action.Execute();
    }

    for (var i = 0; i < value.length; i++) {

        if (value[i] == '\r' || value[i] == '\n') {
            action = get_keyaction("enter");
        } else {
            action = KeyUtils.KeyAction("" + value[i]);
        }
        action.Execute();
    }
}

function is_combo_type(type) {

    return (type == "WINButtonCombo" || type == "WINComboButtontpcd");
}

function is_not_update_mac_type(mac) {
    return (mac.Template() == "explanation_long" || mac.Template() == "active_area" || mac.Template() == "key_press");
}

function is_not_page_macro(mac) {
    return (mac == null || mac.Template() != "define_target");
}

function is_not_insert_expl_type(mac) {
    return (mac == null || (mac.Template() != "application_context" && 
                            mac.Template() != "process_start_unit" && 
                            mac.Template() != "start_unit"));
}

function nav_update_hotkey(mac, project) {
    var hotkey = get_from_node_(mac, "key_name") || get_from_node_(mac, "hotkey");
    var action = get_keyaction(hotkey);
    
    if (mac.HasParam("key_desc")) {
        var old_keys = mac.GetParam("key_desc").split('+');
        
        var new_keys = KeyUtils.ProjectLocalizedName(action.key_code, action.shift, action.ctrl, action.alt, project.Language).split('+');
        if (old_keys.length == new_keys.length) {
            if (new_keys.length > 0) {
                new_keys.splice(-1, 1);
            }
            if (old_keys.length > 0) {
                new_keys.push(old_keys[old_keys.length - 1]);
            }
            var key_desc = new_keys.join('+');
            mac.SetParam("key_desc", key_desc);
        }
        mac.SetParam("key_name", hotkey);
    }
}

function update_node_(node, name, value) {
    if (node && node.HasParam(name)) {
        node.SetParam(name,value);
    }
}

function update_from_node_(node, name, prev_node) {
    if ((node) && (node.HasParam(name)) && (prev_node) && (prev_node.HasParam(name))) {
        node.SetParam(name,prev_node.GetParam(name));
    }
}

function get_from_node_(node, name) {
    if (node && node.HasParam(name)) {
        return node.GetParam(name);
    }
    return "";
}

function clone_project(name) {
    ca_logger.Write(2, "clone_project", "", "");
    Project.SaveProject();
    var project = WA.GetObject("project!" + Project.UID);
    if (project != null) {
        var cnt = project.Clone(name);
        if (cnt != null) {
            if (WA.Open(cnt.FullId)) {
                Project.SetCurrentTourstop(0);
                Project.SetCurrEvent(0);
            } else {
                ca_logger.Log(2, "failed to open clone", "", "");
            }
            ca_logger.DeWrite(2);
            return true;
        } else {
            ca_logger.Log(2, "failed to clone current project", "", "");
        }
    } else {
        ca_logger.Log(2, "no current project", "", "");
    }
    ca_logger.DeWrite(2);
    return false;
}


function is_explanation(mac) {
    if (mac && mac.HasParam("element_type") && mac.GetParam("element_type") == "WINExplainLong") {
        return true;
    }
    return false;
}

function is_list_box(mac) {
    if (mac && mac.HasParam("element_type") && mac.GetParam("element_type") == "WINListBox") {
        return true;
    }
    return false;
}

function is_edit_mac(mac) {
    if (mac.HasParam("element_type")) {
        var type = mac.GetParam("element_type");
        return (type == "WINEdit" || type == "WINInactiveEdit" || type == "WINMLEdit" || type == "WINComboEdittpcd");
    }
    return false;
}

function is_list_combo_mac(mac) {
    if (mac.HasParam("element_type")) {
        return is_list_combo_type(mac.GetParam("element_type"));
    }
    return false;
}

function check_editable_type_(mac) {
    if (is_edit_mac(mac) || is_list_combo_mac(mac)) {
        return true;
    }
    return false;
}

function is_list_combo_type(type) {
    if (type == "WINListBox") {
        return true;
    }
    return false;
}

function get_selected_item(all_values) {
    var item = "";

    if (all_values.length > 0) {
        var arr = all_values.split('\n');

        for (var i = 0; i < arr.length; i++) {
            var val = arr[i];

            if (val != "") {
                var index = arr[i].indexOf("{*}");
                if (index != -1) {
                    item = arr[i].substr(index + 3, arr[i].length);
                    return item;
                }
            }
        }
    }
    return item;
}

function get_dditem_index(all_values, fieldname) {

    if (all_values.length > 0) {
        var arr = all_values.split('\n');

        for (var i = 0; i < arr.length; i++) {
            var val = arr[i];

            if (val != "") {
                var index = arr[i].indexOf("{*}");
                if (index != -1) {
                    val = arr[i].substr(index + 3, arr[i].length);
                }

                if (val == fieldname) {
                    return i;
                }
            }
        }
    }
    return -1;
}

function validate_navi_hot_key_(keys, hot_key) {
    if ((keys.length != 0) && (hot_key.length == keys.length)) {
        var ok = true;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() != hot_key[i].toLowerCase()){
                ok = false;
                break;
            }
        }
        return ok;
    }
    return false;
}

function win_window_resizable(windows_stack) {
    ca_logger.Write(2, "win_window_resizable", "", "");
    var class_name = windows_stack.ClassName();
    ca_logger.Log(2, "win class:" + class_name, "", "");

    if (class_name == "Internet Explorer_TridentDlgFrame" ||
        class_name == "#32770") {
        ca_logger.DeWrite(2);
        return false;
    }
    ca_logger.DeWrite(2);
    return true;
}

function is_taskbar_window(windows_stack) {
    return is_taskbar(windows_stack.ClassName());
}

function is_taskbar(wnd_class) {
    return (wnd_class == "TaskListThumbnailWnd" ||
            wnd_class == "BaseBar" ||
            wnd_class == "Shell_TrayWnd");
}

function is_list(type) {
    return (type == "WINCBListItem");
}

function get_last_prj_mac() {
    var num_of_macros = 0;
    var ts = Project.GetTourstop(Project.CurrentTourstop());
    var last_mac = null;

    if (ts != null) {
        var mac = ts.NextMacro();

        while (mac != null) {
            if (mac.Template() != "new_page") {
                num_of_macros += 1;
            }
            last_mac = mac;
            mac = ts.NextMacro(mac.TourPosition());
        }
    }
    return { index : num_of_macros - 1, macro : last_mac };
}

function normalize_path(path) {
    path = path.replace(/\\/g, '/');
    
    if (path.length > 0 && path.charAt(path.length - 1) != '/') {
        path += '/';
    }
    
    return path;
}
