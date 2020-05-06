#use(config.js)
#use(nlang.js)
#use(nhmap.js)
#use(automation_functions.js)
#use(json.js)
#use(macroset!context_assistant:util.js)
/*
function merge_new_pages() {
    auto_merge();
}

function merge_selected_new_pages() {
    selected_merge();
}*/

function
mac_as_js(mac) {
    var params = {};
    for (var i = 0; i < mac.NumParams(); i++) {
        if (mac.ParamType(i) == ParamType_TEXT_SINGLE ||
            mac.ParamType(i) == ParamType_TEXT_SHORT ||
            mac.ParamType(i) == ParamType_TEXT_LONG ||
            mac.ParamType(i) == ParamType_HTML ||
            mac.ParamType(i) == ParamType_ENUM ||
            mac.ParamType(i) == ParamType_IMAGE ||
            mac.ParamType(i) == ParamType_FILENAME ||
            mac.ParamType(i) == ParamType_BOOL_0_1 ||
            mac.ParamType(i) == ParamType_BOOL_TRUE_FALSE ||
            mac.ParamType(i) == ParamType_BOOL_YES_NO)
        {
            params[mac.ParamName(i)] = mac.GetParam(i);
            ca_logger.Log(2, i + ": " + mac.ParamName(i) + ' = ' + mac.GetParam(i), "", "");
        }
    }
    return params;
}


function url_encode(s) {
    s = s.replace(/ /g, '+');
    return s;
}

function html_encode(s) {
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/</g, '&lt;');
    return s;
}

function get_value(pname, params) {
    var res = pname in params ? params[pname] : "???";
    
    return res;
}
    
function onafterload() {
    if (!get_process_start_unit()) {
        return;
    } 
     
    var params = ["step_name1", "step_name2", "step_name3", "step_name4"];
    var step_map = {};
    
    for (var i = 0; i < Project.NumTourstops(); i++) {
        var ns = Project.GetTourstop(i);
        var mac = ns.NextMacro();
        
        while (mac != null) {
            if (mac.Template() == "step") {
                step_map[mac.GetParam("name")] = mac.GetParam("uid");
            }
            mac = ns.NextMacro(mac.TourPosition());
        }
    }
    var first = true;
    var update = false;
    
    for (var i = 0; i < Project.NumTourstops(); i++) {
        var ns = Project.GetTourstop(i);
        var mac = ns.NextMacro();
        
        while (mac != null) {
            if (mac.HasParam("step_name1")) {
                var prefix = mac.GetParam("step_name1");

                if (first && prefix.length >= 4 && prefix.substr(0, 4) == "MAC_") {
                    return; // already converted project
                } else if (prefix.length > 0) {
                    first = false;
                }
                
                for (var k = 0; k < params.length; k++) {
                    var step_name = mac.GetParam(params[k]);
                    if (step_name != "") {
                        var uid = step_map[step_name];
                        if (uid != "" && uid != undefined) {
                            mac.SetParam(params[k], uid);
                            update = true;
                        }
                    }
                }
            }
            mac = ns.NextMacro(mac.TourPosition());
        }
    }
    
    if (update) {
        Project.SaveProject();
    }
}

function onbeforesave() {
    if (!Project || Project.NumTourstops() == 0) {
        return;
    }
    var ts = Project.GetTourstop(0);
    if (!ts) {
        return;
    }
    var mac = ts.NextMacro();
    if (!mac) {
        return;
    }
    Project.Subtype = (mac.Template() == "process_start_unit") ? SUBTYPE_PA : SUBTYPE_CA;
    save_context_info();
    sync_runtime_profiles_();
}

function sync_runtime_profiles_() {
    var headers = extract_header_map();
    var hashes = [];

    for (var header_name in headers) {
        var header_hash = headers[header_name];
        if (IsHeaderHash(header_hash)) {
            hashes.push(header_hash);
        }
    }

    SyncRuntimeProfiles(hashes);
}

function save_context_info() {
    if (!ExpertFeature("MasterDA")) {
        Project.ContextInfo = "";
        return;
    }
    
    var obj = {};
    var headers = extract_header_map();
    var used_headers = {};
    var exes = {};
    var num_ts = Project.NumTourstops();
    
    for (var i = 0; i < num_ts; i++) {
        var ts = Project.GetTourstop(i);
        var mac = ts.NextMacro();

        while (mac != null) {
            if (mac.Template() == "define_target" && !mac.GetParam("exclude_from_da")) {
                var executable = extract_exe(mac);
                var exe_obj = exes[executable];
                if (!exe_obj) {
                    exe_obj = {};
                }
                
                var config_obj = exe_obj[mac.GetParam("config_file")];
                if (!config_obj) {
                    config_obj = {};
                }
                
                if (insert_page_key(config_obj, mac.GetParam("key"), ts.Name)) {
                    var header_name = mac.GetParam("config_file");
                    exe_obj[header_name] = config_obj;
                    exes[executable] = exe_obj;
                    used_headers[header_name] = true;
                }
            }
            mac = ts.NextMacro(mac.TourPosition());
        }
    }
    
    function is_empty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    if (!is_empty(exes)) {
        obj["executables"] = exes;
    }
    
    var hashes = [];
    for (var header_name in headers) {
        if (used_headers[header_name]) {
            if (!obj["headers"]) {
                obj["headers"] = {};
            }
            var hdr = headers[header_name];
            var header_hash;

            if (IsHeaderHash(hdr)) {
                header_hash = hdr;
            } else {
                header_hash = CreateRuntimeProfile(hdr, header_name);
                hashes.push(header_hash);
            }

            obj["headers"][header_name] = header_hash;
        }
    }

    SyncRuntimeProfiles(hashes);
    
    Project.ContextInfo = JSON.stringify(obj);
}

function extract_exe(mac) {
    var exe = mac.GetParam("executable");
    var app_mac = get_app_context(exe);
    if (!app_mac) {
        return exe;
    }
    var executable = app_mac.GetParam("executable");
    var exes = executable.split(";");
    exes.sort();
    return exes.join(";");
}


function insert_page_key(obj, page_key, ts_uid) {
    if (!obj["pagekeys"]) {
        obj["pagekeys"] = [];
    }
    
    if (!page_key) { return false; }
    //remove spaces
    var xml_node = XmlFromString(page_key);
    if (xml_node) {
        page_key = XmlToWire(xml_node);
        
        if (page_key.indexOf('PageAtt') == -1) {
            return false;
        }
    }
    
    if (push_unique(obj["pagekeys"], page_key)) {
		
		if (!obj["ts_uids"]) {
			obj["ts_uids"] = [];
		}
	
		obj["ts_uids"].push(ts_uid);
	}
    
    return true;
}

function push_unique(arr, item) {
    if (arr && arr.indexOf(item) == -1) {
        arr.push(item);
		return true;
    }
	return false;
}

function extract_header_map() {
    var ct_map = {};
    if (Project.NumTourstops() < 2 ) {
        return ct_map;
    }    

    var ts = Project.GetTourstop(1);
    var mac = ts ? ts.NextMacro() : null;

    while (mac != null) {
        if (mac.Template() == "application_context") {
            var profiles_txt = mac.GetParam("sc_config_header"); 
            var ret_map = extract_headers(profiles_txt, mac.GetParam("executable"), Project);

            for (var key in ret_map){
                if (ret_map.hasOwnProperty(key)){
                    ct_map[key] = ret_map[key];
                }
            }
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    return ct_map;
}