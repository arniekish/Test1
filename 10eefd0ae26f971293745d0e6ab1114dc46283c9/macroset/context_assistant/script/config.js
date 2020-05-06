
var debug = false;

//--------------------------------- record ------------------------------
/*
// HtmlDumper global settings

// alle links auf abgezogenen Seiten werden durch den angegebenen Text ersetzt
// (standard: "javascript:void(0);" -> link ist stillgelegt)
HtmlDump2.link_subst = "javascript:void(0);";

// alle Javascripte aus abgezogenen Seiten entfernen
// (standard: true)
HtmlDump2.remove_js = true;

// nur relevant wenn remove_js = false
// onload-handler aus abgezogenen Seiten entfernen
// will man javascripte auf der Seite aktiv lassen so ist es oft zumindest
// ratsam, den onload-handler zu entfernen
// (standard: true)
HtmlDump2.remove_onload = true;

// OBJECT und EMBED-Tags aus Seiten entfernen
// (standard: true)
HtmlDump2.remove_object = true;

// Seite auch dann abziehen, wenn dieselbe URL fuer das aktuelle Projekt 
// schon einmal abgezogen wurde
// ist erforderlich bei allen Applikatioen, bei denen sich die URL der
// Seite nie aendert, z.B. SAP
// (standard: true)
HtmlDump2.force = true;

// Falls die aktuelle URL schon einmal abgezogen wurde, wird die abgezogene
// Seite ueberschrieben
// (standard: false)
HtmlDump2.overwrite = false;

// alle targets aus abgezogenen Seiten entfernen
// (standard: true)
HtmlDump2.remove_target = true;
*/
/*
// Automatische Aufnahme:

// die Demo-Bubble wird in der Naehe des betroffenen Elements positioniert
// ist false eingestellt, wird die Demo-Bubble in der linken unteren Ecke 
// positioniert
// (standard: true)
var demo_bubble_at_element = true;

// bei Eingabefeldern wird der eingetragene Wert im Bubble-Text angegeben
// anderenfalls steht in der Demo-Bubble nur "Es wird das Feld xyz ausgefuellt"
// (standard: false)
var demo_text_with_value = false;

// Windows Recording
// es wird ein extra tourstop samt macro generiert, der die Aktivierung des
// Eingabefeldes bei SAP abbildet (fuer Dokumentation oft unerwuenscht)
// (standard: false)
var insert_inactive_edit_macros = false;

// Standard-Einstellung fuer die Bestaetigung von Eingabefeldern
// laesst sich nach der Aufnahme im Editor jedoch aendern
// (standard: .._tab = true, rest = false -> Eingabefelder muessen mit tab
// bestaetigt werden) 
var winrec_input_confirm_tab = true;
var winrec_input_confirm_enter = false;
var winrec_input_confirm_button = false;

// Voreinstellung fuer die Dauer der Bubbles im Demo-Modus
var default_bubble_duration = ReadIntSetting("DefaultBubbleDuration", 3);

// winapp rerecording
var rerecord_interactive = true;
var rerecord_new_release = false;
var rerecord_search_factor = 10;
var rerecord_wait = 2000;

var rerecord_replace_only_unmodified = true;

// SPANs, DIVs, die bei der Webaufnahme nicht erkannt werden, werden
// automatisch wie Links behandelt, d.h mit click bedient
var webrec_span_is_link = ReadBoolSetting("WebrecSpanIsLink", false);
var webrec_div_is_link = ReadBoolSetting("WebrecDivIsLink", false);

// Web-Aufnahme: es wird so aufgezeichnet, dass alle Aktionen im selben
// Fenster erscheinen. Muss auf false gesetzt werden, damit eine Multi-Window-Tour
// entsteht
var use_only_window0 = ReadBoolSetting("use_only_window0", true);

// Web-Aufnahme: Wenn ein Scrollbar betaetigt wird, werden entsprechende
// Scorllmakros erzeugt. Wenn record_scroll=false wird gescrollt, jedoch
// keine Makros erzeugt
var record_scroll = ReadBoolSetting("webrec_record_scroll", true);
var record_scroll = true;


// -------------------------- Dokumentation  ------------------------------

// Bubble-Texte anzeigen (sonst nur Screenshots)
// (standard: true)
var doc_show_bubble_text = true; // use null to ask user

// an den Markierungen auf dem Screenshot steht eine 
// Zahl, damit der entsprechende Bubbletext zugeordnet werden kann
// bei false werden nur die Markierungen auf dem Screenshot gezeichnet
// (standard: true)
var doc_rects_with_index = true;

// Beschreibung und Displayname aus dem Project-Explorer werden in die
// Dokumentation uebernommen
// (standard: true)
var doc_include_project_details = true;

// Ueberschriften-Levels fuer Einzel-Dokumente fangen beim angegebenen Wert
// an. Werte groesser 1 sind sinnvoll, falls spaeter ein Master-Dokument
// generiert werden soll, welches die hoehern Levels fuer Gruppen- & 
// Projekt-Namen verwenden soll
// (standard: 2 - ausreichend fuer Masterdokumente ohne Untergruppen)
var doc_singledoc_headinglevel = 2;

// Seiten-Ueberschriften werden aus dem Tourstop-Titel generiert
// (standard: false)
var doc_heading_from_tourstop = false;

// Seiten-Ueberschriften werden aus dem Titel von "Neue Seite"-Makros generiert
// (standard: true)
var doc_heading_from_new_page = true;


// Bilder erhalten eine Unterschrift ("Abbildung xyz")
// (standard: true)
var doc_images_with_caption = true;

// bei true: Die Bildunterschriften werden aus dem Seiten-Titel 
// im Neue-Seite-Makro erzeugt (statt "Abbildung xyz")
// erfordert doc_images_with_caption = true
var image_caption_from_new_page = true;

// Der Erste Tourstop (normalerweise Start oder Init) wird fuer 
// die Dokumentation ignoriert
// (standard: true)
var doc_ignore_tourstop_start = true;

// Global Skalierung der Screenshots bei der Dokumentationserzeugung
// wird mit der Skalierung im Makro (default jetzt 100, frueher 60) multipliziert
var doc_image_scale = 60;


var doc_global_index_counter = ReadBoolSetting("global_index_counter", false);

//var marker_color = 0x0000ff;
var marker_rect_radius = 0;
var marker_offset = 2;

// Staerke der Markierung auf Screenshots in Pixel
// (standard: 4)
var marker_border = ReadIntSetting("marker_border", 4);

// Farbe der Markierung auf Screenshots, ACHTUNG: BBGGRR-Format
// (standard: 0x0000FF -> rot)
var marker_color = ReadIntSetting("marker_color", 0x0000ff);

// Farbe fuer die Zahlen an den Markierungen
// (standard: 0x000000 -> schwarz)
var marker_text_color = ReadIntSetting("marker_text_color", 0x000000);

// Hintergrundfarbe fuer die Zahlen an Markierungen
// (standard: 0x80ffff -> hellgelb)
var marker_bg_color = ReadIntSetting("marker_bg_color", 0x80ffff);

// Fuer die Dokumentation wird der Text aus den Demo-Bubbles verwendet
// (standard: true)
var doc_use_demo_bubbles = ReadBoolSetting("use_demo_bubbles", true);
// Fuer die Dokumentation wird der Text aus den Uebungs-Bubbles verwendet
// (standard: false)
// sind beide auf true gesetzt werden Demo- und Uebungstext verwendet
var doc_use_practice_bubbles = ReadBoolSetting("use_practice_bubbles", false); // set to true to use texts from the practice bubbles

// fuer Dok.-Pfeil-Macro
// Laenge der Pfeilspitze
// (standard: 30)
var arrow_len = 30;
// Breite der Pfeilspitze
// (standard: 20)
var arrow_width = 20;

// rechte Einrueckung fuer Hinweis-Macros
// (standard: 0.0)
var hinweis_left_indent   = 0.0;

// Rahmen/Rand-Staerke fuer Doku-Screenshots
// (wird bei Aufnahme ausgewertet, kann nachtraeglich geaendert werden)
// (standard: 0)
var ScreenshotBorder = 0;

// Farbe des Screenshot-Rahmens, wird bei Doku-Generierung ausgewertet
// (standard: 0xffffff -> weiss)
var ScBorderColor = 0xffffff;
*/

// Fuer Hinweis-Makros verwendete Icons
var hinweis_image = {
}

// Standard-Sprache - zuletzt verwendete Sprache
var def_lang = ReadStringSetting("record_language", UILang());
