var utils = {};

utils.html2txt = function(txt) {
    var res = txt;
    res = res.replace(/\n/g, ' ');
    res = res.replace(/<br>/gi, '\n');
    res = res.replace(/<li>/gi, '\n');
    res = res.replace(/<\/p>/gi, '\n');
    res = res.replace(/<\/h[0-9]>/gi, '\n');
    res = res.replace(/<[^>]*>/g, '');
    res = res.replace(/&nbsp;/gi, ' ');
    res = res.replace(/&lt;/gi, '<');
    res = res.replace(/&gt;/gi, '>');
    return res;
}

utils.pv_get_text = function(mac, text) {
    var cmt = mac.GetParam('macro_comment');
    if (cmt.length == 0) {
        return text;
    }
    var c = cmt.charAt(0);
    if (c == '/' || c == '+' || c == '*') {
        cmt = cmt.substr(1);
        if (text.length == 0) {
            return cmt;
        }
        if (cmt.length == 0) {
            return text;
        }
        switch(c) {
            case '/': return text;
            case '+': return text + ' (' + cmt + ')';
            case '*': return '(' + cmt + ') ' + text;
        }
    } else {
        return cmt;
    }
}

utils.concat_param_text = function(mac, text, param2) {
    if (text.length == 0 || g_append.length > 0) {
        var org_append = g_append;
        var text2 = utils.get_param_text(mac, param2);
        if (text2.length > 0) {
            if (text.length == 0) {
                text = text2;
            } else {
                text = text + org_append + text2;
            }
        } else {
            g_append = org_append;
        }        
    }
    return text;
}

utils.pv_get_param = function(mac, param) {
    return utils.pv_get_text(mac, utils.get_param_text(mac, param));
}

utils.pv_get_param2 = function(mac, param1, param2) {
    var text = utils.get_param_text(mac, param1);
    text = utils.concat_param_text(mac, text, param2);
    return utils.pv_get_text(mac, text);
}

utils.pv_get_param3 = function(mac, param1, param2, param3) {
    var text = utils.get_param_text(mac, param1);
    text = utils.concat_param_text(mac, text, param2);
    text = utils.concat_param_text(mac, text, param3);
    return utils.pv_get_text(mac, text);
}

utils.get_param_text = function(mac, param) {
    var idx = param.indexOf('+');
    if (idx != -1) {
        g_append = param.substr(idx + 1, param.length - idx - 1);
        param = param.substr(0, idx);
    } else {
        g_append = '';
    }
    var s = "";
    if (mac.HasParam(param)) {
        s = mac.GetParam(param);
        if (s && param == 'explanation_d' || param == 'end_message' || param == 'condition_text') {
            s = utils.html2txt(s);
        }
    }
    return s;
}

var macro_info = {};


macro_info.start_unit = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.process_start_unit = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.context_assistant_include = function () {
    _info = {};
    var link = Project.OrigEvent().GetParam("project_id");
    var wap = WA.GetObject(link);
    if (wap) {
        link = wap.Caption;
    }

    _info.text = link;
}


macro_info.application_context = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "display_name");
    
    var exe = "";
    if (Project.OrigEvent().HasParam("executable")) {
        exe = Project.OrigEvent().GetParam("executable");
    }
    if (exe == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.target_specializer = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("screenshot_rect");
    _info.text = (Project.OrigEvent().GetParam("disqualifier") ? "- " : "+ ") + (utils.pv_get_param(Project.OrigEvent(), "fieldname"));
    
    var path = "";
    if (Project.OrigEvent().HasParam("path")) {
        path = Project.OrigEvent().GetParam("path");
    }
    if (path == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
        
}

macro_info.define_target = function () {
    _info = {};
    _info.screenshot = Project.OrigEvent().GetParam("dump_page");
    _info.rect = Project.OrigEvent().GetParam("win_rect");
    _info.text = utils.pv_get_param(Project.OrigEvent(), "target_name");
    //_info.jump_target = Project.OrigEvent().GetParam("ts");
    
    var key = "";
    if (Project.OrigEvent().HasParam("key")) {
        key = Project.OrigEvent().GetParam("key");
    }
    if (key == "" || key == "<PageKey/>") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.explanation_long = function () {
    _info = {};
    _info.text = utils.pv_get_param2(Project.OrigEvent(), "fieldname+: ", "explanation_d");
}

macro_info.click = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("screenshot_rect");
    _info.text = utils.pv_get_param2(Project.OrigEvent(), "fieldname+: ", "explanation_d");
        
    var path = "";
    if (Project.OrigEvent().HasParam("path")) {
        path = Project.OrigEvent().GetParam("path");
    }
    if (path == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.active_area = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("area");
    _info.text = utils.pv_get_param2(Project.OrigEvent(), "fieldname+: ", "explanation_d");
}

macro_info.key_press = function () {
    _info = {};
    _info.text = utils.pv_get_param2(Project.OrigEvent(), "key_desc", "explanation_d");
}

macro_info.input_text = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("screenshot_rect");
    _info.text = utils.pv_get_param3(Project.OrigEvent(), "fieldname+: ", "text_d", "explanation_d");
        
    var path = "";
    if (Project.OrigEvent().HasParam("path")) {
        path = Project.OrigEvent().GetParam("path");
    }
    if (Project.OrigEvent().HasParam("condition_pattern")) {
		_info.has_condition = Project.OrigEvent().ParamSpecified("condition_pattern");
    }
    if (path == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.select_single = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("screenshot_rect");
    _info.text = utils.pv_get_param3(Project.OrigEvent(), "fieldname+: ", "choose_text", "explanation_d");
        
    var path = "";
    if (Project.OrigEvent().HasParam("path")) {
        path = Project.OrigEvent().GetParam("path");
    }
    if (path == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.input_radio = function () {
    _info = {};
    _info.rect = Project.OrigEvent().GetParam("screenshot_rect");
    _info.text = utils.pv_get_param3(Project.OrigEvent(), "fieldname+: ", "choose_bool", "explanation_d"); 
        
    var path = "";
    if (Project.OrigEvent().HasParam("path")) {
        path = Project.OrigEvent().GetParam("path");
    }
    if (path == "") {
        _info.fill_color = 0xffc5bd;
        _info.fill_color_over = 0xffa39c;
        _info.fill_color_sel = 0xff807a;
    }
}

macro_info.script = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.behaviour = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.behaviour_assign_global = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.behaviour_assign_ns = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.behaviour_assign_object = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.free_object = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.free_object_elem = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.end_unit = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_cancel = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_display_fo = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_hide_fo = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_foe_bold = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_foe_change_state = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_hilight = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_hide_hilight = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_show_bubble = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_hide_bubble = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_set_value = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_jump = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_changeprocess = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_standby = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_system = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_changetour = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_exec_mouse_action = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.var_string = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.var_bool = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.var_number = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_get_value = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_set_strvar = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_set_boolvar = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.beh_set_numvar = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.behaviour_assign_condition = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.cond_assign_global = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.cond_assign_ns = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.cond_assign_object = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.condition = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_strval = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_boolval = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_numval = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_ctrlval = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_ctrlexists = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.check_keyattr = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "macro_comment");
}

macro_info.step = function () {
    _info = {};
    _info.text = utils.pv_get_param(Project.OrigEvent(), "name");
    instep = true;
}

var onactivate = {};

onactivate.start_unit = function () {
}

onactivate.context_assistant_include = function () {
}


onactivate.application_context = function () {
}

onactivate.target_specializer = function () {
}

onactivate.define_target = function () {
}

onactivate.explanation = function () {
}

onactivate.explanation_long = function () {
}

onactivate.choose_process = function () {
}

onactivate.click = function () {
}

onactivate.active_area = function () {
}

onactivate.key_press = function () {
}

onactivate.input_text = function () {
}

onactivate.select_single = function () {
}

onactivate.input_radio = function () {
}
