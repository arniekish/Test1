function Screen(wins) {
    this.windows_stack_ = wins;
}

Screen.prototype.current_screen_ = null;
Screen.prototype.filename_ = "";
Screen.prototype.windows_stack_ = null;

Screen.prototype.Init = function() {
    this.current_screen_ = null;
    this.filename_ = ""; 
}

Screen.prototype.GetScreenDump = function() {
    return this.current_screen_;
}

Screen.prototype.SetScreenDump = function(sc) {
    this.current_screen_ = sc;
}

Screen.prototype.SetResource = function(res) {
    
    if (this.current_screen_ != null) {
        this.current_screen_.SetResource(res);
    }
}

Screen.prototype.Save = function() {
    ca_logger.Write(3, "Screen::Save", "", "");  
    if (this.current_screen_ != null) {
        this.current_screen_.Save();
    }
    ca_logger.DeWrite(3); 
}

Screen.prototype.CaptureScreen = function(path, configfile) {
    this.Init();
    this.current_screen_ = this.windows_stack_.CaptureCurrentScreen(configfile);
}

Screen.prototype.Width = function() {
    
    if (this.current_screen_ != null) {
        return this.current_screen_.width;
    }
    
    return 0;
}

Screen.prototype.Height = function() {
    
    if (this.current_screen_ != null) {
        return this.current_screen_.height;
    }
    
    return 0;
}

Screen.prototype.Title = function() {
    
    if (this.current_screen_ != null) {
        return this.current_screen_.title;
    }
    
    return "";
}

Screen.prototype.ScreenRect = function() {
    ca_logger.Write(3, "Screen::ScreenRect", "", "");
    if (this.current_screen_ != null) {
        ca_logger.DeWrite(3); 
        return this.current_screen_.ScreenRect();
    }
    ca_logger.DeWrite(3); 
    return null;
}

Screen.prototype.Filename = function() {
    return this.filename_;
}
