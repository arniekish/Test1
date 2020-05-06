#use(util.js)

var in_step = false;
var process_id = "*";
var last_step_id = "";
var curr_screen = null;
var curr_object = null;
var ctx_transition = {};
var last_pa_control = null;
var curr_app = null;
var profile_map = {};
var init_step_added = false;
var is_rtl = false;
var language = "en-US";
var Form = [];

var QUICK_RECORDING = "QuickRecording";
var QUICK_RECORDING_TEMPL = "<ConfigurationTemplate>\nQuickRecordingDummyTemplate\n</ConfigurationTemplate>";

function get_bubble(pc, params, expl_type, action_type, last_step_id) {
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("bubblestyle_d", "SHELF");
    pc.Check("b_width", "INTEGER");
    pc.Check("b_height", "INTEGER");
    pc.Check("orientation", "ORIENTATION_BUBBLE");
    pc.Check("bubble_offset", "POSITION", {'left':0, 'top':0} );
    pc.Check("b_minimized", "BOOL_0_1");
    pc.Check("b_minimizable", "BOOL_0_1");
    pc.Check("no_spike", "BOOL_0_1");
    pc.Check("b_hide_option", "BOOL_0_1", false);
    pc.Check("condition_bubblestyle", "SHELF", "");

    var bubble_text = params.explanation_d;
    var bubble_style = params.bubblestyle_d;
    if (action_type == CA_ACTION && params.condition_pattern) {
        bubble_text = params.condition_text;
        if (params.condition_bubblestyle) {
            bubble_style = (params.condition_bubblestyle == "") ?
                            params.bubblestyle_d : params.condition_bubblestyle;
        }
    }
    
    var bubble = new winnavp_Bubble();

    bubble.text = ca_dgo_resolve(params, ca_get_explanation(params.type, bubble_text), 1);
    bubble.text = ca_dgo_resolve(null, bubble.text, 2);
    if (params.b_hide_option) {
        bubble.text = winnavp_ca.AddHideOption(params.uid, bubble.text, expl_type);
    } else {
        if (expl_type == APP_EXPL || !winnavp_ca.pa_) {
            bubble.text = '<div id="text_div" style="width:100%;">' + bubble.text + '</div>';
        }
    }
    
    var show_next_btn = true;
    if (winnavp_global.LightMode) {
        if (!winnavp_ca.HasEndWindow()) {
            show_next_btn = !winnavp_ca.IsEndStep(last_step_id);
        }
    } else {
        show_next_btn = params.show_next_btn;
        if (params.optional) {
            show_next_btn = true;
        }
    }
    
    var show_prev_btn = !winnavp_ca.IsStartStep(last_step_id);
    var show_preview_btn = (winnavp_global.LightMode && !expl_type);

    bubble.text = winnavp_ca.AddBottomBar(params.uid, bubble.text, show_next_btn, show_prev_btn, show_preview_btn);

    bubble.style = B_STYLE(bubble_style);
    bubble.width = params.b_width;
    bubble.height = params.b_height;
    bubble.orientation = params.orientation;
    bubble.orig_orientation = params.orientation;
    bubble.offset_x = params.bubble_offset.left - 0;
    bubble.offset_y = params.bubble_offset.top - 0;
    bubble.minimized = params.b_minimized;
    bubble.no_spike = params.no_spike;
    bubble.minimizable = params.b_minimizable;
    bubble.mini_style = _W("adaptable!" + winnavp_ca.init_params_.mini_bubble_style);
    return bubble;
}


function include_navigation(project_id, ctx){
    var puid = project_id ? project_id.replace("project!", "") : "";

    var incl_navi = load_resource(_W(project_id + ":lesson.js"));
    var is_pa = winnavp_ca.process_oriented;
    winnavp_ca.process_oriented = false;

    if (incl_navi && puid) {
        if (incl_navi.user_header.shelftype == "context_assistant" && incl_navi.tourstops != null) {
            var old_uid = winnavp_player.uid;
            var old_src = winnavp_player.sim_src;

            winnavp_player.uid = puid;

            for (var i = 0; i < incl_navi.tourstops.length; i++) {
                var ns = incl_navi.tourstops[i];

                if (ns.macros != null) {
                    ctx_nsuid = ns.uid

                    var macros = ns.macros;
                    for (var j = 0; j < macros.length; j++) {
                        if (macros[j].macro_template != "start_unit") {
                            var mtype = mymacroset[macros[j].macro_template];
                            mtype(ctx, macros[j]);
                        } else {
                            if (macros[j].source) {
                                winnavp_player.sim_src = macros[j].source;
                            } else {
                                winnavp_player.sim_src = "";
                            }
                        }
                    }
                }
            }

            winnavp_player.uid = old_uid;
            winnavp_player.sim_src = old_src;

            if (winnavp_global.NavChangeCheckFreq != -1) {
                ResourceWatcher.InsertResource(winnavp_player.wa_id, puid, "lesson.js", "project");
            }
        }
    }

    winnavp_ca.process_oriented = is_pa;
}

function MacroSet() { }

MacroSet.prototype.build_globals = function(c) {
    if (!("global_params" in c)) c.global_params = {};
    var pc = new CAParamChecker(c.defaults, "global", c.global_params, null);

    pc.Check("bubblestyle_d", "SHELF", "white_island");
    pc.Check("b_width", "INTEGER", 150);
    pc.Check("b_height", "INTEGER", 40);
    pc.Check("b_minimizable", "BOOL_0_1", true);
    pc.Check("b_minimized", "BOOL_0_1", true);
    pc.Check("orientation", "ORIENTATION_BUBBLE", "SE");
    pc.Check("no_spike", "BOOL_0_1", false);
    pc.Check("bubble_offset", "POSITION", {'left':0, 'top':0});
    pc.Check("highlight_offset", "POSSIZE", {'left':0, 'top':0, 'right':0, 'bottom':0});
    pc.Check("g_highlight_effect", "ENUM", "frame");
    pc.Check("g_highlight_border", "INTEGER", 4);
    pc.Check("g_highlight_bgr", "COLOR", "0x0FAAFF" );
    pc.Check("b_hide_option", "BOOL_0_1", false);
    pc.Check("bend_style", "SHELF", "small");
    pc.Check("bend_position", "POSITION", {'left':600, 'top':200});
    pc.Check("bend_width", "INTEGER", 300);
    pc.Check("bend_height", "INTEGER", 270);
    pc.Check("bexp_style", "SHELF", "white_island");
    pc.Check("bexp_position", "POSITION", {'left':600, 'top':200});
    
    this.build_hotkey_map_(c.nav_global);
    this.build_glossary_params_(c.nav_global); 
    profile_map = {};
}

MacroSet.prototype.build_overrides = function(c) {
    if (!("global_params" in c)) c.global_params = {};
    var pc = new CAParamChecker(c.defaults, "global", c.global_params, null);

    pc.Check("nav_check_freq", "FLOAT", 3.0);
    pc.Check("disable_standby", "BOOL_0_1", false);
    pc.Check("disable_exit", "BOOL_0_1", false);
    pc.Check("bform_style", "SHELF", "white_island");
    pc.Check("bform_position", "POSITION", {'left':300, 'top':500});
    pc.Check("bform_width", "INTEGER", 350);
    pc.Check("bform_height", "INTEGER", 350);
    pc.Check("bform_alignment", "ENUM", "free");
    pc.Check("enable_tincan", "BOOL_0_1", false);

    winnavp_global.DisableStandby = c.global_params.disable_standby;
    winnavp_global.DisableExit = c.global_params.disable_exit;
    winnavp_global.FormStyle = c.global_params.bform_style;
    winnavp_global.FormPostion = c.global_params.bform_position;
    winnavp_global.FormWidth = c.global_params.bform_width;
    winnavp_global.FormHeight = c.global_params.bform_height;
    winnavp_global.FormAlignment = c.global_params.bform_alignment;
    winnavp_global.EnableTinCan = c.global_params.enable_tincan;
    winnavp_global.NavChangeCheckFreq = -1;

    if (c.global_params.nav_check_freq != -1) {
        winnavp_global.NavChangeCheckFreq = c.global_params.nav_check_freq * 60000;
    }
}

MacroSet.prototype.build_glossary_params_ = function(params) {
    var pc_global = new CAParamChecker(null, "", params, null);
    pc_global.Check("gloss_bubble_style", "ENUM", "white_island");
    pc_global.Check("gloss_bubble_size", "SIZE", {'width':400, 'height':40});
    
    winnavp_global.GlossBubbleStyle = params.gloss_bubble_style;
    winnavp_global.GlossBubbleSize = params.gloss_bubble_size;
}

MacroSet.prototype.build_hotkey_map_ = function(params) {
    
    winnavp_global.HotKeyMap = {};
    
    var pc_global = new CAParamChecker(null, "", params, null);
    pc_global.Check("minimize_da", "TEXT", "ctrl f12");
    pc_global.Check("next_screen", "TEXT", "ctrl alt right");
    pc_global.Check("back", "TEXT", "ctrl alt left");
    pc_global.Check("abort", "TEXT", "ctrl alt a");
    pc_global.Check("restart", "TEXT", "ctrl alt r");
    pc_global.Check("start_pa", "TEXT", "ctrl alt n");
    pc_global.Check("start_demo", "TEXT", "ctrl alt d");
    pc_global.Check("start_prac", "TEXT", "ctrl alt p");
    pc_global.Check("start_test", "TEXT", "ctrl alt t");
    pc_global.Check("start_concur", "TEXT", "ctrl alt c");
    pc_global.Check("start_book", "TEXT", "ctrl alt b");
    pc_global.Check("toggle_ctx_rec", "TEXT", "ctrl alt s");
    pc_global.Check("select_next", "TEXT", "ctrl alt pgdown");
    pc_global.Check("select_prev", "TEXT", "ctrl alt pgup");
    pc_global.Check("toggle_warning", "TEXT", "ctrl alt w");
    pc_global.Check("execute_step", "TEXT", "ctrl alt space");
    pc_global.Check("next_tab", "TEXT", "ctrl alt end");
    pc_global.Check("toggle_standby", "TEXT", "ctrl f11");
    pc_global.Check("copy_link", "TEXT", "ctrl alt f");
    pc_global.Check("share_email", "TEXT", "ctrl alt i");
    pc_global.Check("start_default", "TEXT", "ctrl alt j");
    pc_global.Check("show_da_help", "TEXT", "ctrl alt h");
    pc_global.Check("request_content", "TEXT", "ctrl alt k");
    pc_global.Check("search_content", "TEXT", "ctrl alt m");
    pc_global.Check("show_hidden_elems", "TEXT", "ctrl alt o");
    pc_global.Check("toggle_side_bar", "TEXT", "ctrl alt u");
    pc_global.Check("start_group", "TEXT", "ctrl alt g");
    pc_global.Check("maximize_trainer", "TEXT", "ctrl alt home");

    winnavp_global.HotKeyMap[params.minimize_da] = state_map.TOGGLE_MINIMIZE;
    winnavp_global.HotKeyMap[params.next_screen] = state_map.NEXT_SCREEN;
    winnavp_global.HotKeyMap[params.back] = state_map.BACK;
    winnavp_global.HotKeyMap[params.abort] = state_map.ABORT;
    winnavp_global.HotKeyMap[params.restart] = state_map.RESTART;
    winnavp_global.HotKeyMap[params.start_pa] = state_map.START_PA;
    winnavp_global.HotKeyMap[params.start_demo] = state_map.START_DEMO;
    winnavp_global.HotKeyMap[params.start_prac] = state_map.START_PRAC;
    winnavp_global.HotKeyMap[params.start_test] = state_map.START_TEST;
    winnavp_global.HotKeyMap[params.start_concur] = state_map.START_CONCUR;
    winnavp_global.HotKeyMap[params.start_book] = state_map.START_BOOK;
    winnavp_global.HotKeyMap[params.toggle_ctx_rec] = state_map.TOGGLE_CONTEXT_REC;
    winnavp_global.HotKeyMap[params.select_next] = state_map.SELECT_NEXT;
    winnavp_global.HotKeyMap[params.select_prev] = state_map.SELECT_PREV;
    winnavp_global.HotKeyMap[params.toggle_warning] = state_map.TOGGLE_WARNING;
    winnavp_global.HotKeyMap[params.execute_step] = state_map.EXECUTE_STEP;
    winnavp_global.HotKeyMap[params.next_tab] = state_map.SELECT_NEXT_TAB;
    winnavp_global.HotKeyMap[params.toggle_standby] = state_map.TOGGLE_STANDBY;
    winnavp_global.HotKeyMap[params.copy_link] = state_map.COPY_LINK;
    winnavp_global.HotKeyMap[params.share_email] = state_map.SHARE_EMAIL;
    winnavp_global.HotKeyMap[params.start_default] = state_map.START_DEFAULT;
    winnavp_global.HotKeyMap[params.show_da_help] = state_map.SHOW_DA_HELP;
    winnavp_global.HotKeyMap[params.request_content] = state_map.REQUEST_CONTENT;
    winnavp_global.HotKeyMap[params.search_content] = state_map.SEARCH_CONTENT;
    winnavp_global.HotKeyMap[params.show_hidden_elems] = state_map.SHOW_HIDDEN_ELEMS;
    winnavp_global.HotKeyMap[params.toggle_side_bar] = state_map.TOGGLE_SIDE_BAR;
    winnavp_global.HotKeyMap[params.start_group] = state_map.START_GROUP;
    winnavp_global.HotKeyMap[params.maximize_trainer] = state_map.MAXIMIZE_TRAINER;
}

MacroSet.prototype.start_unit = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "start_unit", params, c.global_params);
    
    is_rtl = IsRTL(c.user_header.language);
    language = c.user_header.language;
        
    pc.Check("uid", "TEXT", "");
    pc.Check("object_info", "ENUM", "fh_onelem");
    pc.Check("position", "POSITION");
    pc.Check("source", "TEXT", "");
    pc.Check("bubblestyle_d", "SHELF", "white_island");
    pc.Check("show_highlight", "BOOL_0_1", "undefined");
    pc.Check("mini_bubble_style", "SHELF", "");
    pc.Check("bmain_win_style", "SHELF", "navi_style");

    c.global_params.bubblestyle_d = params.bubblestyle_d;
    c.defaults.bubblestyle_d = params.bubblestyle_d;
    c.defaults.mini_bubble_style = params.mini_bubble_style;

    winnavp_ca.Init(params, c.global_params, false);
    winnavp_state.Clear();
}

MacroSet.prototype.process_start_unit = function(c, params) {

    var pc = new CAParamChecker(c.defaults, "process_start_unit", params, c.global_params);

    is_rtl = IsRTL(c.user_header.language);
        
    pc.Check("uid", "TEXT", "");
    pc.Check("position", "POSITION");
    pc.Check("source", "TEXT", "");
    pc.Check("bubblestyle_d", "SHELF", "white_island");
    pc.Check("start_from_arbitrary", "BOOL_0_1");
    pc.Check("focus_step", "BOOL_0_1", true);
    pc.Check("restricted_mode", "BOOL_0_1", false);
    pc.Check("light_mode", "BOOL_0_1", false);
    pc.Check("show_highlight", "BOOL_0_1", "undefined");
    pc.Check("bmain_win_style", "SHELF", "navi_style");
    pc.Check("bmain_position", "POSITION", {'left':450, 'top':65});
    pc.Check("bmain_size", "POSITION", {'width':304, 'height':320});
    pc.Check("bmain_alignment", "ENUM", "free");
    pc.Check("end_message", "HTML", "");
    pc.Check("end_message", "HTML", "");
    pc.Check("mini_bubble_style", "SHELF", "");
    pc.Check("object_info", "ENUM", "fh_onelem");
    pc.Check("show_end_window", "BOOL_0_1", true);
    winnavp_global.LightMode = (params.light_mode != 0);

    c.global_params.bubblestyle_d = params.bubblestyle_d;
    c.defaults.bubblestyle_d = params.bubblestyle_d;
    c.defaults.mini_bubble_style = params.mini_bubble_style;
    
    c.global_params.focus_step = params.focus_step;
    c.defaults.focus_step = params.focus_step;
    c.global_params.restricted_mode = params.restricted_mode;
    c.defaults.restricted_mode = params.restricted_mode;

    winnavp_player.sim_src = params.source;

    winnavp_ca.Init(params, c.global_params, true);
    winnavp_ca.CreateProcessEnd(pc, params);
    
    winnavp_player.arbitrary_start = params.start_from_arbitrary;
    
    winnavp_state.Clear();
}

MacroSet.prototype.end_unit = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "end_unit", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("end_message", "HTML", "");

    winnavp_ca.CreateProcessEnd(pc, params);
}

MacroSet.prototype.application_context = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "start_unit", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("display_name", "TEXT", "");
    pc.Check("executable", "TEXT", "");
    pc.Check("source", "TEXT", "");
    pc.Check("sc_config_header", "TXT_TEXT_LONG", "");
    
    if (params.executable != "") {
        
        var execs = [params.executable];
        if (params.executable.indexOf(";") != -1) {
            execs = params.executable.split(';');
        }
        
        var app = winnavp_player.GetApplications().Find(execs[0]);

        if (app == null) {
            app = new winnavp_Application();
            app.uid = params.uid;
            app.display_name = params.display_name;
            
            app.executables = winnavp_player.GetCompatibleExecs(execs);
           
            winnavp_player.GetApplications().Insert(app);
        } else {
            if (winnavp_ca.process_oriented) {
                app.display_name = params.display_name; //used in warning dialog only
            }
        }

        var headers = extract_headers(params.sc_config_header, null, Project);
        winnavp_player.PreloadHeaders(headers);

        if (winnavp_global.LightMode) {
            headers[QUICK_RECORDING] = QUICK_RECORDING_TEMPL;
        }
        for (config_file in headers) {
            if (!app.FindConfiguration(headers[config_file])) {
                app.InsertConfiguration(headers[config_file]);
            }
            
            for (var i = 0; i < execs.length; i++) {
                if (!profile_map[execs[i]]) {
                    profile_map[execs[i]] = {};
                }
                profile_map[execs[i]][config_file] = headers[config_file];
            }
        }
        
        curr_app = app;
    }
}

MacroSet.prototype.context_assistant_include = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "start_unit", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("project_id", "LINK", "");
    if (params.project_id != "") {
        var uid = params.project_id.match(/(project!\w+):?/);

        if (uid && uid.length > 1) {
            var e = load_resource(_W(uid[1] + ":entity.txt"));
            if (e && e.sub_type == "pa") {
                return;
            }
            include_navigation(uid[1], c);
        }
    }

    curr_screen = null;
}

MacroSet.prototype.define_target = function(c, params) {

    var pc = new CAParamChecker(c.defaults, "define_target", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("target_name", "TEXT", "");
    pc.Check("reference", "TEXT_SHORT", "");
    pc.Check("config_file", "TEXT", "");
    pc.Check("dump_page", "TEXT", "");
    pc.Check("executable", "TEXT", "");
    pc.Check("key", "TEXT_SHORT", "");
    pc.Check("subkey", "BOOL_0_1", false);
    pc.Check("win_rect", "POSSIZE");
    pc.Check("form_on", "BOOL_0_1", false);

    var left = params.win_rect.left - 0;
    var top = params.win_rect.top - 0;
    var right = left + params.win_rect.width;
    var bottom = top + params.win_rect.height;

    curr_screen = new winnavp_Navigationstop();

    curr_screen.dump_page = params.dump_page;
    curr_screen.caption = params.target_name;
    curr_screen.uid = ctx_nsuid;
    curr_screen.muid = params.uid;
    curr_screen.sim_link = params.reference;
    curr_screen.process_id = process_id;
    curr_screen.config_file = params.config_file;
    curr_screen.key = params.key;
    curr_screen.subkey = (params.subkey ? 1 : 0);
    curr_screen.win_rect = CreateRect(left, top, right, bottom);
    curr_screen.ActivateFormMode = params.form_on;
    
    if (profile_map[params.executable]) {
        var header = profile_map[params.executable][params.config_file];

        if (header == undefined) {
            header = profile_map[params.executable]["DEFAULT"]; //legacy projects
        }
        
        if (!header && winnavp_global.LightMode) {
             header = QUICK_RECORDING_TEMPL;
        }
        
        winnavp_player.GetApplications().InsertNS(curr_screen, params.executable, header);
    }
    
    if (!in_step) {
        curr_screen.prj_type = CONTEXT_ASSISTANT;
        winnavp_ca.EndStep();
    } else {
        curr_screen.prj_type = PROCESS_ASSISTANT;
        curr_screen.ConsiderLayer = true;
    }
    
    winnavp_ca.InsertScreen(last_step_id, curr_screen, params.executable);
    if (curr_screen.ActivateFormMode) {
        Form.push(curr_screen);
    }

    process_id = "*";
    in_step = false;
}

function set_playback_mode_(curr_object, params) {
    curr_object.playback_mode = NO_LAYER_MODE;
    
    if (params.focus_step && params.restricted_mode) {
        curr_object.playback_mode = FOCUS_LAYER_RESTRICTED_MODE;
    } else if (params.focus_step) {
        curr_object.playback_mode = FOCUS_LAYER_MODE;
    } else if (params.restricted_mode) {
        curr_object.playback_mode = RESTRICTED_MODE;
    }
}

MacroSet.prototype.target_specializer = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "target_specializer", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("text_d", "TEXT", "");
    pc.Check("match_value", "BOOL_0_1", false);
    pc.Check("disqualifier", "BOOL_0_1", false);
    pc.Check("element_type", "TEXT", "");
    pc.Check("click_pos", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");

    var tar_specializer = new winnavp_TargetSpecializer();

    tar_specializer.uid = params.uid;
    tar_specializer.fieldname = params.fieldname;
    tar_specializer.value = params.text_d;
    tar_specializer.match_value = (params.match_value ? 1 : 0);
    tar_specializer.disqualifier = (params.disqualifier ? 1 : 0);
    tar_specializer.element_type = params.element_type;
    tar_specializer.click_pos = {x:params.click_pos.left - 0, y:params.click_pos.top - 0};
    tar_specializer.path = params.path;

    if (curr_screen != null) curr_screen.AddSpecializer(tar_specializer);
}

MacroSet.prototype.explanation_long = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "explanation_long", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("fieldname", "TEXT", "");
    pc.Check("click_pos_rel", "POSITION");
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("alignment", "ENUM", "free");
    pc.Check("b_closable", "BOOL_0_1", true);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", true);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);

    var is_form_mode = ((curr_screen != null) && (curr_screen.ActivateFormMode == true));
    if (!params.enabled && !is_form_mode) {
        return;
    }
    var expl_type = MACRO_EXPL;
    if (curr_screen != null) {
        expl_type = MACRO_EXPL;
    } else if (curr_app != null) {
        expl_type = APP_EXPL;
    } else {
        expl_type = GLOBAL_EXPL;
    }

    if (curr_screen != null) {
        curr_object = new winnavp_Macro();

        params.fieldname = ca_html_encode(params.fieldname);

        curr_object.comment = params.macro_comment;
        curr_object.uid = params.uid;
        curr_object.objectname = params.uid;
        curr_object.element_type='WINExplainLong';
        curr_object.enabled = (params.enabled ? 1 : 0);
        curr_object.ctrl_dependent = false;
        curr_object.fieldname = params.fieldname;
        curr_object.click_pos = {x:params.click_pos_rel.left - 0, y:params.click_pos_rel.top - 0};

        curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
        curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
        curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
        
        set_playback_mode_(curr_object, params);
        
        curr_object.force_display = (params.force_display ? 1 : 0);

        curr_screen.Macros.push(curr_object);
        if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()) {
            params.action = get_action(params.action, params.trans_action, curr_object.element_type);
            add_transition(c, params);
            last_pa_control = curr_object;
        }
        
        curr_object.bubble = get_bubble(pc, params, expl_type, winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION, last_step_id);    
        curr_object.bubble.rtl = is_rtl;
        curr_object.bubble.closable = winnavp_ca.process_oriented ? true : params.b_closable;
        curr_object.bubble.abort_on_close = winnavp_ca.process_oriented ? true : false;
        curr_object.bubble.external_mini = params.mini_bubble;
        curr_object.bubble.alignment = params.alignment;
        curr_object.bubble.is_explanation = true;
        curr_object.bubble.language = language;
    } else  {
        var bubble = get_bubble(pc, params, expl_type, winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION, last_step_id);    
        bubble.rtl = is_rtl;
        bubble.closable = winnavp_ca.process_oriented ? true : params.b_closable;
        bubble.abort_on_close = winnavp_ca.process_oriented ? true : false;
        bubble.external_mini = params.mini_bubble;
    
        if (curr_app != null) {
            winnavp_ca.InsertAppExplanation(bubble, params, curr_app.executables[0]);
        } else {
            winnavp_ca.InsertFreeExplanation(bubble, params);
        }
    }
}

MacroSet.prototype.click = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "click", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("action", "ENUM", "lclick");
    pc.Check("show_hilight", "BOOL_0_1", false);
    pc.Check("element_type", "TEXT", "");
    pc.Check("click_pos", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("screenshot_rect", "TEXT", "");
    pc.Check("object_info", "ENUM", "global");
    pc.Check("key_desc", "TEXT", "");
    pc.Check("key_name", "TEXT", "");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", false);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);

    params["objname"] = params.uid;

    if (curr_screen != null) {
        curr_object = new winnavp_Macro();

        params.fieldname = ca_html_encode(params.fieldname);

        curr_object.comment = params.macro_comment;
        curr_object.uid = params.uid;
        curr_object.objectname = params.objname;
        curr_object.fieldname = params.fieldname;
        curr_object.show_hilight = params.show_hilight;
        curr_object.enabled = (params.enabled ? 1 : 0);
        curr_object.action = params.action;
        curr_object.hilight_enabled = (params.show_hilight ? 1 : 0);

        curr_object.element_type = params.element_type;
        curr_object.path = params.path;

        curr_object.click_pos = {x: params.click_pos.left - 0, y: params.click_pos.top - 0};
        curr_object.force_display = (params.force_display ? 1 : 0);
        
        curr_object.validatory = (params.macro_validatory ? 1 : 0);
        curr_object.hot_key = params.key_name || get_old_hotkey(params.key_desc);

        curr_object.screenshot_rect = params.screenshot_rect;
        var action_type = winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION;
        
        curr_object.hilight = ca_get_hilight(pc, params, action_type);
        curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
        curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
        curr_object.auto_execute = params.auto_execute;
        curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
        curr_object.optional = (params.optional ? 1 : 0);
        
        if (is_scroll_type(curr_object.element_type)) {
            params.show_next_btn = true;
        }
        
        set_playback_mode_(curr_object, params);
        
        curr_screen.Macros.push(curr_object);

        if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
            params.action = get_action(params.action, params.trans_action, curr_object.element_type);
            add_transition(c, params);
            last_pa_control = curr_object;
        } 
        
        curr_object.bubble = get_bubble(pc, params, null, action_type, last_step_id);
        curr_object.bubble.rtl = is_rtl;
        curr_object.bubble.language = language;
        curr_object.bubble.external_mini = params.mini_bubble;
        if (winnavp_ca.process_oriented) {
            curr_object.bubble.closable = true;
            curr_object.bubble.abort_on_close = true;
        }
        
        winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
    }
}

MacroSet.prototype.active_area = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "active_area", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("action", "ENUM", "lclick");
    pc.Check("area", "POSSIZE");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("show_hilight", "BOOL_0_1", false);
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", false);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);

    params["objname"] = params.uid;

    var left = params.area.left - 0;
    var top = params.area.top - 0;
    var right = left + params.area.width;
    var bottom = top + params.area.height;

    curr_object = new winnavp_Macro();

    params.fieldname = ca_html_encode(params.fieldname);

    curr_object.comment = params.macro_comment;
    curr_object.uid = params.uid;
    curr_object.objectname = params.objname;
    curr_object.show_hilight = params.show_hilight;
    curr_object.rect = CreateRect(left, top, right, bottom);
    curr_object.enabled = (params.enabled ? 1 : 0);
    curr_object.hilight_enabled = (params.show_hilight ? 1 : 0);
    curr_object.element_type = 'WINActiveArea';
    curr_object.force_display = (params.force_display ? 1 : 0);
    curr_object.ctrl_dependent = false;
    curr_object.action = params.action;
    var action_type = winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION;
    
    curr_object.hilight = ca_get_hilight(pc, params, action_type);
    curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
    curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
    curr_object.auto_execute = params.auto_execute;
    curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
    curr_object.optional = (params.optional ? 1 : 0);
    
    set_playback_mode_(curr_object, params);
    
    var rectangle = params.active_area_client_rect;
    if (rectangle) {
        rectangle.right = rectangle.left + rectangle.width;
        rectangle.bottom = rectangle.top + rectangle.height;
        if (rectangle.left >= 0 && rectangle.top >= 0) {
            curr_object.rect = CreateRect(rectangle.left, rectangle.top, rectangle.right, rectangle.bottom);
        }
    }
    
    if (curr_screen != null) curr_screen.Macros.push(curr_object);

    if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
        params.action = get_action(params.action, params.trans_action, curr_object.element_type);
        add_transition(c, params);
        last_pa_control = curr_object;
    }
    
    curr_object.bubble = get_bubble(pc, params, null, action_type, last_step_id);
    curr_object.bubble.rtl = is_rtl;
    curr_object.bubble.language = language;
    curr_object.bubble.external_mini = params.mini_bubble;
    if (winnavp_ca.process_oriented) {
        curr_object.bubble.closable = true;
        curr_object.bubble.abort_on_close = true;
    }
    
    winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
}

MacroSet.prototype.key_press = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "active_area", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("key_desc", "TEXT", "");
    pc.Check("key_name", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("click_pos_rel", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("alignment", "ENUM", "free");
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", true);
    params["objname"] = params.uid;

    curr_object = new winnavp_Macro();

    params.fieldname = ca_html_encode(params.fieldname);

    curr_object.comment = params.macro_comment;
    curr_object.uid = params.uid;
    curr_object.objectname = params.objname;
    curr_object.fieldname = params.key_desc;
    curr_object.enabled = (params.enabled ? 1 : 0);
    curr_object.show_hilight = params.show_hilight;
    curr_object.click_pos = {x:params.click_pos_rel.left - 0, y:params.click_pos_rel.top - 0};
    curr_object.path = params.path;
    curr_object.force_display = (params.force_display ? 1 : 0);
    curr_object.ctrl_dependent = false;
    curr_object.element_type='WINKeyPress';
    curr_object.hot_key = params.key_name || get_old_hotkey(params.key_desc);
    curr_object.auto_execute = params.auto_execute;

    curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
    curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
    curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
    curr_object.optional = (params.optional ? 1 : 0);
    
    if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
        params.action = get_action(params.action, params.trans_action, curr_object.element_type);
        add_transition(c, params);
        last_pa_control = curr_object;
    }
    
    curr_object.bubble = get_bubble(pc, params, KEY_EXPL, winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION, last_step_id);
    curr_object.bubble.rtl = is_rtl;
    curr_object.bubble.language = language;
    curr_object.bubble.external_mini = params.mini_bubble;
    curr_object.bubble.alignment = params.alignment;
    curr_object.bubble.is_explanation = true;
    if (winnavp_ca.process_oriented) {
        curr_object.bubble.closable = true;
        curr_object.bubble.abort_on_close = true;
        winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
    }
    
    if (curr_screen != null) curr_screen.Macros.push(curr_object);
}

MacroSet.prototype.input_text = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "input_text", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("text_d", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("set_value", "BOOL_0_1", false);
    pc.Check("action", "ENUM", "lclick");
    pc.Check("show_hilight", "BOOL_0_1", false);
    pc.Check("element_type", "TEXT", "");
    pc.Check("click_pos", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("screenshot_rect", "TEXT", "");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", true);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);
    pc.Check("condition_pattern", "ENUM", "");
    pc.Check("condition_value", "TEXT", "");
    pc.Check("condition_jump_target", "ENUM", "");
    pc.Check("condition_text", "HTML", "");
    pc.Check("condition_case_sensitive", "BOOL_0_1", false);
    pc.Check("condition_ignore_on_load", "BOOL_0_1", true);
    
    pc.Check("condition_bubblestyle", "SHELF", "");
    pc.Check("condition_highlight_bgr", "COLOR", "" );
    
    params["objname"] = params.uid;

    if (curr_screen != null) {
        curr_object = new winnavp_Macro();

        params.fieldname = ca_html_encode(params.fieldname);

        curr_object.comment = params.macro_comment;
        curr_object.uid = params.uid;
        curr_object.objectname = params.objname;
        curr_object.fieldname = params.fieldname;
        curr_object.value = params.text_d;
        curr_object.init_value = params.text_d;
        curr_object.enabled = (params.enabled ? 1 : 0);
        curr_object.show_hilight = params.show_hilight;
        curr_object.action = params.action;
        curr_object.hilight_enabled = (params.show_hilight ? 1 : 0);
        curr_object.element_type = params.element_type;
        curr_object.click_pos = {x: params.click_pos.left - 0, y: params.click_pos.top - 0};
        curr_object.path = params.path;
        curr_object.force_display = (params.force_display ? 1 : 0);

        curr_object.screenshot_rect = params.screenshot_rect;
        var action_type = winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION;
        
        curr_object.hilight = ca_get_hilight(pc, params, action_type);
        curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;

        curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
        curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
        curr_object.auto_execute = params.auto_execute;
        curr_object.optional = (params.optional ? 1 : 0);
        
        set_playback_mode_(curr_object, params);
        
        curr_screen.Macros.push(curr_object);

        if (params.condition_pattern) {
            curr_object.condition_jump_target = params.condition_jump_target;
        }
        
        if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
            params.action = get_action(params.action, params.trans_action, curr_object.element_type);
            add_transition(c, params);
            last_pa_control = curr_object;
        } 
        
        curr_object.bubble = get_bubble(pc, params, null, action_type, last_step_id);
        curr_object.bubble.rtl = is_rtl;
        curr_object.bubble.language = language;
        curr_object.bubble.external_mini = params.mini_bubble;
        
        if (winnavp_ca.process_oriented) {
            curr_object.bubble.closable = true;
            curr_object.bubble.abort_on_close = true;
        }
        
        winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
        
        if (params.condition_pattern) {
            curr_object.condition_pattern = params.condition_pattern;
            curr_object.condition_value = params.condition_value;
            
            curr_object.condition_text = ca_dgo_resolve(params, params.condition_text, 1);
            curr_object.condition_text = ca_dgo_resolve(null, curr_object.condition_text, 2);
        
            curr_object.condition_case_sensitive = params.condition_case_sensitive;
            
            if (params.condition_bubblestyle) {
                curr_object.condition_bubble_style = (params.condition_bubblestyle == "") ? 
                                                      params.bubblestyle_d : params.condition_bubblestyle;
            }
            if (params.condition_highlight_bgr) {
                curr_object.condition_hilight_color = (params.condition_highlight_bgr == "") ? 
                                                       ca_rgb2bgr(params.g_highlight_bgr) - 0 : 
                                                       ca_rgb2bgr(params.condition_highlight_bgr) - 0;
            }
            curr_object.nxt_btn = params.show_next_btn;
            curr_object.SaveEffectsStyles(curr_object.bubble.style, curr_object.hilight.color, curr_object.bubble.minimized);
            winnavp_ca.InsertCondition(curr_object, curr_screen, params.condition_ignore_on_load);
        }
        
    }
}

MacroSet.prototype.select_single = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "select_single", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("choose_text", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("set_value", "BOOL_0_1", false);
    pc.Check("action", "ENUM", "lclick");
    pc.Check("show_hilight", "BOOL_0_1", false);
    pc.Check("element_type", "TEXT", "");
    pc.Check("click_pos", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("screenshot_rect", "TEXT", "");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", false);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);
    params["objname"] = params.uid;

    if (curr_screen != null) {

        curr_object = new winnavp_Macro();

        params.fieldname = ca_html_encode(params.fieldname);

        curr_object.comment = params.macro_comment;
        curr_object.uid = params.uid;
        curr_object.objectname = params.objname;
        curr_object.fieldname = params.fieldname;
        curr_object.value = params.choose_text;
        curr_object.init_value = params.choose_text;
        curr_object.enabled = (params.enabled ? 1 : 0);
        curr_object.show_hilight = params.show_hilight;
        curr_object.action = params.action;
        curr_object.hilight_enabled = (params.show_hilight ? 1 : 0);
        curr_object.element_type = params.element_type;
        curr_object.click_pos = {x: params.click_pos.left - 0, y: params.click_pos.top - 0};
        curr_object.path = params.path;
        curr_object.force_display = (params.force_display ? 1 : 0);
        curr_object.all_values = params.all_values;

        curr_object.screenshot_rect = params.screenshot_rect;
        var action_type = winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION;
        
        curr_object.hilight = ca_get_hilight(pc, params, action_type);
        curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
        curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
        curr_object.auto_execute = params.auto_execute;
        curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
        curr_object.optional = (params.optional ? 1 : 0);
        
        set_playback_mode_(curr_object, params);
        
        curr_screen.Macros.push(curr_object);

        if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
            params.action = get_action(params.action, params.trans_action, curr_object.element_type);
            add_transition(c, params);
            last_pa_control = curr_object;
        }
        
        curr_object.bubble = get_bubble(pc, params, null, action_type, last_step_id);
        curr_object.bubble.rtl = is_rtl;
        curr_object.bubble.language = language;
	    curr_object.bubble.external_mini = params.mini_bubble;
        
        if (winnavp_ca.process_oriented) {
            curr_object.bubble.closable = true;
            curr_object.bubble.abort_on_close = true;
        }
        
        winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
    }
}

MacroSet.prototype.input_radio = function(c, params) {
    var pc = new CAParamChecker(c.defaults, "input_radio", params, c.global_params);

    pc.Check("uid", "TEXT", "");
    pc.Check("objname", "TEXT", "");
    pc.Check("fieldname", "TEXT", "");
    pc.Check("choose_bool", "TEXT", "");
    pc.Check("enabled", "BOOL_0_1", true);
    pc.Check("set_value", "BOOL_0_1", false);
    pc.Check("action", "ENUM", "lclick");
    pc.Check("show_hilight", "BOOL_0_1", false);
    pc.Check("element_type", "TEXT", "");
    pc.Check("click_pos", "POSITION");
    pc.Check("path", "TEXT_SHORT", "");
    pc.Check("force_display", "BOOL_0_1", false);
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("explanation_d", "HTML", "");
    pc.Check("type", "ENUM", "none");
    pc.Check("screenshot_rect", "TEXT", "");
    pc.Check("auto_execute", "BOOL_0_1", false);
    pc.Check("optional", "BOOL_0_1", false);
    pc.Check("mini_bubble", "ENUM", "none");
    pc.Check("show_next_btn", "BOOL_0_1", false);
    pc.Check("focus_step", "BOOL_0_1", false);
    pc.Check("restricted_mode", "BOOL_0_1", false);

    params["objname"] = params.uid;

    if (curr_screen != null) {
        curr_object = new winnavp_Macro();

        params.fieldname = ca_html_encode(params.fieldname);

        curr_object.comment = params.macro_comment;
        curr_object.uid = params.uid;
        curr_object.objectname = params.objname;
        curr_object.fieldname = params.fieldname;
        curr_object.value = params.choose_bool;
        curr_object.init_value = params.choose_bool;
        curr_object.show_hilight = params.show_hilight;
        curr_object.enabled = (params.enabled ? 1 : 0);
        curr_object.action = params.action;
        curr_object.hilight_enabled = (params.show_hilight ? 1 : 0);
        curr_object.element_type = params.element_type;
        curr_object.click_pos = {x: params.click_pos.left - 0, y: params.click_pos.top - 0};
        curr_object.path = params.path;
        curr_object.force_display = (params.force_display ? 1 : 0);

        curr_object.screenshot_rect = params.screenshot_rect;
        var action_type = winnavp_ca.IsInStep() ? PA_ACTION : CA_ACTION;
        
        curr_object.hilight = ca_get_hilight(pc, params, action_type);
        curr_object.text = ca_dgo_resolve(params, ca_get_explanation(params.type, params.explanation_d), 1);
        curr_object.text = ca_dgo_resolve(null, curr_object.text, 2);
        curr_object.auto_execute = params.auto_execute;
        curr_object.prj_type = winnavp_ca.process_oriented ? PROCESS_ASSISTANT : CONTEXT_ASSISTANT;
        curr_object.optional = (params.optional ? 1 : 0);
        
        set_playback_mode_(curr_object, params);
        
        curr_screen.Macros.push(curr_object);

        if (winnavp_ca.process_oriented && winnavp_ca.IsInStep()){
            params.action = get_action(params.action, params.trans_action, curr_object.element_type);
            add_transition(c, params);
            last_pa_control = curr_object;
        }
        
        curr_object.bubble = get_bubble(pc, params, null, action_type, last_step_id);
        curr_object.bubble.rtl = is_rtl;
        curr_object.bubble.language = language;
        curr_object.bubble.external_mini = params.mini_bubble;
        if (winnavp_ca.process_oriented) {
            curr_object.bubble.closable = true;
            curr_object.bubble.abort_on_close = true;
        }
        
        winnavp_ca.InsertControlBehaviours(params, curr_object, curr_screen);
    }
}

MacroSet.prototype.step = function(c, params) {
    in_step = true;
    var pc = new CAParamChecker(c.defaults, "step", params);

    pc.Check("uid", "TEXT", "");
    pc.Check("macro_comment", "TEXT", "");
    pc.Check("name", "TEXT", "");

    var step_id = params.uid;
    last_step_id = step_id;
    var vers = c.user_header.version.split('.');

    if (vers.length > 0 && ((vers[0] - 0) < 9)) {
        step_id = params.name;
    }

    if (ctx_nsindex > 1 && params.name != "") {
        if (!init_step_added) {
            init_step_added = true;
            if (!winnavp_ca.process_start_added) {
                winnavp_state.Insert(step_id);
            }
            winnavp_ca.AddInitStep(step_id);
        }
        process_id = step_id;
        winnavp_ca.AddStep(step_id, params.name);
    }

    if (curr_screen && curr_screen.ActivateFormMode) {
        add_form_transition();
    }
    curr_object = null;
}

function get_action (action, trans_action, element_type) {
    var ret_action = "LClick";
    
    if (trans_action) {
        ret_action = trans_action;
    } else if (is_edit(element_type) || is_dropdown(element_type)) {
        ret_action = "FocusLost";
    } else if (action == "lclick") {
        ret_action = "LClick";
    } else if (action == "ldblclick") {
        ret_action = "LDblClick";
    } else if (action == "rclick") {
        ret_action = "RClick";
    } else if (action == "rdblclick") {
        ret_action = "RDblClick";
    }
    
    return ret_action;
}

function add_transition (c, params) {
    var pc = new CAParamChecker(c.defaults, "transition", params);

    pc.Check("step_name1", "TEXT", "");
    pc.Check("step_name2", "TEXT", "");
    pc.Check("step_name3", "TEXT", "");
    pc.Check("step_name4", "TEXT", "");
    pc.Check("action", "ENUM", "");

    curr_object.objectname = ca_js_encode(curr_object.objectname);
    
    if (!curr_object) return;

    if (params.step_name1 != "" && params.action && params.action != "") {
   
        var states = "";
		if (params.condition_pattern && params.condition_jump_target != "") {
			var jump_target = curr_object.condition_jump_target;
			states = states + jump_target + "{;}";
			curr_object.next_steps = [];
			curr_object.next_steps.push(jump_target);
		} else {
			step1 = ca_js_encode(params.step_name1);
			states = states + step1 + "{;}";
			curr_object.next_steps = [];
			curr_object.next_steps.push(params.step_name1);

			if (params.step_name2 != "") {
				states = states + ca_js_encode(params.step_name2) + "{;}";
				curr_object.next_steps.push(params.step_name2);
			}
			if (params.step_name3 != "") {
				states = states + ca_js_encode(params.step_name3) + "{;}";
				curr_object.next_steps.push(params.step_name3);
			}
			if (params.step_name4 != "") {
				states = states + ca_js_encode(params.step_name4) + "{;}";
				curr_object.next_steps.push(params.step_name4);
			}
		}
        
        var add_transition_beh = !is_scroll_type(curr_object.element_type);
        
        if (curr_screen.ActivateFormMode) {
            ctx_transition.uid = params.uid;
            ctx_transition.action = params.action;
            ctx_transition.states = states;
            ctx_transition.last_step = false;
            add_transition_beh = false;
        }

        if (add_transition_beh) {
            winnavp_ca.InsertTransitionBehaviour(curr_object, curr_screen, params.uid, params.action, states);
        }
        
        if (!curr_screen.ActivateFormMode) {
            winnavp_ca.AddBehaviourForNoObj(curr_object);
        }
        
        winnavp_ca.AddTransition(last_step_id, curr_object);
        
    } else if (params.step_name1 == "") {
        if (curr_screen.ActivateFormMode) {
            ctx_transition.last_step = true;
        } else {
            winnavp_ca.AddLastStepBehaviour(curr_object, curr_screen);
            winnavp_ca.AddTransition(last_step_id, curr_object);
        }
    }
}

function add_form_transition() {
    if (ctx_transition.last_step) {
        winnavp_ca.AddLastStepBehaviour(curr_object, curr_screen);
        winnavp_ca.AddTransition(last_step_id, curr_object);
    } else {
        winnavp_ca.InsertTransitionBehaviour(curr_object, curr_screen, ctx_transition.uid, ctx_transition.action, ctx_transition.states);
        winnavp_ca.AddBehaviourForNoObj(curr_object);
    }
}


MacroSet.prototype.Loaded = function() {
    if (winnavp_ca.process_oriented) {
        if (!winnavp_ca.process_start_added) {
            winnavp_player.start_from_arbitrary = winnavp_player.arbitrary_start;
        }
        
        if (last_pa_control != null) {
            winnavp_ca.AddBehaviourForNoObj(last_pa_control);
        }
        
        if (curr_screen && curr_screen.ActivateFormMode) {
            add_form_transition();
        }
    }
    load_form_mode_();
    winnavp_ca.Loaded();
    winnavp_ca.InitBranches();
    winnavp_ca.InitStepList();
    
    curr_object = null;
    curr_screen = null;
    curr_app = null;
}

function load_form_mode_() {
    for (var i = 0; i < Form.length; i++) {
        winnavp_ca.InsertFormBubble(Form[i]);
    }
    
    Form = [];
}

function get_old_hotkey(key_desc) {
    if (!key_desc) {
        return key_desc;
    }
    key_desc = key_desc.toString();
    key_desc = key_desc.toLowerCase();
    key_desc = key_desc.replace("+", " ");
    return key_desc;
}
