var HOOK_HIGHLEVEL = 1;
var HOOK_LOWLEVEL = 2;

var SA_CHOOSE_APP_MODE  = 2;
var SA_NAVI_MODE = 4;
var SA_BASIC_MODE = 5;
var ANALYZE_POINT_TIMEOUT = 3000;
var GET_PAGEKEY_TIMEOUT = 5000;
var GET_PATH_OBJECTS_TIMEOUT = 10000;
var GET_PATH_OBJECT_TIMEOUT = 3000;
var SET_VALUE_TIMEOUT = 3000;
var GET_VALUE_TIMEOUT = 3000;

var CANCEL_BTN  = 50000;
var NEXT_BTN    = 50001;
var FINISH_BTN  = 50002;
var REC_BEH_BTN = 50003;
var OK_BTN      = 50004;
var EXPL_BTN    = 50005;
var CONTINUE_BTN= 50006;

var HOOK_NORMAL = 1;
var HOOK_INPROC = 2;
var HOOK_OUTOFPROC = 3;

var DIAG_OK       = 0;
var DIAG_IGNORE   = 1;
var DIAG_CANCEL   = 2;
var DIAG_ABORT    = 3;

var DELAY = 500;

var selection_types = {
    TAKES      : 0x00000001,
    MACROLIST  : 0x00000004,
    AUDIORANGE : 0x00000020,
    MACRORANGE : 0x00000040,
    COMBIRANGE : 0x00000070,
    MACROS     : 0x00000002
};

var PASSWORD_CHAR = "******";

var LEFT = 0;
var CENTER = 1;
var RIGHT = 2;

var SUBTYPE_CA  = "ca";
var SUBTYPE_PA  = "pa";

var EMPTY_CONTEXT = 0;
var APPEND_CONTEXT = 1;
var REPLACE_CONTEXT = 2;
var REPLACE_ALL_CTX = 3;
var DELETE_CONTEXT = 4;


var DIRECT_SYNTHESIS = false;

var DELAY = 500;

var IN_PROCESS = 0;
var OUT_OF_PROCESS = 1;

var NONE_STATE = 0;
var STOP_STATE = 1;
var CANCEL_STATE = 2;
var PAUSE_STATE = 3;

var BTN_OK = 5000;
var BTN_CANCEL = 5001;

var NAVI_MODE = -1;

var MATCH         = 0;
var NO_CONTROL    = 1;
var MISMATCH      = 2;
var EXPAINATION   = 3;

var WAIT = 32514; //IDC_WAIT
var CROSS = 32515;//IDC_CROSS

var CANCEL       = 60000;

var black_procs = ["csrss.exe"];

var naction_type  = {
    "GENERAL_ACT"              : 1,
    "MOUSE_ACT"                : 2,
    "KEYBOARD_ACT"             : 3,
    "CONTROL_CLICKED"          : 11,
    "APR_ACT"                  : 13,
    "EFFECT_ADJUSTED_ACT"      : 14
};

var naction_subtype  = {
    "STOP"                  :  1,
    "RECORD"                :  2,
    "PAUSE"                 :  3,
    "CLOSE"                 :  4,
    "CHOOSE_APP"            :  5,
    "OPTIONS"               :  6,
    "TOGGLE_CLICKBLOCK"     :  8,
    "EDIT_INFO"             : 10,
    "RERECORD"              : 15,
    "MINIMIZE"              : 16, 
    "NEW_PAGE"              : 20, 
    "EXPLANATION"           : 21, 
    "EXPLANATION_END"       : 22, 
    "SCREEN_PREVIEW"        : 35,
    "UNDO"                  : 37, 
    "RECORD_CONTROL"        : 40, 
    "SWITCH_BUBBLE_MODE"    : 41, 
    "SHOW_CONTROL"          : 42, 
    "ACCEPT"                : 43, 
    "SKIP"                  : 44, 
    "DELETE"                : 45, 
    "STOP_RECORD_CONTROL"   : 46, 
    "RESET_STATE"           : 49,
    "VIEW_RERECO_QUALITY"   : 50,
    "VIEW_CONTROL_TYPE"     : 51,
    "ADD_GLYPHMAP"          : 52,
    "EDIT_HEADER"           : 53,
    "APP_PROPERTY"          : 54,
    "SHOW_ALL_ODS"          : 55,
    "CHANGE_PROFILE"        : 56,
    "APP_MOVE"              : 57,
    "EDIT_PAGEKEY"          : 58, 
    "TOGGLE_PAUSE"          : 60,
    "ENTER_BUBBLE_EDIT"     : 63,
    "ON_ORIENTATION_UPDATE" : 64
};

var ndescriptor_map = {
    common    : ["none", "#explanation", "#explanation_l", "RightMouse", "ClickToActivate"],
    button    : ["tpcd", "Enter", "Confirm", "Save", "Back", "End",
                 "HelpValue", "ComboButton", "SelectRow", "scrollbutton",
                 "ComboButtontpcd"
                ],
    Checkbox  : [],
    customctl : ["ComboEdittpcd", "tpcd", "ListItem", "ComboBoxListItem", "ComboBoxCalendarItem",
                 "GeneralMenue", "Menue", "ActiveMenueItem", "PageTab",
                 "InactiveEdit", "OpenFolder", "vscrollbar", "hscrollbar",
                 "scrollarealeft", "scrollarearight", "scrollareaup",
                 "scrollareadown", "Text", "CloseFolder", "Enter", "Confirm",
                 "Save", "Back", "End", "HelpValue", "ComboButton", "SelectRow",
                 "scrollbutton", "ComboButtontpcd"
                ],
    ddlistbox : ["ComboEdittpcd"],
    edit      : ["ComboEdittpcd"],
    hrefarea  : ["ComboEdittpcd", "tpcd", "ListItem", "ComboBoxListItem", "ComboBoxCalendarItem",
                 "GeneralMenue", "Menue", "ActiveMenueItem", "PageTab",
                 "InactiveEdit", "OpenFolder", "vscrollbar", "hscrollbar",
                 "scrollarealeft", "scrollarearight", "scrollareaup",
                 "scrollareadown", "Text", "CloseFolder"
                ],
    listbox   : ["ComboEdittpcd"],
    mledit    : ["ComboEdittpcd"],
    radio     : []
};

var ninfo_attributes = {
    "TYPE"             : "type",
    "SUBTYPE"          : "SubType",
    "FIELDNAME"        : "FieldName",
    "STATE"            : "state",
    "VALUE"            : "value",
    "TOOLTIP"          : "Tooltip",
    "PASSWORD"         : "Password",
    "ALLVALUES"        : "AllValues",
    "CURSORHAND"       : "CursorHand",
    "TEXTALIGN"        : "TextAlign",
    "MAXLENGTH"        : "MaxLength",
    "BGCOLOR"          : "color", 
    "BEHAVIOUR"        : "Behaviour", 
    "NOEDITCURSOR"     : "NoEditCursor", 
    "DISABLED"         : "disabled",
    "DIRECT_SYNTHESIS" : "DirectSynth", 
    "HOTKEY"           : "HotKey",
    "ECATT_INFO"       : "EcattInfos",
    "CLIENT_RECT"      : "ClientRect",
    "WEIGHT"           : "Weight"
};

var key_desc_table = {
    "strg" : "ctrl", 
    "umsch" : "shift",
    "bild hoch" : "pgup",
    "bild runt" : "pgdown", 
    "page up" : "pgup", 
    "page down" : "pgdown"
};

var HOTSPOT_HEIGHT = 12;
var HOTSPOT_WIDTH = 10;
var BLUE_COLOR = 0xFFAA0F;

function Properties() {
    this.pairs_ = [];
}

Properties.prototype.pairs_ = [];

Properties.prototype.Add = function(k, v) {
    this.pairs_.push({key : k, value : v});
}

Properties.prototype.Get = function() {
    return this.pairs_;
}


var NProperty = {
    ORDER         : 0, 
    SPIKE_VISIBLE : 1, 
    ORIENTATION   : 2, 
    MOVABLE       : 3, 
    MINIMIZABLE   : 4, 
    MINIMIZED     : 5, 
    EDITABLE      : 6, 
    X             : 7, 
    Y             : 8, 
    WIDTH         : 9, 
    HEIGHT        : 10, 
    PARENT_WINDOW : 11, 
    TEXT          : 12, 
    STYLE         : 13, 
    BOTH_VISIBLE  : 14, 
    SCRIPT        : 15, 
    ELEVATE_ORDER : 16, 
    BORDER        : 17, 
    COLOR         : 18, 
    ANIMSTEPS     : 19, 
    AUTOHIDE      : 20, 
    ANIMATION     : 21, 
    GAP           : 22,
    SHAPE_WIDTH   : 23, 
    SHAPE_HEIGHT  : 24, 
    SHAPE_X       : 25, 
    SHAPE_Y       : 26,
    RTL           : 32,
    EDITING_MODE  : 37, 
    EDIT_ENABLED  : 38,
    SET_TIMER     : 39,
    SET_EDIT_MODE : 40,
    LANGUAGE      : 48
};

var ColorMap = {
    "WINButton"         : 0x0000ff, // Red

    "WINGeneralMenue"   : 0x00ff00, //Green
    "WINMenueItem"      : 0x00ff00, //Green
    "WINMenue"          : 0x00ff00, //Green

    "WINPageTab"        : 0xff0000, // Blue

    "WINListBox"        : 0x0099FF, //blue2 //Brown 0x996600

    "WINClick"          : 0xFFFF00, // Cyan

    "WINEdit"           : 0x00ffff, // Yellow
    "WINMLEdit"         : 0x00ffff, // Yellow
    "WINComboEdittpcd"  : 0x00ffff, // Yellow

    "WINActiveArea"     : 0xFF00FF, //pink(red)

    "WINCBChecked"      : 0x6600FF, //Mauve2(bleu)
    "WINCBUnchecked"    : 0x6600FF,

    "WINRadio"          : 0xFF9966, // orange
    "WINButtonCombo"    : 0xCCCC00, // olive

    "WINCBListItem"    : 0xFF99FF // rose

};
var ColorMap2 = {
    "button"         : 0x0000ff, // Red
    "hrefarea"   : 0x00ff00, //Green
    "edit"      : 0xff0000 //Green
};

var ActionQueueType = {
    "AUTO_ENGINE_QUEUE" : 0,
    "NAV_PLAYER_QUEUE"  : 1
};

var ActionQueueType = {
    "AUTO_ENGINE_QUEUE" : 0,
    "NAV_PLAYER_QUEUE"  : 1
};

var FOREGROUND_DELAY = 200;

var D_SUCCESS = 0;
var D_ERROR = 1;
var D_WARN = 2;
var D_ABORT = 3;

var RECORD_BTN_ID = 1;

var NEVER = 0;
var ANY   = 2;

var BOTTOM    = 0;
var TOP       = 1;
var MINIMIZED = 2;

var LISTBOX_COMBO = 3;
var CLASSIC_COMBO = 4;
var NO_COMBO = 5;

var APPLY_CHANGES = 518;
var DISCARD_CHANGES = 519;
