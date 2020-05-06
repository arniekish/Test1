#use(automation_helpers.js)
#use(navi_keymap.js)

function keymap_handler() {
}

keymap_handler.prototype.initialize_keymap = function() {
    ca_logger.Write(3, "keymap_handler::initialize_keymap", "", "");
    var key_map = KeyboardSettings();
    for (var key in key_map) {
        var map = navi_key_map[key];
        if (map != undefined) {
            map.hotkey = key_map[key];
        }
    }
    ca_logger.DeWrite(3);
}

keymap_handler.prototype.hotkey_validate = function(action) {
    ca_logger.Write(3, "keymap_handler::validate", "", "");
    var keyname = KeyUtils.LocalizedName(action.key_code, action.shift, action.ctrl,action.alt);
    keyname = keyname.replace(/\s+/g,'+');
    var action_keys = keyname.split('+');
    action_keys.sort();
    for (var key in navi_key_map) {
        if (navi_key_map[key] != undefined) {
            var hotkey_keys = navi_key_map[key].hotkey.split('+');
            hotkey_keys.sort();
            if (validate_navi_hot_key_(action_keys, hotkey_keys)) {
                ca_logger.DeWrite(3);
                return navi_key_map[key].handler(key, this);
            }
        }
    }
    ca_logger.DeWrite(3);
    return false;
}

keymap_handler.prototype.handle_hotkey = function(arg, handler) {
    ca_logger.Write(3, "keymap_handler::handle_hotkey", "", "");
    switch (arg) {
        case "ID_INSERT_REC_EXPL":  return handler.hotkey_explanation();
                                    

        case "ID_PAUSE_REC"      :  return handler.hotkey_pause();

        case "ID_EXEC_MOUSE"     :  return handler.hotkey_toggle_mouse_execution();

        case "ID_UNDO_LAST_REC"  :  return handler.hotkey_undo();

        case "ID_STOP_RECORD"    :  return handler.hotkey_stop();
        
        case "ID_CHOOSE_APP_REC" :  return handler.hotkey_choose_application();
    }
    return false;
}

keymap_handler.prototype.hotkey_explanation = function() {
}

keymap_handler.prototype.hotkey_pause = function() {
}

keymap_handler.prototype.hotkey_toggle_mouse_execution = function() {
}

keymap_handler.prototype.hotkey_undo = function() {
}

keymap_handler.prototype.hotkey_stop = function() {
}

keymap_handler.prototype.hotkey_choose_application = function() {
}
