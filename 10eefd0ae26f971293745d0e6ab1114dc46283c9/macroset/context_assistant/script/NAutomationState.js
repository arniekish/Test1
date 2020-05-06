#use(nlang.js)
#use(automation_helpers.js)
#use(ca_Logger.js)

// status win colors
var color_neutral = "gray";
var color_yellow  = "yellow";
var color_green   = "green";
var color_red     = "red";

// status win icons
var img_start           =  0;
var img_pause           =  1;
var img_rec             =  0;
var img_wait            =  6;
var img_choose          = 38;

var BAR_PROFILES       = 1004;
var ca_logger = new ca_Logger();
 
var nautomation_bar_buttons = {
    "STOP"               : "winapp.Stop",
    "RECORD"             : "winapp.Record",
    "CHOOSE_APPL"        : "winapp.ChooseAppl",
    "PAUSE"              : "winapp.Pause",
    "RERECORD"           : "winapp.ReRecord",
    "OPTIONS"            : "winapp.Settings",
    "EDIT_INFO"          : "winapp.EditInfo",
    "CLICK_BLOCKED"      : "winapp.BlockClicks",
    "NEW_PAGE"           : "winapp.NewPage",
    "EXPLANATION"        : "winapp.Explanation",
    "SCREEN_PREVIEW"     : "winapp.ScreenPreview",
    "RECORD_CONTROL"     : "winapp.RecordControl",
    "UNDO"               : "winapp.Undo",
    "SHOW_CONTROL"       : "winapp.ShowControl",
    "ACCEPT"             : "winapp.Accept",
    "SKIP"               : "winapp.Skip",
    "DELETE"             : "winapp.Delete",   
    "VIEW_RERECO_QUALITY": "winapp.ViewReRecognitionQuality",
    "VIEW_CONTROL_TYPE"  : "winapp.ViewControlType",
    "ADD_GLYPHMAP"       : "winapp.AddGlyphMap",
    "EDIT_HEADER"        : "winapp.EditHeader", 
    "COMMENT"            : "winapp.Comment",
    "APP_PROPERTY"       : "winapp.AppProperty",
    "SHOW_ALL_ODS"       : "winapp.ShowAllODs",
    "EDIT_PAGEKEY"       : "winapp.EditPageKey"
};

function all_buttons(bar, enable) {

    for (var i in nautomation_bar_buttons) {
        bar.EnableButton(nautomation_bar_buttons[i], enable);
    }
}

var nautomation_states = {
    "RECORD::INACTIVE"     : { icon: img_pause, bgColor: color_neutral,
                              text: function (info, wins) {
                                var txt = Translate('AutoBarReady');

                                if (wins != null && wins.IsEmpty()) {
                                    txt = txt + " - " + Translate('AutoBarChooseAppReq');
                                }

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);

                                bar.EnableButton(nautomation_bar_buttons["OPTIONS"], true);
                                if (wins != null && !wins.IsEmpty()) {
                                    bar.EnableButton(nautomation_bar_buttons["RECORD"], true);
                                }
                                bar.EnableButton(nautomation_bar_buttons["CHOOSE_APPL"], true);
                                bar.EnableButton(nautomation_bar_buttons["CLICK_BLOCKED"], true);
                              }
                            },
    "CHOOSE_APP"          : { icon: img_choose, bgColor: color_neutral,
                              text: function (info, wins) {
                                var txt = Translate('AutoBarChooseApp');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);
                              }
                            },
    "DIAGNOSIS"          : { icon: img_choose, bgColor: color_neutral,
                              text: function (info, wins) {
                                var txt = Translate('AutoBarDiagnosis');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);
                              }
                            },
    "NO_RECOGNITION"     : { icon: img_choose, bgColor: color_neutral, 
                              text: function (info, wins) {
                                var txt = Translate('AutoBarNoRecognition');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);
                              }
                            },
    "RECORD"              : { icon: img_rec, bgColor: color_green, 
                                text: function (info, wins) {
                                
                                    if (IsProducerRTL()) {
                                        var txt = info_to_string(info) + Translate('AutoBarRecord');
                                    } else {
                                        var txt = Translate('AutoBarRecord') + info_to_string(info);
                                    }

                                    return txt;
                                },
                                en_buttons: function (bar, info, wins) {
                                    all_buttons(bar, false);

                                    bar.EnableButton(nautomation_bar_buttons["STOP"], true);
                                    bar.EnableButton(nautomation_bar_buttons["RECORD"], true);
                                    bar.EnableButton(nautomation_bar_buttons["CLICK_BLOCKED"], true);
                                    bar.EnableButton(nautomation_bar_buttons["EXPLANATION"], true);
                                    bar.EnableButton(nautomation_bar_buttons["UNDO"], info != null);
                                }
                            },
    "BUSY"                : { icon: img_wait, bgColor: color_red, 
                              text: function (info, wins) {
                                var txt = Translate('AutoBarBusy');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);
                                if (bar.IsMinimized()) {
                                    bar.EnableButton(nautomation_bar_buttons["RECORD"], true);
                                    bar.EnableButton(nautomation_bar_buttons["STOP"], true);
                                }
                              }
                            },
    "PAUSE"               : { icon: img_pause, bgColor: color_neutral,
                                text: function (info, wins) {
                                    if (IsProducerRTL()) {
                                        var txt = info_to_string(info) + Translate('AutoBarPause');
                                    } else {
                                        var txt = Translate('AutoBarPause') + info_to_string(info);
                                    }

                                    return txt;
                                },
                                en_buttons: function (bar, info, wins) {
                                    all_buttons(bar, false);

                                    bar.EnableButton(nautomation_bar_buttons["STOP"], true);
                                    bar.EnableButton(nautomation_bar_buttons["RECORD"], true);
                                    bar.EnableButton(nautomation_bar_buttons["CHOOSE_APPL"], true);
                                    bar.EnableButton(nautomation_bar_buttons["EXPLANATION"], false);
                                    bar.EnableButton(nautomation_bar_buttons["UNDO"], info != null);
                                }
                            },
    "WYSIWYG_MODE" : { icon: img_rec, bgColor: color_green,
                              text: function (info, wins) {
                                var txt = Translate('AutoBarReRecManualHotspot');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                    bar.EnableButton(nautomation_bar_buttons["RECORD"], true);
                              }
                            },
    "INSERT_EXPLANATION" : { icon: img_rec, bgColor: color_green,
                              text: function (info, wins) {
                                var txt = Translate('AutoBarExplanation');

                                return txt;
                              },
                              en_buttons: function (bar, info, wins) {
                                all_buttons(bar, false);
                              }
                            }
};

function NAutomationState(bar, mode, windows_stack) {
    this.init_(bar, mode, windows_stack);
}

NAutomationState.prototype.bar_ = null;
NAutomationState.prototype.mode_ = "";
NAutomationState.prototype.windows_stack_ = null;
NAutomationState.prototype.curr_info_ = null;
NAutomationState.prototype.state_stack_ = [];

NAutomationState.prototype.init_ = function(bar, mode, windows_stack) {
    this.bar_ = bar;
    this.mode_ = mode;
    this.windows_stack_ = windows_stack;
}

NAutomationState.prototype.SetState = function(state) {
    this.state_stack_.push(state);
    this.set_automation_state_();

}

NAutomationState.prototype.SetInfo = function(info) {
    this.curr_info_ = info;

    this.set_automation_state_();
}

NAutomationState.prototype.CurrState = function() {
    if (this.state_stack_.length > 0) {
        return this.state_stack_[this.state_stack_.length -1];
    }

    return "INACTIVE";
}

NAutomationState.prototype.SetPrevState = function() {
    this.state_stack_.pop();

    this.set_automation_state_();
}

NAutomationState.prototype.set_bar_status_ = function(icon, text, bgcolor) {
    this.bar_.status_icon     = icon;
    this.bar_.status_bg_color = bgcolor;
    this.bar_.status_text = text;

    this.bar_.UpdateStatus();
}

NAutomationState.prototype.SetText = function(text) {
    this.bar_.status_text = text;
    this.bar_.UpdateStatus();
}


NAutomationState.prototype.set_automation_state_ = function () {
    ca_logger.Write(3, "NAutomationState::set_automation_state_", "", "");
    if (this.state_stack_.length > 0) {
        ca_logger.Log(2, "NAutomationState::set_automation_state_ - " + this.CurrState(), "", "");

        var state = nautomation_states[this.mode_ + "::" + this.CurrState()];

        if (state == null) {
            state = nautomation_states[this.CurrState()];
        }

        if (state != null) {
            this.set_bar_status_(state.icon, state.text(this.curr_info_, this.windows_stack_), state.bgColor);

            state.en_buttons(this.bar_, this.curr_info_, this.windows_stack_);
        }
    }
    ca_logger.DeWrite(3);
}
