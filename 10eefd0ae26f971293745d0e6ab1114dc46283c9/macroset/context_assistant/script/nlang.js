#use(config.js)

var lang_map = {};

var nav_lang_tbl = null;
var nav_lang_tbl_cur = '';

lang_map["de-DE"] = {

imgCaption:     "Abbildung",

paramMonth:     "Monat",
paramJanuary:   "Januar",
paramFebruary:  "Februar",
paramMarch:     "März",
paramApril:     "April",
paramMay:       "Mai",
paramJune:      "Juni",
paramJuly:      "Juli",
paramAugust:    "August",
paramSeptember: "September",
paramOctober:   "Oktober",
paramNovember:  "November",
paramDecember:  "Dezember",

}

lang_map["en-US"] = {

imgCaption:     "Figure",

paramMonth:     "Month",
paramJanuary:   "January",
paramFebruary:  "February",
paramMarch:     "March",
paramApril:     "April",
paramMay:       "May",
paramJune:      "June",
paramJuly:      "July",
paramAugust:    "August",
paramSeptember: "September",
paramOctober:   "October",
paramNovember:  "November",
paramDecember:  "December",
}

lang_map["en-GB"] = {

imgCaption:     "Figure",

paramMonth:     "Month",
paramJanuary:   "January",
paramFebruary:  "February",
paramMarch:     "March",
paramApril:     "April",
paramMay:       "May",
paramJune:      "June",
paramJuly:      "July",
paramAugust:    "August",
paramSeptember: "September",
paramOctober:   "October",
paramNovember:  "November",
paramDecember:  "December",
}

lang_map["sv-SE"] = {

imgCaption:     "Figure",

}

lang_map["fi"] = {

imgCaption:     "Figure",

}

lang_map["fr-FR"] = {

imgCaption:     "Figure",

}

lang_map["it-IT"] = {

imgCaption:     "Figure",

}

lang_map["hi"] = {

imgCaption:     "िफगर",

}

function fix_nav_lang_item(it) {
    var res = it;

    /*
    res = res.replace(/&auml;/g, "⠩;
    res = res.replace(/&ouml;/g, "�
    res = res.replace(/&uuml;/g, "�    res = res.replace(/&Auml;/g, "¢);
    res = res.replace(/&Ouml;/g, "Ԣ);
    res = res.replace(/&Uuml;/g, "ڢ);
    res = res.replace(/&szlig;/g, "ݢ);
    */

    res = res.replace( "[B_NAME_ICON]", " <b>$#{fieldname}&nbsp;$I{fieldicon}</b> "  );
    res = res.replace( "[B_HOTKEY]"   , " <b>$#{key_desc}</b> "                        );
    res = res.replace( "[B_ICON_NAME]", " <b>$#{fieldname}&nbsp;$I{fieldicon}</b> ");
    res = res.replace( "[B_TCODE]"    , " <b>$#{transaction_code}</b> "              );
    res = res.replace( "[B_KEY]"      , " <b>$#{key_desc}</b> "                      );
    res = res.replace( "[B_INPUT]"    , " <b>$#{text_d}</b> "                        );
    res = res.replace( "[INPUT]"    , " $#{text_d} "                        );
    res = res.replace( "[B_SELECTED]" , " <b>$#{choose_text}</b> "                   );
    res = res.replace( "[NAME]"       , " $#{fieldname} "                            );
    res = res.replace( "[B_NAME]"     , " <b>$#{fieldname}</b> "                     );
    res = res.replace( "[ICON]"       , " $I{fieldicon} "                           );
    res = res.replace( "[B_ICON]"     , " $I{fieldicon} "                           );
    res = res.replace( /  +/g         , " "                                         );
    res = res.replace( "} ."          , "}."                                        );
    res = res.replace( " \."           , "."                                        );

    return res;
}

function fix_nav_lang_tbl() {
    var it;
    for (it in nav_lang_tbl) {
        nav_lang_tbl[it] = fix_nav_lang_item(nav_lang_tbl[it]);
    }
}


function ca_select_project_language() {
    if (Project.Language == '') {
        Project.Language = def_lang;
        
        if (!set_project_language()) {
            return false;
        }
    }
    
    def_lang =  Project.Language;
    
    ca_logger.Log(1, "Project language:" + Project.Language, "", ""); 
    load_nav_project_language();
    ca_logger.DeWrite(2);
    return true;
}


function load_nav_project_language() {
    ca_logger.Write(2, "load_project_language", "", "");
    var ok = true;
    if (nav_lang_tbl_cur != Project.Language) {
        
        nav_lang_tbl = Project.LoadDictionary();
        if (nav_lang_tbl == null) {
            ca_logger.Log(1, "Language Table not loaded", "", "");
        }
        
        nav_lang_tbl_cur = Project.Language;
        fix_nav_lang_tbl();
        ca_logger.Log(1, "Loaded " + Project.Language, "", "");
    }
    ca_logger.DeWrite(2);
    return ok;
}

function load_nav_language(prj_) {
	var prj;
	if(prj_ !== undefined) {
		prj = prj_;
    }
    if (!prj) prj = Project;
    if (!prj) return false;

    if (nav_lang_tbl_cur != prj.Language) {
        nav_lang_tbl = ObjectMapFromCSV(prj.GetWAProject());
        if (nav_lang_tbl == null) {
            log("Language Table not loaded");
        }
        
        nav_lang_tbl_cur = prj.Language;
        fix_nav_lang_tbl();
        log("Loaded " + prj.Language);
    }
    return true;
}

function set_project_language() {
    var cfgdlg = CreateDialog();
    cfgdlg.SetCaption(Translate('capRecordSettings'));

    cfgdlg.AddParam("rec_lang", ParamType_LANGUAGE, Translate('paramReRecordLanguage'));
    cfgdlg.SetParam("rec_lang", Project.Language);

    if (cfgdlg.Show()) {
        Project.Language = cfgdlg.GetParam("rec_lang");
        WriteStringSetting("record_language", Project.Language);
        return true;
    }
    return false;   
}

function trans(name) {
    ca_select_project_language();

    var cur_map = lang_map[Project.Language];
    
    if (typeof(cur_map) != 'object') {
        cur_map = lang_map["de-DE"];
        ca_logger.Log(3, "cur_map undefined, reverting to 'de-DE'", "", "");
    }

    if (typeof(cur_map[name]) == 'string') {
        return cur_map[name];
    } else if (typeof(lang_map["de-DE"][name]) == 'string') {
        return lang_map["de-DE"][name];
    } else {
        return "[" + name + "]";
    }
}


