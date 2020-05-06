HilightEffect.prototype.type = "hilight";
HilightEffect.prototype.order = 2; //ORDER_BOTTOM;
HilightEffect.prototype.htype = "frame"; //"underline"
HilightEffect.prototype.border = 3;
HilightEffect.prototype.color = 0x0FAAFF;// dark Red|(Green<<8))|(Blue<<16)
HilightEffect.prototype.animsteps = 0;
HilightEffect.prototype.autohide = false;
HilightEffect.prototype.handle_ = -1;
HilightEffect.prototype.rect_ = null;
HilightEffect.prototype.inflate = 0;
HilightEffect.prototype.effect_manager = null;

function HilightEffect(e_manager) {
    if (e_manager != undefined) {
        this.effect_manager = e_manager;
    } else {
        this.effect_manager = effect_manager; //global one for the apr
    }
}


HilightEffect.prototype.cleanup_ = function() {
    this.border = 2;
    this.color = 0x0FAAFF;// dark Red|(Green<<8))|(Blue<<16)
    this.animsteps = 0;
    this.autohide = false;
    this.handle_ = -1;
    this.rect_ = null;
    this.inflate = 0;
}

HilightEffect.prototype.Cleanup = function() {
    this.cleanup_();
}

HilightEffect.prototype.GetHandle = function() {
    return this.handle_;
}

HilightEffect.prototype.IsValid = function() {
    return (this.handle_ != -1);
}

HilightEffect.prototype.Move = function(rect) {
    ca_logger.Write(3, "HilightEffect::Move", "", "");
    if (this.IsValid()) {
        var props = new Properties();
        props.Add(NProperty.X, "" + rect.left);
        props.Add(NProperty.Y, "" + rect.top);
        props.Add(NProperty.WIDTH, "" + (rect.right - rect.left));
        props.Add(NProperty.HEIGHT, "" + (rect.bottom - rect.top));

        this.effect_manager.SetProperties(this.handle_, props.Get());
    }
    ca_logger.DeWrite(3);
}

HilightEffect.prototype.Create = function(rect, color, border, parent) {
    ca_logger.Write(3, "HilightEffect::Create", "", "");
    this.Destroy();

    if (rect != null) {
        this.rect_ = rect.Clone();

        rect.left -= this.inflate;
        rect.top -= this.inflate;
        rect.bottom += this.inflate;
        rect.right += this.inflate;

        this.handle_ = this.effect_manager.ReserveHandle(this.htype);

        var props = new Properties();
        if (color != undefined) {
            this.color = color;
        }

        props.Add(NProperty.ORDER, "" + this.order);
        props.Add(NProperty.BORDER, "" + border);
        props.Add(NProperty.COLOR, "" + this.color);
        props.Add(NProperty.X, "" + rect.left);
        props.Add(NProperty.Y, "" + rect.top);
        props.Add(NProperty.WIDTH, "" + (rect.right - rect.left));
        props.Add(NProperty.HEIGHT, "" + (rect.bottom - rect.top));
        props.Add(NProperty.PARENT_WINDOW, "" + parent);
        props.Add(NProperty.ANIMSTEPS, "" + this.animsteps);
        props.Add(NProperty.AUTOHIDE, "" + (this.autohide ? "1" : "0"));

        this.effect_manager.SetProperties(this.handle_, props.Get());
        this.effect_manager.CreateEffect(this.handle_);
    }
    ca_logger.DeWrite(3);
    return this.handle_;
}

HilightEffect.prototype.Show = function() {
    if (this.IsValid()) {
        this.effect_manager.ShowEffect(this.handle_);
    }
}

HilightEffect.prototype.Hide = function() {
    if (this.IsValid()) {
        this.effect_manager.HideEffect(this.handle_);
    }
}

HilightEffect.prototype.SetColor = function(color) {
    if (this.IsValid()) {
        this.color = color;
        this.effect_manager.SetProperty(this.handle_, NProperty.COLOR, "" + this.color);
    }
}

HilightEffect.prototype.Destroy = function() {
    ca_logger.Write(3, "HilightEffect::Destroy", "", "");
    if (this.IsValid()) {
        this.effect_manager.DestroyEffect(this.handle_);
        this.cleanup_();
    }
    ca_logger.DeWrite(3);
}

HilightEffect.prototype.Animate = function(steps) {
    if (this.IsValid()) {
        this.effect_manager.TriggerEffect(this.handle_, NProperty.ANIMATION, "" + steps);
    }
}

HilightEffect.prototype.GetRect = function() {
    return this.rect_;
}
