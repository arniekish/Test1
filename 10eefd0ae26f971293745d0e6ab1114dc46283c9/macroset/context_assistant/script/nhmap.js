#use(macro_creators.js)

var nhmap = {};

nhmap["WINExplain"] = {
    handler:     nav_create_explain,
    update:      nav_update_explain,
    textkey:    "please_note"
};

nhmap["WINExplainLong"] = {
    handler:     nav_create_explain_l,
    update:      nav_update_explain_l,
    textkey:    "please_note"
};

nhmap["WINEdit"] = {
    handler:     nav_create_edit,
    update:      nav_update_edit,
    click_method:    "lclick",
    manual_rerec: false,
    textkey:    "input_text_value"
};

nhmap["WINMLEdit"] = {
    handler:     nav_create_mledit,
    update:      nav_create_mledit,
    click_method:    "lclick",
    manual_rerec: false,
    textkey:    "input_text_value"
};

nhmap["INPUTclear"] = {
    handler:     nav_create_edit,
    update:      nav_update_edit,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "input_clear_text_value"
};

nhmap["INPUTtclear"] = {
    handler:     nav_create_edit,
    update:      nav_update_edit,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "input_clear_text_value_tpcd"
};

nhmap["INPUTtextplusvalue"] = {
    handler:     nav_create_edit,
    update:      nav_update_edit,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:     "input_text_value",
}

nhmap["WINComboEdittpcd"] = {
    handler:     nav_create_edit,
    update:      nav_update_edit,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "input_text_value_tpcd"
};

nhmap["WINCheckbox"] = {
    handler:     nav_create_checkbox,
    update:      nav_update_checkbox,
    click_method:      "lclick",
    manual_rerec: false,
};
nhmap["WINCBChecked"] = {
    handler:     nav_create_checkbox,
    update:      nav_update_checkbox,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_checkbox_off"
};
nhmap["WINCBUnchecked"] = {
    handler:     nav_create_checkbox,
    update:      nav_update_checkbox,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_checkbox_on"
};

nhmap["WINRadio"] = {
    handler:     nav_create_checkbox,
    update:      nav_update_checkbox,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_select"
};

nhmap["WINListBox"] = {
    handler:     nav_create_selectbox,
    update:      nav_update_selectbox,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "select"
};

nhmap["WINTransCode"] = {
    handler:     nav_create_tpcd_click,
    update:      nav_update_tpcd_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "dblclick_start_transaction"
};

nhmap["WINTransCode::lclick"] = {
    handler:     nav_create_tpcd_click,
    update:      nav_update_tpcd_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "click_mark_transaction"
};

nhmap["WINButtonEnter"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_ok_img"
};

nhmap["WINButtonConfirm"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_ok_img"
};

nhmap["WINButtonSave"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_save_img"
};

nhmap["WINButtonBack"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_back_img"
};

nhmap["WINButtonEnd"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_exit_trans_img"
};

nhmap["WINButtonHelpValue"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_open_value_help_img"
};

nhmap["WINButtonCombo"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_open_selection"
};

nhmap["WINListItem"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "dblclick_select_entry"
};

nhmap["WINListItem::lclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "click_mark_entry"
};

nhmap["WINCBListItem"] = {
    handler:     nav_create_text_click,
    update:      nav_update_list_click,
    click_method:      "lclick",
    manual_rerec: true,
    textkey:    "click_mark_entry_img"
};

nhmap["WINCBCalendarItem"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "lclick",
    manual_rerec: true,
    textkey:    "click_caldr_item_img"
};

nhmap["WINGeneralMenue"] = {
    handler:     nav_create_click,
    update:      nav_update_list_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_menu_select_img"
};

nhmap["WINMenue"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_open_menu_img"
};

nhmap["WINMenueItem"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_menu_select_img"
};

nhmap["WINPageTab"] = {
    handler:     nav_create_tab_click,
    update:      nav_update_tab_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_select_card_img"
};

nhmap["WINPageTab::ldblclick"] = {
    handler:     nav_create_tab_click,
    update:      nav_update_tab_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "dblclick_select_card_img"
};

nhmap["WINTableRow"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_select_line"
};

nhmap["WINTableRow::ldblclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "dblclick_select_line"
};

nhmap["WINInactiveEdit"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_activate_edit"
};

nhmap["WINInactiveEdit::ldblclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "dblclick_activate_edit"
};

nhmap["WINOpenFolderImg"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_open_folder_img"
};
nhmap["WINOpenFolderImg::ldblclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "dblclick_open_folder_img"
};

nhmap["WINOpenFolder"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_open_folder"
};

nhmap["WINOpenFolder::ldblclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "dblclick_open_folder"
};

nhmap["WINCloseFolderImg"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_close_folder_img"
};

nhmap["WINCloseFolder"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_close_folder"
};

nhmap["WINScrollBarHorizontal"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "drag_scroll_hor"
};

nhmap["WINScrollBarVertical"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "drag_scroll_vert"
};

nhmap["WINButtonScroll"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_scroll"
};

nhmap["WINScrollAreaLeft"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_scroll_page_left"
};

nhmap["WINScrollAreaRight"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_scroll_page_right"
};

nhmap["WINScrollAreaUp"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_scroll_page_up"
};
nhmap["WINScrollAreaDown"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_scroll_page_down"
};

nhmap["WINRightMouse"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "rclick",
    manual_rerec: false,
    textkey:    "rclick_context"
};

nhmap["WINTextClick"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_img"
};

nhmap["WINTextClick::ldblclick"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "dblclick_img"
};

nhmap["WINTextClick::drag"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "drag",
    manual_rerec: false,
    textkey:    "drag_img"
};

nhmap["WINTextClick::drop"] = {
    handler:     nav_create_text_click,
    update:      nav_update_text_click,
    click_method:      "drop",
    manual_rerec: false,
    textkey:    "drop_img"
};

nhmap["WINClick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "click_img"
};

nhmap["WINClickToActivate"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "click_img"
};

nhmap["WINComboButtontpcd"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_combobtn_tpcd"
};

nhmap["WINClick::ldblclick"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "ldblclick",
    manual_rerec: false,
    textkey:    "dblclick_img"
};

nhmap["WINClick::drag"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "drag",
    manual_rerec: false,
    textkey:    "drag_img"
};

nhmap["WINClick::drop"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "drop",
    manual_rerec: false,
    textkey:    "drop_img"
};

nhmap["WINKeyPress"] = {
    handler:     nav_create_keypress,
    update:      nav_update_keypress,
    textkey:    "keypress"
};

nhmap["WINButton"] = {
    handler:     nav_create_click,
    update:      nav_update_click,
    click_method:      "lclick",
    manual_rerec: false,
    textkey:    "click_img"
};

nhmap["WINScroll"] = {
    textkey:    "batched_scroll"
};

nhmap["WINScrollWheel"] = {
	handler:     nav_create_explain_l,
	update:      nav_update_explain_l,
	click_method:      "wheel_up",
	manual_rerec: false,
	textkey:    "mouse_wheel_info"
};

nhmap["WINScrollWheel"] = {
    handler:     nav_create_explain_l,
    update:      nav_update_explain_l,
    click_method:      "wheel_down",
    manual_rerec: false,
    textkey:    "mouse_wheel_info"
};