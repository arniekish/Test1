#use(config.js)
#use(nlang.js)

#use(nhmap.js)
#use(automation_helpers.js)

#use(ca_Logger.js)

var ok = true;
var last_type = "";
var keep_crop = true;

var ca_logger = new ca_Logger();

function ch_translate_current_project() {
    ca_logger.Write(3, "ch_translate_current_project", "", ""); 
    var dlg = CreateDialog();
    dlg.SetCaption(Translate("autoTranslate"));
    dlg.AddParam("rec_lang", ParamType_LANGUAGE, Translate('paramReRecordLanguage'));
    dlg.SetParam("rec_lang", Project.Language);

    if (dlg.Show()) {
        Project.Language = dlg.GetParam("rec_lang");
        if (!load_nav_project_language()) {
            Project.Language = "de-DE";
        }
    } else {
        return;
    }
    
    ch_translate_project(Project);
    ca_logger.DeWrite(3);
}

function ch_translate_project(project)
{
    ca_logger.Write(3, "ch_translate_project", "", "");
    load_nav_language(project);
    var start_pos = 0;
    var last_window_id = 0;
    
    for (var i = 0; i < project.NumTourstops(); i++) {

        var ts = project.GetTourstop(i);
        ca_logger.Log(2, ts.TourPosition() + ": " + ts.Caption + " (" + ts.Duration() + ")", "", ""); 

        var mac = ts.NextMacro();

        while (ok && mac != null) {
            if (mac.TourPosition() >= start_pos) {
                ca_logger.Log(2, "TRANS:" + mac.TourPosition() + ": " + mac.Template() + " (" + mac.Duration() + ")", "", "");
                // mac.SetCurrent();
                // project.SelectEvent(mac.TourPosition(), true);
                ch_translate_mac(mac, ts, project);
            } else {
                ca_logger.Log(2, "SKIP:" + mac.TourPosition() + ": " + mac.Template() + " (" + mac.Duration() + ")", "", "");
            }
            mac = ts.NextMacro(mac.TourPosition());
        };
    }
    ca_logger.DeWrite(3);
}

function ch_translate_mac(mac, ts, project) {
    ca_logger.Write(3, "ch_translate_mac", "", "");
    if (mac.HasParam("element_type")) {
        var element_type = mac.GetParam("element_type");
        
        if (mac.HasParam("action")) {
            var action = mac.GetParam("action");
            
            if (nhmap[element_type + "::" + action]) {
                element_type = element_type + "::" + action;
            }
        }
        
        var hm = nhmap[element_type];

        if (hm) {
            if (typeof(hm.textkey) == 'string') {
                var infotxt = ch_get_infotxt(element_type);

                if (element_type != "WINComboEdittpcd" // don't override sap transaction
                    && mac.Template() == "input_text")
                {
                    var val = "";
                    if (mac.HasParam("text_d")) {
                       val = mac.GetParam("text_d");
                    }
                    
                    if (val == "") {
                        infotxt = ch_get_infotxt("INPUTclear");
                    } else {
                        infotxt = ch_get_infotxt("INPUTtextplusvalue");
                    }

                    var infotxt2 = ch_input_infotxt(false, false, false);                 

                    infotxt.demo += infotxt2.demo;
                    infotxt.prac += infotxt2.prac;

                } else if (mac.Template() == "input_radio") {
                    
                    var t = mac.GetParam("element_type");
     
                    if (t == "WINRadio") {
                        infotxt = ch_get_infotxt("WINRadio");
                    } else {
                        if (mac.GetParam("choose_bool") == "1") {
                            infotxt = ch_get_infotxt("WINCBChecked");
                        } else {
                            infotxt = ch_get_infotxt("WINCBUnchecked");
                        }
                    }
                }

                //key_desc traslation
                
                if (mac.HasParam("key_desc") && mac.GetParam("key_desc") != "") {
                    infotxt.demo += ch_get_key_infotxt("confirm_hotkey").demo;
                    infotxt.prac += ch_get_key_infotxt("confirm_hotkey").prac;
                }
                
                if (mac.HasParam("explanation_d")) {
                    if (!mac.HasParam("explanation_d_modified") || !mac.GetParam("explanation_d_modified")) {
                        mac.SetParam("explanation_d", infotxt.prac);
                    }
                }
            } else if (typeof(hm.alt_text) == 'string') {
                var element_type = hm.alt_text;
                var hm = nhmap[element_type];
            }
			nav_update_hotkey(mac, project);
        } else {
            ca_logger.Log(2, "No HMAP: " + element_type, "", "");
        }
    } else if (mac.Template() == "key_press") {
        var infotxt = ch_get_key_infotxt("keypress");

        if (mac.HasParam("explanation_d")) {
            if (!mac.HasParam("explanation_d_modified") || !mac.GetParam("explanation_d_modified")) {
                mac.SetParam("explanation_d", infotxt.prac);
            }
        }
		nav_update_hotkey(mac, project);
    }
    ca_logger.DeWrite(3);
}
