var GLOSS_OFFSET = 20;
var GLOBAL_EXPL = 0;
var APP_EXPL = 1;
var MACRO_EXPL = 2;
var KEY_EXPL = 3;

var PA_ACTION = 1;
var CA_ACTION = 2;

function CAParamChecker(defaults, macro_name, params, globals) {
    this.defaults_ = defaults;
    this.macro_name_ = macro_name;
    this.params_ = params;
    this.globals_ = globals;
}

CAParamChecker.prototype.Check = function(pname, param_type, builtin) {
    builtin_ = builtin != undefined ? builtin:
        param_type.indexOf("BOOL") >= 0 ? false:
        param_type.indexOf("INTEGER") >=0 ? 0:
        "";

    /* PR #9631 and PR #10961 */
    if (pname == 'fieldicon' && (pname in this.params_) && (this.params_[pname] != '')) {
        this.params_[pname] = ctx.cfg_resolve(this.params_[pname], 'macro!' + this.params_['uid'] + '/');
    }
    if (! (pname in this.params_)) {
        if (this.defaults_ != null && this.macro_name_ in this.defaults_) { // macro is defined in defaults
            var macrodefaults = this.defaults_[this.macro_name_];
            if (pname in macrodefaults){ // parameter is defined in macrodefaults
                this.params_[pname] = macrodefaults[pname];
            } else if (this.globals_ != null && pname in this.globals_) {
                this.params_[pname] = this.globals_[pname];
            } else {
                this.params_[pname] = builtin_;
            }
        } else if (this.globals_ != null && pname in this.globals_) {
            this.params_[pname] = this.globals_[pname];
        } else {
            this.params_[pname] = builtin_;
        }
    }
}

function CACtxHelper(context){
    this.ctx_ = context;
    this.value = function(pname, params) {
        var res =
            pname in params ? params[pname] :
            pname in this.ctx_.global_params ? this.ctx_.global_params[pname]:
            pname in this.ctx_.tour_params ? this.ctx_.tour_params[pname]:
            "???";
        return res;
    };
}

CACtxHelper.prototype.EVAL_TEMPLATE = function (t, params) {
    var src = this.ctx_.string_templates[t];
    return this.EVAL_STRING(src, params);
}

function ca_js_encode(s) {
    s = s.replace(/\\/g, '\\\\');
    s = s.replace(/'/g, "\\'");
    s = s.replace(/"/g, '\\"');
    s = s.replace(/\r/g, '\\r');
    s = s.replace(/\n/g, '\\n');
    return s;
}

function ca_url_encode(s) {
    s = s.replace(/ /g, '+');
    return s;
}

function ca_html_encode(s) {
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/"/g, '&quot;');
    return s;
}

CACtxHelper.prototype.EVAL_STRING = function (s, params) {
    var src = s;
    var re_js2 = /\$%%(\w*)\$/g;
    var re_js = /\$%(\w*)\$/g;
    var re_url = /\$@(\w*)\$/g;
    var re = /\$(\w*)\$/g;
    var re_html = /\$#\{(\w*)\}/g;
    var re2 = /\$\{(\w*)\}/g;
    var re_img = /\$I\{(\w*)\}/g;
    var re_pimg = /\$P\{(\w*)\}/g;
    var re_doc = /\$D\{(\w*)\}/g;
    var param;
    var res = src;

    var pname;
    var val;
    changed = true;
    while (changed) {
        changed = false;
        while ((param = re_js2.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ca_js_encode(ca_js_encode(''+ this.value(pname, params))));
            // log("RE : " + res);
        }
        while ((param = re_js.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ca_js_encode(''+ this.value(pname, params)));
            // log("RE : " + res);
        }
        while ((param = re_url.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ca_url_encode(''+ this.value(pname, params)));
            // log("RE : " + res);
        }
        while ((param = re_html.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ''+ ca_html_encode(this.value(pname, params)));
            // log("HTML: " + res);
        }
        while ((param = re.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ''+ this.value(pname, params));
            // log("RE : " + res);
        }
        while ((param = re2.exec(res)) != null) {
            changed = true;
            pname = param[1];
            res = res.replace(param[0], ''+this.value(pname, params));
            // log("RE2: " + res);
        }
        while ((param = re_img.exec(res)) != null) {
            changed = true;
            pname = param[1];
            var val = this.value(pname, params);
            if (val.length) {
                res = res.replace(param[0], '<img src="' + this.value(pname, params) +'"/>');
            } else {
                res = res.replace(param[0], '');
            }
            // log("RE3: " + res);
        }
        while ((param = re_pimg.exec(res)) != null) {
            changed = true;
            pname = param[1];
            var val = this.value(pname, params);
            if (val.length) {
                res = res.replace(param[0], '<img src="' + this.value(pname, params) +'"/>');
            } else {
                res = res.replace(param[0], '');
            }
            // log("RE3: " + res);
        }
        while ((param = re_doc.exec(res)) != null) {
            changed = true;
            pname = param[1];
            var val = this.value(pname, params);
            if (val.length) {
                res= res.replace(param[0], '<img src="doc/'+ this.value(pname, params)+'"/>');
            } else {
                res= res.replace(param[0], '');
            }
            // log("RE4: " + res);
        }
    }

    return res;
}

CACtxHelper.prototype.BUILD_GLOBALS =function (project_globals, default_globals, builtin_globals) {
    res = new Array();
    for (param in builtin_globals) {
        res[param] = param in project_globals ? project_globals[param] :
            param in default_globals ? default_globals[param] :
            builtin_globals[param];
    };
    return res;
}

function ca_remove_outer_p_tags(str) {
    var str_length = str.length;
    if (str.substring(0, 3).toLowerCase() == "<p>" &&
        str.substring(str_length-4, str_length).toLowerCase() == "</p>") {
        str = str.substr(3,str_length-7);
    }
    return str;
}

function ca_remove_html(txt) {
    var res = txt;
    res = res.replace(/\n/g, '');
    res = res.replace(/<[^>]*>/g, '');
    res = res.replace(/&nbsp;/gi, '');
    res = res.replace(/&lt;/gi, '<');
    res = res.replace(/&gt;/gi, '>');
    return res;
}

Array.prototype.mix = function() {
    if (this.length < 2) return;
    var r, t, j;
    for (j = this.length - 1; j > 0; j--) {
        r = Math.floor(Math.random() * (j + 1));
        t = this[j];
        this[j] = this[r];
        this[r] = t;
    }
}

Array.prototype.copy = function() {
    var new_array = new Array();
    for (var i = 0; i < this.length; i++) {
        new_array[i] = this[i];
    }
    return new_array;
}

function ca_get_explanation(type, expl) {
    if (type == "none") return expl;

    return "<div><table width=\"100%\" cellspacing=0 cellpadding=0>\r\n" +
    "<tr>\r\n" +
    "<td width=1 valign=top align=left>\r\n" +
    "<img style=\"margin-left:0px;margin-right:5px;position-top:0px;position-left:0px\" src=\"macroset!context_assistant:" + type + ".gif\">\r\n" +
    "</td>\r\n" +
    "<td width=\"5px\">\r\n" +
    "</td>\r\n" +
    "<td>\r\n" +
    expl + "\r\n" +
    "</td>\r\n" +
    "</tr>\r\n" +
    "</table>\r\n" +
    "</div>\r\n";
}


function ca_get_fo_bubble(pc, params) {
    pc.Check("bmain_win_style", "SHELF");
    pc.Check("bmain_size", "SIZE");

    var bubble = new winnavp_Bubble();

    bubble.style = B_STYLE(params.bmain_win_style);
    bubble.width = params.bmain_size.width;
    bubble.height = params.bmain_size.height;
    bubble.orientation = "C";
    bubble.offset_x = 0;
    bubble.offset_y = 0;
    bubble.minimized = false;
    bubble.no_spike = true;
    bubble.minimizable = false;

    return bubble;
}

function ca_get_exp_bubble(pc, params,global_params) {
    pc.Check("bexp_style", "SHELF");
    pc.Check("bmain_size", "SIZE");

    var bubble = new winnavp_Bubble();

    bubble.style = B_STYLE(global_params.bexp_style);
    bubble.width = params.bmain_size.width;
    bubble.height = params.bmain_size.height;
    bubble.orientation = "C";
    bubble.offset_x = 0;
    bubble.offset_y = 0;
    bubble.minimized = false;
    bubble.no_spike = true;
    bubble.minimizable = false;

    return bubble;
}
function ca_get_end_text(pc, global_params, params) {
    pc.Check("end_message", "HTML", "");
    pc.Check("type", "ENUM", "none");

    var end_text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.end_message), 1);
    end_text = ca_dgo_resolve(null, end_text, 2);
    
    return end_text;
}
function ca_rgb2bgr(color) {
    var str = color;

    if (color.length == 8) {
        str = "0x" + color[6] + color[7] + color[4] + color[5] + color[2] + color[3];
    } else if (color.length == 7) {
        str = "0x" + color[5] + color[6] + color[3] + color[4] + color[1] + color[2];
    }

    //alert("" + str);

    return str;
}

function ca_get_hilight(pc, params, action_type) {
    pc.Check("g_highlight_effect", "TEXT");
    pc.Check("g_highlight_border", "INTEGER", 4);
    pc.Check("g_highlight_bgr", "COLOR", "0x0FAAFF");
    pc.Check("anim_steps", "INTEGER", 0);
    pc.Check("highlight_offset", "POSSIZE", { 'left': 0, 'top': 0, 'right': 0, 'bottom': 0 });
    pc.Check("condition_highlight_bgr", "COLOR", "");

    var hilight = new winnavp_Hilight();

    var hilight_color = params.g_highlight_bgr;
    if (action_type == CA_ACTION && params.condition_pattern && params.condition_highlight_bgr) {
        hilight_color = (params.condition_highlight_bgr == "") ?
                         params.g_highlight_bgr : params.condition_highlight_bgr;
    }
    hilight.htype = params.g_highlight_effect;
    hilight.offset_ = CreateRect(0, 0, 0, 0);
    hilight.offset_.left = params.highlight_offset.left - 0;
    hilight.offset_.top = params.highlight_offset.top - 0;
    hilight.offset_.right = params.highlight_offset.width - 0;
    hilight.offset_.bottom = params.highlight_offset.height - 0;
    hilight.border = params.g_highlight_border - 0;
    //alert("" + params.g_highlight_bgr);
    hilight.color = ca_rgb2bgr(hilight_color) - 0;
    //alert("" + hilight.color);
    hilight.animsteps = params.anim_steps;

    return hilight;
}


function ca_get_unique_objectname(name) {
    var my_name = name;
    var index = 0;

    while (1) {
        if (winnavp_player.Applications.FindObject(my_name) == null) return my_name;

        my_name = name + index;

        index++;
    }
}


function ca_dgo_resolve(params, html_txt, format) {
    var ctx = null;
    
    if (params != null) {
        ctx = CreateContext("macro", params.uid, "project", winnavp_player.uid, "wa", winnavp_player.wa_id);
    }
    
    var resolved = Document.ResolveHtml(html_txt, format, ctx, params, PathResolver.GetWaBase(winnavp_player.wa_id));

    return resolved;
}


function ca_is_active_area(type) {
    return (type == "WINActiveArea");
}

function ca_is_explanation(type) {
    return (type == "WINExplainLong");
}

function ca_get_fo_form_bubble() {

    var bubble = new winnavp_Bubble();

    bubble.style = B_STYLE(winnavp_global.FormStyle);
    bubble.x = winnavp_global.FormPostion.left;
    bubble.y = winnavp_global.FormPostion.top;
    bubble.width = winnavp_global.FormWidth;
    bubble.height = winnavp_global.FormHeight;
    bubble.orientation = "C";
    bubble.offset_x = 0;
    bubble.offset_y = 0;
    bubble.minimized = false;
    bubble.no_spike = true;
    bubble.minimizable = false;
    bubble.alignment = winnavp_global.FormAlignment;
    bubble.auto_adjust = false;
    bubble.closable = true;
    bubble.abort_on_close = winnavp_ca.process_oriented;

    return bubble;
}

function is_scroll_type(type) {

    if (type.indexOf("Scroll") != -1){
        return true;
    }

    return false;
}

function map_values_to_string(keys, map) {
    if (!map) {
        return;
    }
    var map_string = "{";

    for (var x = 0; x < keys.length; x++) {
        var key = keys[x];
        var str = "";
        map_string += "\\'" + key + "\\' : \\'";
        if (typeof (map[key]) == "string") {
            str = ca_js_encode(ca_js_encode(map[key]));
            map_string += str;
        } else {
            map_string += map[key];
        }
        map_string += "\\'";
        if (x != keys.length - 1) {
            map_string += ",";
        }
    }
    map_string += "}";
    return map_string;
}

function stringify_macros(macros) {
    return stringify(macros, ["uid", "fieldicon", "element_type", "text"]);
}

function stringify_rects(control_rects) {
    return stringify(control_rects, ["left", "top", "width", "height"]);
}

function stringify(arr, attrs) {
    if (!arr) {
        return "";
    }

    var str = "[";
    for (var i = 0; i < arr.length; i++) {
        str += map_values_to_string(attrs, arr[i]);
        if (i != arr.length - 1) {
            str += ",";
        }
    }
    str += "]";

    return str;
}

function AlignmentParams(x, y, width, height, alignment, rect) {
    this.x_ = x;
    this.y_ = y;
    this.width_ = width;
    this.height_ = height;
    this.alignment_ = alignment;
    this.rect_ = rect;
}

AlignmentParams.prototype.x_ = 0;
AlignmentParams.prototype.y_ = 0;
AlignmentParams.prototype.width_ = 0;
AlignmentParams.prototype.height_ = 0;
AlignmentParams.prototype.alignment_ = "free";
AlignmentParams.prototype.rect_ = null;



AlignmentParams.prototype.calc_pos_from_align_ = function() {
    if (this.alignment_ == "left_top") {
        this.x_ = this.rect_.left;
        this.y_ = this.rect_.top;
    } else if (this.alignment_ == "left_center") {
        this.x_ = this.rect_.left;
        this.y_ =  (this.rect_.bottom - this.height_) / 2;
    } else if (this.alignment_ == "left_bottom") {
        this.x_ = this.rect_.left;
        this.y_ = this.rect_.bottom - this.height_;
    } else if (this.alignment_ == "right_top") {
        this.x_ = this.rect_.right - this.width_;
        this.y_ = this.rect_.top;
    } else if (this.alignment_ == "right_center") {
        this.x_ = this.rect_.right - this.width_;
        this.y_ = (this.rect_.bottom - this.height_) / 2;
    } else if (this.alignment_ == "right_bottom") {
        this.x_ = this.rect_.right - this.width_;
        this.y_ = this.rect_.bottom - this.height_;
    } else if (this.alignment_ == "center") {
        this.x_ = (this.rect_.right - this.width_) / 2;
        this.y_ = (this.rect_.bottom - this.height_) / 2;
    } else if (this.alignment_ == "top_center") {
        this.x_ = (this.rect_.right - this.width_) / 2;
        this.y_ = this.rect_.top;
    }

    return {x : this.x_, y : this.y_};
}

function array_to_string(arr) {
    if (arr == null) {
        return "";
    }
    var str = "[";
    var size = arr.length;
    for (var i = 0; i < size; i++) {
        str += "\\'" + arr[i] + "\\'";
        if (i != size - 1) {
            str += ",";
        }
    }
    str += "];";
    return str;
}

function ca_get_glossary_bubble() {
    var bubble = new winnavp_Bubble();

    bubble.style = B_STYLE(winnavp_global.GlossBubbleStyle);
    bubble.no_spike = true;
    bubble.width = winnavp_global.GlossBubbleSize.width;
    bubble.height = winnavp_global.GlossBubbleSize.height;
    bubble.minimizable = false;
    bubble.gloss = true;

    return bubble;
}

function remove_empty_span(txt) {
    txt = txt.replace(/<(span class="gloss_ref") *[^\/]*?\/>/gi, '');
    return txt;
}

function check_for_out_of_screen_(pos, word_rect, bubble, is_rtl) {
    var wa_rect = GetVirtualMonitorRect();
    var b_width = bubble.GetWidth();
    var b_height = bubble.GetHeight();
    var adjust_factor = b_width - GLOSS_OFFSET;

    if (is_rtl && (pos.x - b_width) < wa_rect.left) {
        pos.x = word_rect.left + adjust_factor;
    }

    if (!is_rtl && (pos.x + b_width) > wa_rect.right) {
        pos.x = word_rect.left - adjust_factor;
    }

    //actual out of screen check
    if ((pos.y + b_height) > wa_rect.bottom) {
        pos.y = wa_rect.bottom - b_height;
    }

    if (pos.x < wa_rect.left) {
        pos.x = 0;
    }

    if ((pos.x + b_width) > wa_rect.right) {
        pos.x = wa_rect.right - b_width;
    }

    if (pos.y < wa_rect.top) {
        pos.y = wa_rect.top;
    }
}

function get_tray_bubble(params) {
    var bubble = new winnavp_Bubble();
    bubble.style = params.bubble_style;
    bubble.width = params.width;
    bubble.height = params.height;
    bubble.orientation = "C";
    bubble.orig_orientation = "C";
    bubble.no_spike = true;
    bubble.minimizable = false;
    bubble.closable = false;
    bubble.clickable = true;
    bubble.rtl = IsRTL(winnavp_glossary.lang);
    bubble.adaptable_style = _W("adaptable!" + params.navi_style);
    bubble.language = winnavp_glossary.lang;
    bubble.no_reposition = true;
    bubble.delayed = true;
    bubble.alignment = "right_bottom";
    bubble.always_on_primary = true;
    return bubble;
}

function extract_headers(profiles_txt, apps, project) {
    var headers = {};

    if (profiles_txt != "") {
        var profiles = XmlFromString(profiles_txt);
        if (profiles) {
            var root = profiles.baseNode().getChild(0);
            var cnt = root.numChildren("CTFile");
            if (cnt == 0) {

                if (!apps) {
                    //no name matching during runtime for efficiency purposes
                    headers["DEFAULT"] = profiles_txt;
                } else {
                    //legacy header - have to find the profile name to support partially update of old projects
                    var cfg_name = get_legacy_header_name(apps, project);
                    headers[cfg_name] = profiles_txt;
                }
            } else {
                for (var i = 0; i < cnt; i++) {
                    var child = root.getChild(i);
                    if (child.hasAttribute("name")) {
                        var config_file = child.getAttribute("name").getValue();
                        headers[config_file] = child.innerText();
                    }
                }
            }
        }
    }

    return headers;
}

function create_header_list(headers) {
    var headers_raw = "<CTRoot>";
    for (config_file in headers) {
        headers_raw += "<CTFile name=\"" + config_file + "\">";
        headers_raw += headers[config_file];
        headers_raw += "</CTFile>";
    }
    headers_raw += "</CTRoot>";
    return headers_raw;
}

function insert_hdr(headers, appmac, cfg_template) {
    var header_hash = CreateRuntimeProfile(cfg_template.GetHeader(), cfg_template.filename);
    headers[cfg_template.filename] = header_hash;
    var headers_raw = create_header_list(headers);
    appmac.SetParam("sc_config_header", headers_raw);
}

function create_header(appmac, cfg_template) {
    var headers = {};
    insert_hdr(headers, appmac, cfg_template);
}

function update_header(appmac, cfg_template) {
    var headers = extract_headers(appmac.GetParam("sc_config_header"), appmac.GetParam("executable"), Project);
    insert_hdr(headers, appmac, cfg_template);
}

function get_header(appmac, cfg_name) {
    var headers = extract_headers(appmac.GetParam("sc_config_header"), appmac.GetParam("executable"), Project);

    if (headers[cfg_name]) {
        return headers[cfg_name];
    }

    return "";
}

function get_legacy_header_name(apps, project) {
    var execs = apps.split(';');

    for (var i = 0; i < project.NumTourstops() ; i++) {
        var ns = project.GetTourstop(i);

        if (ns != null) {
            var mac = ns.NextMacro();

            while (mac != null) {
                if (mac.Template() == "define_target" && mac.HasParam("executable")) {
                    for (var j = 0; j < execs.length; j++) {
                        if (execs[j] == mac.GetParam("executable")) {
                            cfg_name = mac.GetParam("config_file");
                            return cfg_name;
                        }
                    }
                }
                mac = ns.NextMacro(mac.TourPosition());
            }
        }
    }

    return "";
}
