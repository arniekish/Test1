#use(nautomation_constants.js)
#use(automation_helpers.js)
#use(nmacro_updates.js)
#use(ca_Logger.js)

var ca_logger = new ca_Logger();

function check_insert_startunit() {
    ca_logger.Write(3, "check_insert_startunit", "", "");
    if (Project.NumTourstops() == 0) {
        Project.AddTourstop(Translate("start_topic"), Tourstop_HIDE_NOJUMP);
        var mac = Project.CreateMacro("start_unit");
        mac.SetParam("macro_comment", Translate("context_help"));
        Project.InsertEventAfter(mac);
        ca_logger.DeWrite(3);
        return true;
    }
    ca_logger.DeWrite(3);
    return false;
}

function get_ns_from_mac(mac) {
    ca_logger.Write(3, "get_ns_from_mac", "", "");
    if (mac == null) {
        alert("Macro is null");
        ca_logger.DeWrite(3);
        return;
    }

    var uid = "";
    if (mac.HasParam("uid")) {
        uid = mac.GetParam("uid");
    }

    if (uid != "") {
        for (var i = 0; i < Project.NumTourstops(); i++) {
            var ns = Project.GetTourstop(i);
            var my_mac = ns.NextMacro();

            while (my_mac != null) {

                if (my_mac.HasParam("uid") && my_mac.GetParam("uid") == uid) {
                    ca_logger.DeWrite(3);
                    return ns;
                }

                my_mac = ns.NextMacro(my_mac.TourPosition());
            }
        }
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_target_from_ns(ns) {
    ca_logger.Write(3, "get_target_from_ns", "", "");
    if (ns == null) {
        alert("NavigationStop is null");
        ca_logger.DeWrite(3);
        return;
    }

    var my_mac = ns.NextMacro();

    while (my_mac != null) {

        if (my_mac.Template() == "define_target") {
            ca_logger.DeWrite(3);
            return my_mac;
        }

        my_mac = ns.NextMacro(my_mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_transition_from_ns(ns) {
    ca_logger.Write(3, "get_transition_from_ns", "", "");
    if (ns == null) {
        alert("NavigationStop is null");
        ca_logger.DeWrite(3);
        return;
    }

    var my_mac = ns.NextMacro();

    while (my_mac != null) {

        if (my_mac.Template() == "transition") {
            ca_logger.DeWrite(3);
            return my_mac;
        }

        my_mac = ns.NextMacro(my_mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_process_start_unit() {
    ca_logger.Write(3, "get_process_start_unit", "", "");
    if (Project.NumTourstops() == 0) return null;

    var ts = Project.GetTourstop(0);
    var mac = ts.NextMacro();

    while (mac != null) {
        if (mac.Template() == "process_start_unit") {
            ca_logger.DeWrite(3);
            return mac;
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_start_unit() {
    ca_logger.Write(3, "get_start_unit", "", "");
    if (Project.NumTourstops() == 0) return null;

    var ts = Project.GetTourstop(0);
    var mac = ts.NextMacro();

    while (mac != null) {
        if (mac.Template() == "start_unit") {
            ca_logger.DeWrite(3);
            return mac;
        }
        mac = ts.NextMacro(mac.TourPosition());
    }
    ca_logger.DeWrite(3);
    return null;
}

function get_app_context(executable) {
    ca_logger.Write(3, "replace_pgkey_attr", "", "");
    for (var i = 0; i < Project.NumTourstops(); i++) {
        var ns = Project.GetTourstop(i);

        if (ns != null) {
            var mac = ns.NextMacro();

            while (mac != null) {

                if (mac.Template() == "application_context" && mac.HasParam("executable")) {
                    var mac_exes = mac.GetParam("executable");

                    if (mac_exes.indexOf(executable) != -1) {
                        ca_logger.DeWrite(3);
                        return mac;
                    }
                }

                mac = ns.NextMacro(mac.TourPosition());
            }
        }
    }
    ca_logger.DeWrite(3);
    return null;
}

function set_appcontextns_current() {
    ca_logger.Write(3, "set_appcontextns_current", "", "");
    check_insert_startunit();

    var sec_is_appns = false;

    if (Project.NumTourstops() >= 2 ) {
        var ns = Project.GetTourstop(1);

        if (ns != null) {
            var mac = ns.NextMacro();

            while (mac != null) {
                if (mac.Template() == "application_context") {
                    sec_is_appns = true;
                }

                mac = ns.NextMacro(mac.TourPosition());
            }
        }
    }

    if (sec_is_appns) {
        Project.SetCurrentTourstop(1);
    } else {
        Project.SetCurrentTourstop(0);
        Project.AddTourstop(Translate("application_contexts"));
    }
    ca_logger.DeWrite(3);
}

function set_define_target_current() {
    var ns = Project.GetTourstop(Project.CurrentTourstop());

    if (!ns) {
        return;
    }
    
    var mac = ns.NextMacro();
    while (mac != null) {
        if (mac.Template() == "define_target") {
            mac.SetCurrent();
            return;
        }
        mac = ns.NextMacro(mac.TourPosition());
    }
}

function get_target_def(caption, pagekey, executable) {
    ca_logger.Write(3, "get_target_def", "", "");
    var res = {cancel: false, tarmac: null, nsindex: -1};
    var tarmacs = get_matching_scrs(pagekey, executable);

    if (tarmacs.length > 0) {
        if (tarmacs.length == 1) {
            res.tarmac = tarmacs[0].m;
            res.nsindex = tarmacs[0].ind;
            return res;
        }
        var dlg = CreateWizard();

        dlg.AddWizardButton(OK_BTN, Translate("wizOk"));
        dlg.AddWizardButton(CANCEL_BTN, Translate("wizCancel"));

        dlg.SetCaption(Translate(caption));
        dlg.SetHeaderText(Translate("existing_scrs_in_prj"), LEFT);
        dlg.AddParam("define_target", ParamType_ENUM, Translate("define_target"));

        for (var i = 0; i < tarmacs.length; i++) {
            dlg.AddEnumValue("define_target", i, tarmacs[i].m.GetParam("target_name"));
        }

        dlg.SetParam("define_target", 0);
        dlg.SetParamProperty("define_target", "width", "160");

        dlg.SetSize(400, 150);

        if (dlg.Show() == OK_BTN) {
            var i = dlg.GetParam("define_target");

            res.tarmac = tarmacs[i].m;
            res.nsindex = tarmacs[i].ind;
        } else {
            res.cancel = true;
        }
    } else if(Project.CurrentTourstop() == 0) {
        Project.SetCurrentTourstop(1);
    }
    ca_logger.DeWrite(3);
    return res;
}

function get_matching_scrs(page_key, executable) {
    var scrs = [];
    for (var i = 0; i < Project.NumTourstops(); i++) {
        var ns = Project.GetTourstop(i);

        if (ns != null) {
            var mac = ns.NextMacro();
            var is_pa = false;
            var prev_mac = null;
            while (mac != null) {
                is_pa = (prev_mac != null && prev_mac.Template() == "step");
                if (mac.Template() == "define_target" && mac.HasParam("executable") && mac.HasParam("key")) {
                    if (!is_pa && executable == mac.GetParam("executable") &&
                        page_key == mac.GetParam("key")) {
                            scrs.push({m:mac, ind:i});
                    }
                }
                prev_mac = mac;
                mac = ns.NextMacro(mac.TourPosition());
            }
        }
    }
    return scrs;
}

function get_prev_mac(index) {
    var ns = Project.GetTourstop(index - 1);
    if (ns != null) {
        return ns.NextMacro();
    }
    return null;
}