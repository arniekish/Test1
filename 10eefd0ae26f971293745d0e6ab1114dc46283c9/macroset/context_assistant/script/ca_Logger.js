function ca_Logger() {
    if (ExpertFeature("NavPerfLog")) {
        this.perflog = true;
    }
}

ca_Logger.prototype.density = 0;
ca_Logger.prototype.timing = false;
ca_Logger.prototype.indent = true;

ca_Logger.prototype.indent_elem = "--";
ca_Logger.prototype.call_stack_ = [];

ca_Logger.prototype.perflog = false;
ca_Logger.prototype.caller_id = {id : "", time : 0};

ca_Logger.prototype.Write = function(density, call_id, call_subid, txt) {
    
    if (density <= this.density) {
        var log_txt = "";
        var cid = "";
        
        if (this.indent) {
            for (var  i = 0; i < this.call_stack_.length; i++) {
                cid += this.indent_elem;
            }
        }
        
        cid += call_id;
        
        if (call_subid != "") {
            cid += (" [" + call_subid + "]");
        }
        
        log_txt += cid;
        
        if (txt != "") {
            log_txt += (" - " + txt);
        }
        
        log(log_txt);
        
        var time = 0;
        if (this.timing) {
            var date = new Date();
            time = date.getTime();
        }
        
        this.call_stack_.push({call_name: cid, call_time: time});
        
        return true;
    }
    
    return false;
}

ca_Logger.prototype.DeWrite = function(density) {
    
    if (density <= this.density) {
        
        if (this.call_stack_.length > 0) {
            var log_txt = this.call_stack_[this.call_stack_.length-1].call_name;
            
            if (this.timing) {
                var date = new Date();
                log_txt += (" (" + (date.getTime() - this.call_stack_[this.call_stack_.length-1].call_time) + "ms)");
            }
            
            log(log_txt);
            
            this.call_stack_.pop();
        }
    }
}

ca_Logger.prototype.Log = function(density, call_id, call_subid, txt) {
    
    if (this.Write(density, call_id, call_subid, txt)) {
        this.call_stack_.pop();
    }
}
    
ca_Logger.prototype.Reset = function() {
    this.call_stack_ = [];
}

ca_Logger.prototype.StartPerfTime = function(id, time) {
    if(typeof(time)==='undefined') {
        time = GetTickCount();
    }
    
    this.caller_id.id = id;
    this.caller_id.time = time;
}

ca_Logger.prototype.StopPerfTime = function() {
    if (this.perflog) {
        log("**** " + this.caller_id.id + " = " + (GetTickCount() - this.caller_id.time));
    }
}