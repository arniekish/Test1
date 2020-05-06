#use(automation_helpers.js)
#use(nmacro_updates.js)

function nav_create_explain(params) {
    var mac = Project.CreateMacro("explanation");

    nav_update_explain(mac, params);

    return mac;
}

function nav_create_explain_l(params) {
    var mac = Project.CreateMacro("explanation_long");

    nav_update_explain_l(mac, params);

    return mac;
}

function nav_create_edit(params) {
    var mac = Project.CreateMacro("input_text");

    nav_update_edit(mac, params);

    return mac;
}


function nav_create_mledit(params) {
    var mac = Project.CreateMacro("input_text");

    nav_update_mledit(mac, params);

    return mac;
}

function nav_create_checkbox(params) {
    var mac = Project.CreateMacro("input_radio");

    nav_update_checkbox(mac, params);

    return mac;
}

function nav_create_selectbox(params) {
    var mac = Project.CreateMacro("select_single");

    nav_update_selectbox(mac, params);

    return mac;
}

function nav_create_tpcd_click(params) {
    var mac = Project.CreateMacro("click");

    nav_update_tpcd_click(mac, params);

    return mac;
}

function nav_create_click(params) {
    var mac = Project.CreateMacro("click");

    nav_update_click(mac, params);

    return mac;
}

function nav_create_tab_click(params) {
    var mac = Project.CreateMacro("click");

    nav_update_tab_click(mac, params);

    return mac;
}

function nav_create_asset(screen) {
    var mac = Project.CreateMacro("new_page");

    nav_update_asset(mac, screen, false);

    return mac;
}

function nav_create_text_click(params) {
    var mac = Project.CreateMacro("click");

    nav_update_text_click(mac, params);

    return mac;
}

function nav_create_keypress(params) {
    var mac = Project.CreateMacro("key_press");

    nav_update_keypress(mac, params);

    return mac;
}
