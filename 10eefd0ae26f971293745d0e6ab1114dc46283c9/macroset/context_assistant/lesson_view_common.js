// ================================ debug helper ================================

function LOG(s) {
    if (slide_window) {
        slide_window.LOG(s);
    }
}

var debugged = false;
function debug_once() {
    if (!debugged) {
        debugged = true;
        debugger;
    }
}




// ================================== JSON ================================

JSONstring = {
    compactOutput: true,
    includeProtos: false,
    includeFunctions: false,
    detectCirculars: true,
    restoreCirculars: true,
    delimName: false, //true,
    filter: null,
    ClearFilter: function () {
        if (!this.filter) return;
        delete this.filter;
        this.filter = null;
    },
    AddToFilter: function (name) {
        if (!this.filter) {
            this.filter = {};
        }
        this.filter[name] = true;
    },
    RemoveFromFilter: function (name) {
        if (!this.filter) return;
        this.filter[name] = false;
    },
    make: function (arg, restore) {
        this.restore = restore;
        this.mem = []; this.pathMem = [];
        return this.toJsonStringArray(arg, null, false, this.filter != null).join('');
    },
    toObject: function (x) {
        if (!this.cleaner) {
            try { this.cleaner = new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$') }
            catch (a) { this.cleaner = /^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/ }
        };
        if (!this.cleaner.test(x)) { return {} };
        eval("this.myObj=" + x);
        if (!this.restoreCirculars || !alert) { return this.myObj };
        if (this.includeFunctions) {
            var x = this.myObj;
            for (var i in x) {
                if (typeof x[i] == "string" && !x[i].indexOf("JSONincludedFunc:")) {
                    x[i] = x[i].substring(17);
                    eval("x[i]=" + x[i])
                }
            }
        };
        this.restoreCode = [];
        this.make(this.myObj, true);
        var r = this.restoreCode.join(";") + ";";
        eval('r=r.replace(/\\W([0-9]{1,})(\\W)/g,"[$1]$2").replace(/\\.\\;/g,";")');
        eval(r);
        return this.myObj
    },
    toJsonStringArray: function (arg, out, noStringDelim, useFilter) {
        if (!out) { this.path = [] };
        out = out || [];
        var u; // undefined
        switch (typeof arg) {
            case 'object':
                this.lastObj = arg;
                if (this.detectCirculars) {
                    var m = this.mem; var n = this.pathMem;
                    for (var i = 0; i < m.length; i++) {
                        if (arg === m[i]) {
                            out.push('"JSONcircRef:' + n[i] + '"'); return out
                        }
                    };
                    m.push(arg); n.push(this.path.join("."));
                };
                if (arg) {
                    if (arg.constructor == Array) {
                        out.push('[');
                        for (var i = 0; i < arg.length; ++i) {
                            this.path.push(i);
                            if (i > 0)
                                out.push(',\n');
                            this.toJsonStringArray(arg[i], out, noStringDelim, useFilter);
                            this.path.pop();
                        }
                        out.push(']');
                        return out;
                    } else if (typeof arg.toString != 'undefined') {
                        var first = true;
                        var any = false;
                        for (var i in arg) {
                            if (!this.includeProtos && arg[i] === arg.constructor.prototype[i]) { continue };
                            this.path.push(i);
                            var curr_path = this.path.join(".");
                            if (useFilter && this.filter && !this.filter[i] && !this.filter[curr_path]) {
                                this.path.pop();
                                continue;
                            }
                            if (first) {
                                out.push('{');
                                any = true;
                            }
                            var curr = out.length;
                            if (!first)
                                out.push(this.compactOutput ? ',' : ',\n');
                            this.toJsonStringArray(i, out, !this.delimName, false);
                            out.push(':');
                            this.toJsonStringArray(arg[i], out, false, false);
                            if (out[out.length - 1] == u)
                                out.splice(curr, out.length - curr);
                            else
                                first = false;
                            this.path.pop();
                        }

                        if (!any) {
                            out.push('{');
                        }
                        out.push('}');
                        return out;
                    }
                    return out;
                }
                out.push('null');
                return out;
            case 'unknown':
            case 'undefined':
            case 'function':
                if (!this.includeFunctions) { out.push(u); return out };
                arg = "JSONincludedFunc:" + arg;
                out.push('"');
                var a = ['\\', '\\\\', '\n', '\\n', '\r', '\\r', '"', '\\"']; arg += "";
                for (var i = 0; i < 8; i += 2) { arg = arg.split(a[i]).join(a[i + 1]) };
                out.push(arg);
                out.push('"');
                return out;
            case 'string':
                if (this.restore && arg.indexOf("JSONcircRef:") == 0) {
                    this.restoreCode.push('this.myObj.' + this.path.join(".") + "=" + arg.split("JSONcircRef:").join("this.myObj."));
                };
                if (!noStringDelim) out.push('"');
                var a = ['\n', '\\n', '\r', '\\r', '"', '\\"'];
                arg += ""; for (var i = 0; i < 6; i += 2) { arg = arg.split(a[i]).join(a[i + 1]) };
                out.push(arg);
                if (!noStringDelim) out.push('"');
                return out;
            default:
                out.push(String(arg));
                return out;
        }
    }
};





// ============================== utility functions =============================

function same_obj(o1, o2) {
    if (o1 == null || o2 == null || typeof o1 != 'object' || typeof o1 != typeof o2) return false;
    for (var i in o1) {
        if (o1[i] != o2[i]) return false;
    }
    return true;
}

function is_empty_obj(obj) {
    for (var id in obj) return false;
    return true;
}

function clone_obj(obj) {
    if (typeof obj !== 'object' || obj == null) {
        return obj;
    }

    var c = (obj instanceof Array || obj.isArray) ? [] : {};

    for (var i in obj) {
        var prop = obj[i];

        if (typeof prop == 'object') {
            if (prop instanceof Array) {
                c[i] = [];

                for (var j = 0; j < prop.length; j++) {
                    if (typeof prop[j] != 'object') {
                        c[i].push(prop[j]);
                    } else {
                        c[i].push(clone_obj(prop[j]));
                    }
                }
            } else {
                c[i] = clone_obj(prop);
            }
        } else {
            c[i] = prop;
        }
    }

    return c;
}

function to_html(s, no_br) {
    //no_br = false;
    s = s.replace(/\\n/g, no_br ? '' : '<BR>');
    //s = s.replace(/\\r/g, no_br ? '' : '<BR>');
    s = s.replace(/\\r/g, '');
    return s;
}

function Center(l, parent_l) {
    var pos = { a: Math.round(parent_l / 2 - l / 2), b: 0 };
    pos.b = pos.a + l;
    return pos;
}

function InProximity(slide_obj1, slide_obj2) {
    var max_dist = 20;
    // too much on the left
    if (slide_obj1.x < slide_obj2.x - max_dist) return false;
    // too much above
    if (slide_obj1.y < slide_obj2.y - max_dist) return false;
    // too much on the right
    if (slide_obj1.x > slide_obj2.x + slide_obj2.w + max_dist) return false;
    // too much below
    if (slide_obj1.y > slide_obj2.y + slide_obj2.h + max_dist) return false;

    return true;
}

function attr_specified(attr) {
    return attr || attr == '' || attr == 0;
}
function text_attr_specified(attr) {
    return attr || attr == '';
}
function attr_or_def(attr, def) {
    return (attr || attr == '' || attr == 0) ? attr : def;
}
function num_attr_specified(attr) {
    return attr || attr == 0;
}
function apply_attr(dst_obj, dst_var, attr, def) {
    if (!attr && attr != '' && attr != 0) {
        attr = def;
    }
    if (attr || attr == '' || attr == 0) {
        dst_obj[dst_var] = attr;
    }
}

function load_css() {
    if (!slide_window) return;
    var bubblestyles = slide_window.$('custombubblestyles');
    if (!bubblestyles) return;
    var css_file = (Viewer.isPracticeMode() || Viewer.isTestMode()) ? 'bubble_uebung.css' : 'bubble_demo.css';
    var href = slide_window.Context.ToAbsPath('style:css/' + css_file);
    if (href != slide_window.$('custombubblestyles').href) {
        slide_window.$('custombubblestyles').href = href;
    }
}




// ================================== window.external helpers =========================

function OnHotkey(evt) {
    if (ENV.OnHotkey) ENV.OnHotkey(evt);
};

function OnKeyUp(evt) {
    if (ENV.OnKeyUp) ENV.OnKeyUp(evt);
}

function OnKeyDown(evt) {
    //if (ENV.OnHotkey) ENV.OnHotkey(evt);
};

function LoadFile(path) {
    return ENV.LoadFile(path);
};

function ControlAdded(json) {
    return ENV.ControlAdded(json);
};

function ControlDeleted(json) {
    return ENV.ControlDeleted(json);
};

function showMessageInWindow(msg, v) {
    ENV.showMessageInWindow(msg, v);
}


//======================================= .external edit functions =====================================

// called from slide.htm
function Edit(mac_id, param, ext_info) {
    return ENV.Edit(mac_id, param, ext_info);
}


// ================================== window.external helpers =========================

var ENV = {
    env_: null,  // use window.external

    SetEnv: function (env) {
        this.env_ = env;
    },

    Edit: function (ctl_id, param_name, ext_info) {
        var e = this.env_ || window.external;
        var proxy = ProxyObjects[ctl_id];
        if (!proxy) return;
        var id = proxy.edit_uid ? proxy.edit_uid : proxy._mac_id;
        var param = proxy.edit_param_info ? proxy.edit_param_info : param_name;
        e.Edit(id, '' + param, ext_info);
    },

    LoadFile: function (path) {
        var e = this.env_ || window.external;
        return e.LoadFile(path);
    },

    OnActivate: function (macro_id, ctl_id) {
        var e = this.env_ || window.external;
        e.onActivate(macro_id, ctl_id);
    },

    OnSelectionChange: function (new_sel) {
        var e = this.env_ || window.external;
        e.onSelectionChange(new_sel, "");
    },

    ControlDeleted: function (json) {
        var e = this.env_ || window.external;
        e.ControlDeleted(json);
    },
    ControlAdded: function (json) {
        var e = this.env_ || window.external;
        e.ControlAdded(json);
    },

    showMessageInWindow: function (msg, v) {  // used for WLE
        var e = this.env_ || window.external;
        if (e.showMessageInWindow) e.showMessageInWindow(msg, v);
    },

    OnPageComplete: function () {
        var e = this.env_ || window.external;
        e.onPageComplete();
    },

    OnMacroChange: function (all, want_notification) {
        var e = this.env_ || window.external;
        e.onMacroChange(all, want_notification ? "true" : "false");
    },

    OnHotkey: function (evt) {
        var e = this.env_ || window.external;
        e.onHotkey(evt);
    },

    OnKeyUp: function (evt) {
        var e = this.env_ || window.external;
        e.onKeyUp(evt);
    },

    OnBeginDrag: function () {
        var e = this.env_ || window.external;
        e.onBeginDrag();
    },

    OnEndDrag: function () {
        var e = this.env_ || window.external;
        e.onEndDrag();
    },

    GetGlossaryItem: function (key) {
        var e = this.env_ || window.external;
        return e.GetGlossaryItem(key);
    },

    OnSetSingleObjectMode: function (on) {
        var e = this.env_ || window.external;
        e.onSetSingleObjectMode(on ? 'true' : 'false');
    },

    OnUserChange: function (macro_or_take, dir) {
        var e = this.env_ || window.external;
        var f = { macro: 'onUserMacroChange', take: 'onUserTakeChange' }[macro_or_take];
        e[f](dir);
    }
};




// ================================== Global variables ================================

// holds all data coming from CPP in the form of takes and macros (referenced by their IDs)
var Page = {
    take_by_id: {},
    macro_by_id: {}
};
// all proxy objects created to
var ProxyObjects = {};
var slide_window = null;

var suppress_sel_update_notification = 0;

var next_z = 1;
var can_reset_z = false;





// ============================ Macro update mechanism (JS -> CPP) =============================

// during drag/drop operations of selection rectangle and changes are collected
// and only commited in the onEndDrag handler

var Changes = {};

function add_change(mac_id, prop_name) {
    var dot = prop_name.indexOf('.');
    if (dot != -1) {
        prop_name = prop_name.split('.')[0];
    }
    if (!Changes[mac_id]) Changes[mac_id] = {};
    Changes[mac_id][prop_name] = 1;
}
function send_change(mac_id, prop_name) {
    add_change(mac_id, prop_name, 1);
    commit_changes();
}
function clear_changes() {
    JSONstring.ClearFilter();
    Changes = {};
}
function make_change(mac, prop_name, new_value, do_commit, want_notification) {
    mac[prop_name] = new_value;
    add_change(mac.uid, prop_name);
    if (do_commit) {
        commit_changes(want_notification);
    }
}
function commit_changes(want_notification) {
    var all_json = [];
    for (var uid in Changes) {
        var mac = Page.macro_by_id[uid];
        if (!mac) continue;
        var mac_changes = Changes[uid];
        JSONstring.ClearFilter();
        for (var change in mac_changes) {
            JSONstring.AddToFilter(change);
        }
        JSONstring.AddToFilter('uid');
        var s = JSONstring.make(mac, false);
        if (s) {
            all_json.push(s);
            var proxies = FindProxies(uid);
            for (var i = 0; i < proxies.length; i++) {
                proxies[i].onCommitChanges(s);
            }
        }
    }
    JSONstring.ClearFilter();
    Changes = {};
    var all = '[';
    for (var j = 0; j < all_json.length; j++) {
        if (all != '[') {
            all += ',' + all_json[j];
        } else {
            all += all_json[j];
        }
    }
    all += ']';
    if (all != '[]') {
        //alert(all);
        ENV.OnMacroChange(all, want_notification ? "true" : "false");
    }
}


// called from slide.htm
var in_drag = false;

function onBeginDrag() {
    in_drag = true;
    ENV.OnBeginDrag();
}
function onEndDrag() {
    if (!in_drag) return;
    commit_changes();
    ENV.OnEndDrag();
    in_drag = false;
}






// ============================== slide.htm utility functions =============================

function FindProxies(mac_id) {
    var ctrls = [];
    for (var id in ProxyObjects) {
        if (ProxyObjects[id]._mac_id == mac_id) {
            ctrls.push(ProxyObjects[id]);
        }
    }
    return ctrls;
}
function FindProxyIds(mac_id) {
    var ids = [];
    for (var id in ProxyObjects) {
        if (ProxyObjects[id]._mac_id == mac_id) {
            ids.push(id);
        }
    }
    return ids;
}

function FindProxy(mac_id, preferred_control_type, force_type) {
    var ctrls = [];
    var preferred = null;
    for (var id in ProxyObjects) {
        if (ProxyObjects[id].IsProxyFor(mac_id)) {
            ctrls.push(ProxyObjects[id]);
            if (preferred_control_type && id.indexOf('_' + preferred_control_type) != -1) {
                preferred = ProxyObjects[id];
            }
        }
    }
    if (ctrls.length == 0) return null;
    return preferred ? preferred : (!force_type ? ctrls[0] : null);
}

//StD reflection should not be necessary here (should be fixed in slide.htm)
function UpdateSlideControl(slide_obj, prop, value, force, no_obj_update) {
    if (!slide_obj) return null;
    // Note: we update internal slide object since we won't get notified from slide editor about change
    if (!no_obj_update) {
        slide_obj[prop] = value;
    }
    //if (Viewer.loading_take_) alert('prop_change:'+prop+':'+value);
    if (!slide_window) return;
    //StD do not grab into slidewindows internals, only use Page-Object
    //RF: UpdateSlideControl from slide.htm won't work in some cases,
    //like when I modify the z value in the OnActivate handler
    //slide.htm will be in Page.in_update and ignore the UpdateSlideControl call
    var ctl = slide_window.Controls[slide_obj.id];
    if (!ctl || !ctl._obj) return;
    if (force || ctl._obj[prop] != value) {
        ctl.SetParam(prop, value);
    }
}




// ============================== notifications from slide.htm =============================

var g_curr_focus_type = 'bubble';
var g_curr_focus_id = '';

function GetHtmlElement(proxy, html_id) {
    if (!slide_window) return null;
    if (!html_id) html_id = '#main#dom';
    return slide_window.document.getElementById(proxy.SlideObjId() + html_id);
}

function onFocus(no_scroll_into_view) {
    if (!g_curr_focus_id) return;
    var proxy = ProxyObjects[g_curr_focus_id];
    if (proxy) {
        proxy.onFocus();
        // scroll proxy objects into view
        if (!no_scroll_into_view) {
            slide_window.ScrollIntoView(FindProxyIds(proxy.MacroId()));
        }
    }
}

function onActivate(ctl_id) {
    if (in_drag) return;
    if (Viewer.loading_take_) return;

    var proxy = ProxyObjects[ctl_id];
    if (!proxy || !proxy._mac_id) {
        g_curr_focus_id = '';
        return;
    } else {
        g_curr_focus_id = proxy.SlideObjId();
    }
    g_curr_focus_type = proxy.SlideObjType();
    suppress_sel_update_notification++;
    Viewer.curr_selection_ = [];
    Viewer.curr_selection_.push(proxy.MacroId());
    Viewer.hide_show_controls_();

    if (suppress_sel_update_notification < 2) ENV.OnActivate(proxy.MacroId(), ctl_id);
    // use timeout because 'onSelectionChange' will be called immediately after onActivate
    // from slide.htm and will destroy the selection changes (for our related ctrl highlights) done in onFocus
    suppress_sel_update_notification--;

    if (suppress_sel_update_notification > 0) {
        window.setTimeout('onFocus(false);', 20);
    } else {
        window.setTimeout('onFocus(true);', 20);
    }
}



var g_last_slide_sel = '';
function onSelectionChange(new_sel) {
    g_last_slide_sel = new_sel;
    if (Viewer.loading_take_) return;
    if (suppress_sel_update_notification) return;
    if (new_sel) {
        new_sel = new_sel.replace(/MAC\_/g, 'MAC@');
        var sel = new_sel.split('|');
        new_sel = '';
        for (var i = 0; sel && i < sel.length; i++) {
            if (new_sel != '') new_sel += '|';
            var s = sel[i];
            s = s.replace(/\_.*/g, "");
            new_sel += s;
        }
        new_sel = new_sel.replace(/MAC\@/g, 'MAC_');
    }
    in_drag = true;
    ENV.OnSelectionChange(new_sel, "");
    in_drag = false;
}

function ResetZ() {
    if (!can_reset_z) {
        return;
    }

    // reset z
    next_z = 8000; // 8000: display bubbles & highlights on top of book page controls
    // also update other proxies for the same macro
    suppress_sel_update_notification++;
    var take = Page.take_by_id[Viewer.cur_take_uid];
    if (take && take.macros && take.macros.length) {
        for (var i = 0; i < take.macros.length; i++) {
            var proxies = FindProxies(take.macros[i].uid);
            for (var j = 0; j < proxies.length; j++) {
                proxies[j].onFocus(true);
                //slide_window.PageUpdateControl(proxies[j].SlideObjId(), 'z', ++next_z);
            }
        }
    }
    can_reset_z = false;
    suppress_sel_update_notification--;
}

function onDefaultEdit(ctl_id) {
    //DPS-20863: make sure the dragging flag is reset
    if (in_drag) {
        onEndDrag();
    }
    return false;
}

// called when a slide control property has changed (adjust internal data accordingly)
function onPropChange(ctl_id, prop, val) {
    //alert('' + prop + ' ' + val);
    LOG("onPropChange" + "(" + Viewer.loading_take_ + "):" + ctl_id + ":" + prop + ":" + val);
    //if (Viewer.loading_take_) return;
    if (prop == 'z') {
        can_reset_z = true;
        return;
    }
    if (prop == 'font_size') return;
    var proxy = ProxyObjects[ctl_id];
    if (proxy && proxy.Macro()) {
        proxy.SlideToMacro(proxy.Macro(), prop, val);
        // also update other proxies for the same macro
        var proxies = FindProxies(proxy.MacroId());
        for (var i = 0; i < proxies.length; i++) {
            if (proxies[i] != proxy) {
                proxies[i].onMacroChanged(proxies[i].Macro(), prop, val, true); //true: no slide update
            }
        }
    } else {
        LOG("ERROR: onPropChange handler not found" + ":" + ctl_id + ":" + prop + ":" + val);
    }
}

function onClamped(ctl_id, prop, old_value, new_value) {
    switch ('' + prop) {
        case 'x':
        case 'y':
        case 'w':
        case 'h':
            {
                onPropChange(ctl_id, prop, new_value);
            } break;
    }
}




// ============================== helper functions =============================


var g_mode_keys = ['_demo', '_prac', '_test', '_conc'];
function build_id_(mac_uid, type_name) {
    return mac_uid + '_' + type_name + g_mode_keys[Viewer.curr_mode_index_];
}

function GetOffset(info) {

    function GetOffsetProp(info, prop_name) {
        if (!prop_name) prop_name = 'offset';
        if (!info || info[prop_name] == null) return null;
        switch (typeof (info[prop_name])) {
            case 'number': return info[prop_name];
            case 'string':
                {
                    // format: slide_object_id.prop_name
                    var ref_info = info[prop_name].split('.');
                    if (ref_info.length == 2) {
                        var slide_obj_ref = ProxyObjects[ref_info[0]];
                        if (slide_obj_ref) slide_obj_ref = slide_obj_ref._slide_obj;
                        if (slide_obj_ref && slide_obj_ref[ref_info[1]]) {
                            return parseInt(slide_obj_ref[ref_info[1]]);
                        }
                    }
                };
        }
        return 0;
    }

    var offset = GetOffsetProp(info);
    if (offset != null) {
        offset += GetOffsetProp(info, 'offset2');
        offset += GetOffsetProp(info, 'offset3');
    }
    return offset;
}

function GetProperty(mac, info) {
    //prop_path, no_parse_int, min, max) {
    var no_parse_int = info.no_parse_int ? true : false;

    var value = null;
    var prop_path = info.mac_prop;
    var props = null;
    if (prop_path) {
        props = prop_path.split('.');
        if (props.length == 0) props.push(prop_path);
        value = mac[props[0]];
        if (typeof (value) == 'object') {
            for (var i = 1; i < props.length; i++) {
                value = value[props[i]];
                if (value == null || typeof (value) == 'undefined') {
                    value = null;
                    break;
                }
            }
        }
    }
    // init from globals (if exist)
    if (value == null && props && Viewer.Globals[props[0]] != null) {
        if (typeof (Viewer.Globals[props[0]]) == 'object') {
            value = Viewer.Globals[props[0]];
            for (var i = 1; i < props.length; i++) {
                value = value[props[i]];
                if (value == null || typeof (value) == 'undefined') {
                    value = null;
                    break;
                }
            }
            if (typeof (value) == 'object') {
                value = null; // mismatch between property path and global object type: we only handle atmic types here
            }
        } else {
            value = Viewer.Globals[props[0]];
        }
    }
    if (info.empty_is_invalid && value == '') value = null;
    if (value == null) value = info.value;
    if (value == null) return null;
    if (!no_parse_int) {
        if (parseInt(value) == value) {
            value = parseInt(value);
        }
    }
    if (info.min != null) {
        value = Math.max(info.min, value);
    }
    if (info.max != null) {
        value = Math.min(info.max, value);
    }

    var offset = GetOffset(info);
    if (offset != null) value += offset;

    return value;
}

function SetProperty(mac, prop_path, new_value, info) {
    //alert(prop_path + '=' + new_value);
    var props = prop_path.split('.');
    if (props.length == 0) props.push(prop_path);
    var old_value = mac[props[0]];
    if (typeof (value) == 'object') {
        for (var i = 1; i < props.length; i++) {
            old_value = old_value[props[i]];
            if (old_value == null || typeof (old_value) == 'undefined') {
                old_value = null;
                break;
            }
        }
    }
    var no_parse_int = info && info.no_parse_int;
    if (!no_parse_int) {
        if (old_value != null && typeof (old_value) != 'undefined') {
            if (parseInt(old_value) == old_value) {
                old_value = parseInt(old_value);
            }
        }
        if (parseInt(new_value) == new_value) {
            new_value = parseInt(new_value);
        }
    }
    var offset = GetOffset(info);
    if (offset != null) new_value -= offset;

    if (old_value != null) {
        if (new_value == old_value) return false;
    }

    switch (props.length) {
        case 0, 1:
            mac[prop_path] = new_value;
            break;
        case 2:
            if (!mac[props[0]]) mac[props[0]] = {};
            mac[props[0]][props[1]] = new_value;
            break;
        case 3:
            if (!mac[props[0]]) mac[props[0]] = {};
            if (!mac[props[0]][props[1]]) mac[props[0]][props[1]] = {};
            mac[props[0]][props[1]][props[2]] = new_value;
            break;

    }
    add_change(mac.uid, prop_path);

    return true;
}




// ==================================== PROXY ====================================

// translate properties from macros to slide controls and vice versa
function Proxy() {
    this._mac_id = '';
    this._slide_obj = {};
    // map with rules for basic mapping between macro/slide properties
    this._prop_map = null;
}

// Macro info
Proxy.prototype.Macro = function () {
    return Page.macro_by_id[this._mac_id];
}
Proxy.prototype.MacroId = function () {
    return this._mac_id;
}
Proxy.prototype.MacroType = function () {
    var mac = Page.macro_by_id[this._mac_id];
    return mac ? mac.macro_template : '';
}

// Slide info
Proxy.prototype.SlideObj = function () {
    return this._slide_obj;
}
Proxy.prototype.SlideObjId = function () {
    return this._slide_obj.id;
}
Proxy.prototype.SlideObjType = function () {
    return this._slide_obj.type;
}

Proxy.prototype.Create = function (mac, slide_type, prop_map) {

    if (!mac || !slide_type) return false;
    this._mac_id = mac.uid;

    // initialize slide ctrl with some defaults
    this._slide_obj = {};
    var so = this._slide_obj;
    so.id = build_id_(mac.uid, slide_type);
    so.type = slide_type;
    so.text = '';
    so.hide_scrollbars = mac.hide_scrollbars ? true : false;
    so.border = mac.border ? parseInt(mac.border) : 0;
    so.padding = mac.padding ? parseInt(mac.padding) : 0;
    so.font_size = mac.font_size ? parseInt(mac.font_size) : 1;
    so.z = this.IsFocused() ? (next_z + 500) : next_z++;
    if (mac.hidden || this.IsHidden(mac)) {
        so.hidden = true;
    }


    if (prop_map) {
        // user our property mapping engine
        mac = this.calc_pos_(mac);
        this.MacroToSlide(mac, prop_map);
    }

    return true;
}

Proxy.prototype.calc_pos_ = function (mac) {
    if (mac.click_pos_rel && mac.alignment != "free" && mac.alignment) {
        var pos = { x: 0, y: 0 };
        var rect = { width: Viewer.last_page_w_, height: Viewer.last_page_h_ };

        var alignment_params = new AlignmentParams(mac.click_pos_rel.left,
                                                   mac.click_pos_rel.top,
                                                   mac.b_width,
                                                   mac.b_height,
                                                   mac.alignment,
                                                   rect);

        pos = alignment_params.calc_pos_from_align_();

        mac.click_pos_rel.left = pos.x + (mac.b_width) / 2;
        mac.click_pos_rel.top = pos.y + (mac.b_height) / 2;
    }
    return mac;
}

Proxy.prototype.MacroToSlide = function (mac, prop_map, refresh_slide_obj) {
    if (!prop_map) return;
    if (prop_map != this._prop_map) {
        this._prop_map = clone_obj(prop_map);
    }
    // automatically deduce from x,y,w,h property rules whether the ctrl will be locked or not
    var movable = true;
    var sizeable = true;
    for (var slide_prop in prop_map) {
        var info = prop_map[slide_prop];
        var value;
        if (info.read_func) {
            value = eval(info.read_func);
        } else {
            if (info.access && info.access.indexOf('r') == -1) continue;
            if ((slide_prop == 'x' || slide_prop == 'y') && info.access && info.access.indexOf('w') == -1) {
                movable = false;
            }
            if ((slide_prop == 'w' || slide_prop == 'h') && info.access && info.access.indexOf('w') == -1) {
                sizeable = false;
            }
            value = GetProperty(mac, info);
        }
        if (value != null && this._slide_obj[slide_prop] != value) {
            this._slide_obj[slide_prop] = value;
            if (refresh_slide_obj) {
                UpdateSlideControl(this.SlideObj(), slide_prop, value);
            }
        }
    }
    if (!movable || !sizeable) {
        this._slide_obj.movable = false;
        this._slide_obj.locked = true;
        if (refresh_slide_obj) UpdateSlideControl(this.SlideObj(), 'movable', false);
        if (refresh_slide_obj) UpdateSlideControl(this.SlideObj(), 'locked', true);
    }
}

Proxy.prototype.SlideToMacro = function (mac, slide_prop_name, prop_value) {

    //alert("Proxy::SlideToMacro " + mac.uid + " " + slide_prop_name + ":" + prop_value);
    if (slide_prop_name == 'x' || slide_prop_name == 'y' || slide_prop_name == 'w' || slide_prop_name == 'h') {

        prop_value = parseInt(prop_value);
    }
    // necessary: update our internal slide object
    this._slide_obj[slide_prop_name] = prop_value;

    if (!this._prop_map || !this._prop_map[slide_prop_name]) {
        // without mapping rules, a 1:1 mapping is used (macro property name == slide property name)
        SetProperty(mac, slide_prop_name, prop_value, null);
    } else {
        // with mapping rule
        var info = this._prop_map[slide_prop_name];
        if (info.access && info.access.indexOf('w') == -1) return;
        if (info.write_func) {
            // either call a write function
            eval(info.write_func); //Attention: might use parameter names from this function (e.g. prop_value)
        } else {
            // or change the mac property directly
            if (info.mac_prop) {
                SetProperty(mac, info.mac_prop, prop_value, info);
            }
        }
    }
}

Proxy.prototype.IsProxyFor = function (mac_id) {
    return this._mac_id == mac_id;
}

Proxy.prototype.onMacroChanged = function (mac, slide_prop, slide_val/*, no_slide_update */) {
    this.MacroToSlide(mac, this._prop_map, !arguments[3]);
}

Proxy.prototype.onFocus = function (do_not_select) {
    suppress_sel_update_notification++;
    var proxies = FindProxies(this._mac_id);
    if (do_not_select) {
        can_reset_z = true;
    }
    next_z = Math.max(next_z, 10000); //Note: 10000 base is needed to get ctrl on top of bookpage ctrls
    for (var i = 0; i < proxies.length; i++) {
        if (proxies[i] == this) continue;
        if (do_not_select) {
            slide_window.PageUpdateControl(proxies[i].SlideObjId(), 'z', ++next_z);
            continue;
        }
        if (proxies[i].SlideObj() && proxies[i].SlideObj().locked != true) {
            UpdateSlideControl(proxies[i].SlideObj(), 'z', ++next_z);
        }
        slide_window.Editor.Select(proxies[i].SlideObjId(), true);
    }
    if (this.SlideObj() && this.SlideObj().locked != true) {
        if (do_not_select) {
            slide_window.PageUpdateControl(this.SlideObjId(), 'z', ++next_z);
        } else {
            UpdateSlideControl(this.SlideObj(), 'z', ++next_z);
        }
    }
    suppress_sel_update_notification--;
}

Proxy.prototype.IsFocused = function () {
    return this.SlideObjId() == g_curr_focus_id;
}

Proxy.prototype.IsSelected = function () {
    for (var i = 0; i < Viewer.curr_selection_.length; i++) {
        if (this.IsProxyFor(Viewer.curr_selection_[i])) return true;
    }
    return false;
}

Proxy.prototype.IsVisible = function (mac) {
    return true;
}

Proxy.prototype.IsHidden = function (mac) {
    return false;
}

// called when modifications to the slide ctrl are submitted to CPP (usually after onEndDrag)
Proxy.prototype.onCommitChanges = function (json) {
}





// ======================================= VIEWER ======================================

function ViewerBase() {
    this.Context = {}; // 'project' and 'base'

    this.Lesson = {};
    this.Globals = {};
    this.ExtraParams = {};

    this.loading_take_ = false;
    this.curr_selection_ = [];

    this.last_page_w_ = 640;
    this.last_page_h_ = 480;

    this.readonly_ = true;

    this.type_map = {};

    // single/multi bubble view mode
    this.is_single_bubble_mode = false;

    // 'modes' support (demo/practice/test/concurrent)
    this.curr_mode_index_ = 0;
    this.demo_mode_index_ = 0;
    this.prac_mode_index_ = 1;
    this.test_mode_index_ = 2;
    this.conc_mode_index_ = 3;
}

ViewerBase.prototype.SetContext = function (key, value) {
    if (typeof key == 'string') {
        this.Context[key] = arguments[1];
    } else {
        // key is a WCT.context object
        this.Context.base = key.GetBase();
        this.Context.project = key.Get('project');
    }
}

ViewerBase.prototype.SetLesson = function (lesson_obj, readonly) {
    this.readonly_ = readonly;
    next_z = 8000; // 8000: display bubbles & highlights on top of book page controls
    this.curr_selection_ = [];

    if (!lesson_obj) return;
    this.Lesson = lesson_obj;

    this.Globals = lesson_obj.global_params;
    if (this.Globals == null) this.Globals = {};

    this.ExtraParams = lesson_obj.user_header;
    if (this.ExtraParams == null) this.ExtraParams = {};

    var trainer_skin_dir = this.ExtraParams['trainer_skin_dir'];
    if (!trainer_skin_dir) {
        trainer_skin_dir = 'adaptable:trainer_skin';
    }
    this.SetContext('trainer_skin_dir', trainer_skin_dir);

    var content_language = this.ExtraParams['language'];
    if (!content_language) {
        content_language = 'de-DE';
    }

    slide_window.Page.SetVariable('content_language', content_language);
    var cur_text_style = this.ExtraParams['text_style'];
    if (cur_text_style) {
        slide_window.Page.SetVariable('text_style', cur_text_style);
    }
    // init take/macro id maps
    Page.take_by_id = {};
    Page.macro_by_id = {};
    var takes = this.Lesson.tourstops;
    for (var i = 0; i < takes.length; i++) {
        var take = takes[i];
        Page.take_by_id[take.uid] = take; //Note: take.uid == ride2::Take->Name in .cpp

        for (var j = 0; j < take.macros.length; j++) {
            Page.macro_by_id[take.macros[j].uid] = take.macros[j];
        }
    }

    if (!(this.cur_take_uid in Page.take_by_id)) {
        this.cur_take_uid = "";
    }
    this.load_take(Page.take_by_id[this.cur_take_uid]);
}

// called when a take has been focused
ViewerBase.prototype.SetCurTake = function (uid) {
    if (in_drag) {
        if (uid != 'deferred_call') {
            this.deferred_uid = uid;
        }
        window.setTimeout("Viewer.SetCurTake('deferred_call')", 100);
        return;
    } else if (uid == 'deferred_call') {
        uid = this.deferred_uid;
    }
    // load and display the focused take if different from current take
    if (this.cur_take_uid != uid) {
        can_reset_z = false;
        suppress_sel_update_notification++;
        this.load_take(Page.take_by_id[uid]);
        var any = false;
        if (is_empty_obj(ProxyObjects)) { slide_window.ScrollIntoView(); }
        suppress_sel_update_notification--;
    }
}

// called when one or more takes have changed
ViewerBase.prototype.UpdateTakes = function (takes, cur_take_id) {
    if (this.loading_take_ == true) return;
    if (!takes) return;
    if (in_drag) return;

    var load_take = {};
    for (var i = 0; i < takes.length; i++) {
        var take = takes[i];
        var take_id = take.uid;

        if (cur_take_id == take_id) {
            load_take = take;
        }
        // remove all previous macros from take
        var old_take = Page.take_by_id[take_id];
        for (var j = 0; j < old_take.macros.length; j++) {
            Page.macro_by_id[old_take.macros[j].uid] = null;
        }

        // set new take
        Page.take_by_id[take_id] = take;

        // add new take macros
        for (var j = 0; j < take.macros.length; j++) {
            Page.macro_by_id[take.macros[j].uid] = take.macros[j];
        }
    }

    // reload take if necessary
    this.cur_take_id = cur_take_id;
    if (load_take != {}) {
        this.load_take(load_take);
    }
},

ViewerBase.prototype.load_take = function (take) {
    if (!slide_window) return;
    if (in_drag) return;

    ProxyObjects = {};

    this.cur_take_uid = take ? take.uid : '';

    var new_slide = this.create_new_slide(take);

    // set base
    slide_window.Context.Set('project', this.Context.project);
    slide_window.Page.SetBase(this.Context['base'] + "/");

    // slide.htm will clamp coordinates to 0 (e.g. when rectangle is partly outside of window)
    // and send a property update, but we ignore that, otherwise the clamp will be part of our data model
    clear_changes();
    this.loading_take_ = true;
    slide_window.Page.ClearSlide();
    slide_window.Page.Create(new_slide, null, null, true /* LESSON_EDIT */); //slide.htm::prototype.Init will be called here
    load_css();
    this.loading_take_ = false;
    commit_changes(false); // commit changes accumulated during slide_window.Page.Create (received in onClamped)

    // call SetReadonly just here, after creation is done. Slide engine can not handle early
    // set as it does not create controls and at the same moment checks wheather the control
    // should be in preview mode or not.
    if (slide_window) slide_window.Page.SetReadOnly(this.readonly_);

}

ViewerBase.prototype.is_take_selected_ = function () {
    for (var i = 0; i < this.curr_selection_.length; i++) {
        if (Page.take_by_id[this.curr_selection_[i]]) return true;
    }
    return false;
}

ViewerBase.prototype.hide_show_controls_ = function () {
    if (!slide_window) return;
    for (var id in ProxyObjects) {
        var proxy = ProxyObjects[id];
        if (proxy && proxy.SlideObj() && proxy.Macro()) {
            var hidden = !proxy.IsVisible(proxy.Macro()) || proxy.IsHidden(proxy.Macro());
            //DPS-12975: force update of 'hidden' attribute in is_single_object_mode
            //as workaround for ctrls being visible but having the 'hidden' attribute already
            UpdateSlideControl(proxy.SlideObj(), 'hidden', hidden, this.is_single_bubble_mode);
        }
    }
}

ViewerBase.prototype.get_glossary_item = function (key, no_br) {
    //Note: we can't cache items since the project language might have changed and we don't get a notification about that
    var value = ENV.GetGlossaryItem('' + key);
    return value ? to_html(value, no_br) : '';
}

ViewerBase.prototype.create_new_slide = function (take) {

    var new_slide = { controls: {} };

    if (!take || !take.macros) {
        new_slide.controls.page = this.create_page_control_(null);
    } else {
        // clone the macro array since we are going to remove processed macros from it
        var macros = clone_obj(take.macros);

        // first, create the page control (or a dummy)
        new_slide.controls.page = this.create_page_control(macros, new_slide);
        if (!new_slide.controls.page) new_slide.controls.page = this.create_page_control_(null);

        // then create form/branch controls
        this.create_collection_proxies(new_slide, macros);

        // then all other controls
        for (var i = 0; i < macros.length; i++) {
            this.create_proxies_(macros[i], new_slide);
        }
    }

    return new_slide;
}

ViewerBase.prototype.create_page_control = function (macros, new_slide) {
    return null;
}

ViewerBase.prototype.create_page_control_ = function (mac, rect) {
    var page = {
        type: 'page', version: 2, id: 'page',
        x: 0, y: 0, w: this.last_page_w_, h: this.last_page_h_,
        border: 1, background_color: "#FFF6EB", // same color as slides in picview
        fontsizeInPt: true,
        canvas_color: "#FFFFFF", border_color: "#111111",
        image: { id: '', w: 0, h: 0 } // set empty image to prevent that the bookstyle standard background image is used
    };

    if (mac) {
        // Important: only use globals if we have a macro, otherwise the slide background might be messed up
        page.skin = this.Globals['g_icon_skin'];
        page.background_color = this.Globals['g_background_color'];
        page.canvas_color = this.Globals['g_canvas_color'];
        page.border = this.Globals['g_border'];
        page.border_color = this.Globals['g_border_color'];
        page.border_style = this.Globals['g_border_style'];
        page.background_image_centered = this.Globals['g_background_image_centered'];

        if (rect) {
            page.w = rect.width;
            page.h = rect.height;
        }
        if (mac.dump_page) {
            //Note: only add image attribute then there really is an image
            //otherwise, we will get a placeholder
            page.image = { id: "macro!" + mac.uid + "/" + mac.dump_page + "/img.png" };
        }
    }

    page.w = Math.max(16, page.w);
    page.h = Math.max(16, page.h);
    this.last_page_w_ = page.w;
    this.last_page_h_ = page.h;

    return page;
}

ViewerBase.prototype.add_proxy = function (new_slide, proxy) {
    ProxyObjects[proxy.SlideObjId()] = proxy;
    new_slide.controls[proxy.SlideObjId()] = proxy._slide_obj;
}

ViewerBase.prototype.create_collection_proxies = function (new_slide, macros) {
}


ViewerBase.prototype.has_type = function (mac, types) {
    var slide_type = this.type_map[mac.macro_template];
    if (!slide_type) return '';
    var slide_types = slide_type.split(',');
    if (slide_types.length == 0) slide_types.push(slide_type);
    for (var j = 0; j < slide_types.length; j++) {
        for (var i = 0; i < types.length; i++) {
            if (slide_types[j] == types[i]) return types[i];
        }
    }
    return '';
}

ViewerBase.prototype.create_proxies_ = function (mac, new_slide) {
}



// Selection/Focus management
ViewerBase.prototype.SetCurMacro = function (macro_id) {
    var proxy = FindProxy(macro_id, g_curr_focus_type);
    if (proxy) {
        g_curr_focus_id = proxy.SlideObjId();
        //!!!!proxy.onFocus();
    } else {
        g_curr_focus_id = '';
    }
}

//Format: seleted_macro_id1|selected_macro_id2|...
var g_ignore_set_selection_from_cpp = 0;
ViewerBase.prototype.SetSelection = function (selected_ids) {
    if (!slide_window) return;
    if (g_ignore_set_selection_from_cpp) return;
    if (in_drag) {
        if (selected_ids != 'deferred_call') {
            this.deferred_selected_ids = selected_ids;
        }
        window.setTimeout("Viewer.SetSelection('deferred_call')", 150);
        return;
    } else if (selected_ids == 'deferred_call') {
        selected_ids = this.deferred_selected_ids;
    }
    LOG("Viewer: SetSelection" + selected_ids);

    suppress_sel_update_notification++;
    var selection = selected_ids ? selected_ids.split('|') : [];
    if (!selection && selected_ids) {
        selection = [selected_ids];
    }
    for (var i = 0; i < selection.length; i++) {
        if (selection[i] == '') selection.splice(i, 1);
    }
    this.curr_selection_ = selection;
    selection = '';
    slide_window.Editor.SelectSingle(''); // necessary to get rid of purple frame when selecting nothing
    for (var i = 0; i < this.curr_selection_.length; i++) {
        var proxy = FindProxy(this.curr_selection_[i], g_curr_focus_type);
        if (proxy) {
            if (selection) selection += ',';
            selection += proxy.SlideObjId();
        }
    }
    slide_window.Editor.SetSelection(selection);
    //if (!selection) ScrollIntoView();
    this.hide_show_controls_();
    suppress_sel_update_notification--;
}

ViewerBase.prototype.SelectAll = function (b) {
    var map = {};
    var all_macro_ids = '';
    for (var id in ProxyObjects) {
        var proxy = ProxyObjects[id];
        if (!map[proxy.MacroId()]) {
            all_macro_ids += all_macro_ids ? ('|' + proxy.MacroId()) : proxy.MacroId();
            map[proxy.MacroId()] = true;
        }
    }
    if (all_macro_ids) {
        // enable update to CPP
        this.SetSelection(all_macro_ids);
        g_ignore_set_selection_from_cpp++;
        onSelectionChange(g_last_slide_sel);
        g_ignore_set_selection_from_cpp--;
    }
}


// single/multi bubble mode
ViewerBase.prototype.ToggleSingleObjectMode = function () {
    this.is_single_bubble_mode = !this.is_single_bubble_mode;
    this.hide_show_controls_();
    return this.is_single_bubble_mode;
}
ViewerBase.prototype.SetSingleObjectMode = function (is_single_mode) {
    var single_mode = ('' + is_single_mode) == 'true';
    if (this.is_single_bubble_mode == single_mode) return;
    this.is_single_bubble_mode = single_mode;
    this.hide_show_controls_();
    ENV.OnSetSingleObjectMode(this.is_single_bubble_mode);
}
ViewerBase.prototype.GetSingleObjectMode = function () {
    ENV.OnSetSingleObjectMode(this.is_single_bubble_mode);
}

// Mode support
ViewerBase.prototype.SetModes = function (modes_in) {     // index1=name1|index2=name2...
}
ViewerBase.prototype.SetMode = function (mode) {
    mode = parseInt(mode);
    if (mode == this.curr_mode_index_) return;
    this.curr_mode_index_ = mode;
    load_css();
    this.load_take(Page.take_by_id[this.cur_take_uid]);
}
ViewerBase.prototype.isDemoMode = function () {
    return this.curr_mode_index_ == this.demo_mode_index_;
}
ViewerBase.prototype.isPracticeMode = function () {
    return this.curr_mode_index_ == this.prac_mode_index_;
}
ViewerBase.prototype.isTestMode = function () {
    return this.curr_mode_index_ == this.test_mode_index_;
}
ViewerBase.prototype.isConcurrentMode = function () {
    return this.curr_mode_index_ == this.conc_mode_index_;
}






//======================================= browser event handlers =====================================

function onLoad() {
    load_css();
}

function onMouseWheel(event) {
    if (event.ctrlKey) return;
    if (in_drag) return false;
    var frame = document.getElementById('edit_frame');
    if (!frame) return;
    slide_window = frame.contentWindow;
    if (!slide_window) return;
    var doc = slide_window.document.documentElement;
    if (!doc) return;

    var delta = event.wheelDelta;

    if (delta != 0) ENV.OnUserChange(Viewer.is_single_bubble_mode ? 'macro' : 'take', delta < 0 ? 1 : -1);

    return false;
}

function frameLoaded() {

    function addEventSimple(o, e, f) {
        if (o.addEventListener) {
            o.addEventListener(e, f, false);
        } else if (o.attachEvent) {
            o.attachEvent('on' + e, f);
        }
    }

    var frame = document.getElementById('edit_frame');
    if (!frame) return;

    slide_window = frame.contentWindow;
    if (!slide_window) return;

    slide_window.Page.SetSink(this);

    slide_window.Page.SetSettings({
        SlideSettingsSnapEnabled: false
    });

    addEventSimple(slide_window.document, 'mousewheel', onMouseWheel);    // Note: can't call functions from window.external here because it's not valid yet
}

function onPageComplete() {
    ENV.OnPageComplete();
}

function onReadystatechangeFrame() {
    var frame = document.getElementById('edit_frame');
    if (!frame) return;
    slide_window = frame.contentWindow;
    if (slide_window && frame.readyState == "complete") {
        slide_window.Env.pageComplete();
    }
    onResize();
}

function onResize() {
    var el = document ? document.documentElement : null;
    if (!el) return;

    var w = window.innerWidth ? innerWidth : (el.clientWidth || document.body.offsetWidth);
    var h = window.innerHeight ? innerHeight : (el.clientHeight || document.body.offsetHeight);
    if (!w || !h) return; //Note: is invalid when using Producer:tools/migration/export translatable all (without open project)

    var f = document.getElementById('edit_frame');
    if (!f) return;
    f.style.left = '0px';
    f.style.top = '0px';
    f.style.width = w + 'px';
    f.style.height = h + 'px';

    if (slide_window && slide_window.hdl_onresize) {
        slide_window.hdl_onresize();
    }
}

function onBlur() {
    if (!slide_window) return;
    if (!slide_window.Editor) return;
    slide_window.Editor.OnBlur();
}

// ctx need to be declared in order for the macroset.js inclusion and explanation macro text expansion to work
var ctx = {};


