
var JSON = {};


if (typeof Date.prototype.toJSON != 'function') {
    Date.prototype.toJSON = function() {
        var y = this.getUTCFullYear();
        var m = this.getUTCMonth() + 1;
        var d = this.getUTCDate();
        var h = this.getUTCHours();
        var mm = this.getUTCMinutes();
        var s = this.getUTCSeconds();
        if (m < 10) m = '0' + m;
        if (d < 10) d = '0' + d;
        if (h < 10) h = '0' + h;
        if (mm < 10) mm = '0' + mm;
        if (s < 10) s = '0' + s;

        return y + '-' + m + '-' + d + 'T' + h + ':' + mm + ':' + s + 'Z';
    };

    String.prototype.toJSON = function() { return this.valueOf(); };
    Number.prototype.toJSON = function() { return this.valueOf(); };
    Boolean.prototype.toJSON = function() { return this.valueOf(); };
}

if (typeof JSON.quote != 'function') {
    JSON.quote = function(s) {
        var e = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var m = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };
        var f = function(a) { return typeof m[a] == 'string' ? m[a] : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4); };

        e.lastIndex = 0;
        return '"' + (e.test(s) ? s.replace(e, f) : s) + '"';
    };
}

if (typeof JSON.stringify != 'function') {
    JSON.stringify = function(val) {
        
        var str = function(k, h) {
            var v = h[k];
            v && typeof v == 'object' && typeof v.toJSON == 'function' && (v = v.toJSON(k));

            var t = typeof v;
            switch (t) {
                case 'string': return JSON.quote(v); break;
                case 'number': return isFinite(v) ? (v + '') : 'null'; break;
                case 'boolean': return v.toString(); break;
                case 'object':
                    if (!v) return 'null';

                    var p = [];
                    var d1 = '{';
                    var d2 = '}';

                    if (Object.prototype.toString.apply(v) == '[object Array]') {
                        d1 = '[';
                        d2 = ']';
                        for (var i = 0, l = v.length; i < l; i++) {
                            p.push(str(i, v) || 'null');
                        }
                    } else {
                        for (var k in v) {
                            if (!Object.hasOwnProperty.call(v, k)) continue;

                            var s = str(k, v);
                            s && p.push(JSON.quote(k) + ':' + s);
                        }
                    }
                    return d1 + p.join(',') + d2;
                    break;
                case 'undefined':
                case 'unknown':
                    return;
                    break;
            }
        };

        return str('', { '': val });
    };
}


if (typeof JSON.pprint != 'function') {
    JSON.pprint = function(val) {
        
        var str = function(k, h, tab) {
            var v = h[k];
            v && typeof v == 'object' && (v = v.valueOf(k));

            var t = typeof v;
            switch (t) {
                case 'string': return JSON.quote(v); break;
                case 'number': return isFinite(v) ? (v + '') : 'null'; break;
                case 'boolean': return v.toString(); break;
                case 'object':
                    if (!v) return 'null';

                    var p = [];
                    var d1 = '{\n';
                    var d2 = '\n' + tab + '}';

                    if (Object.prototype.toString.apply(v) == '[object Array]') {
                        d1 = '[';
                        d2 = ']';
                        for (var i = 0, l = v.length; i < l; i++) {
                            p.push(str(i, v, tab) || 'null');
                        }
                        return d1 + p.join(',') + d2;
                    } else {
                        for (var k in v) {
                            if (!Object.hasOwnProperty.call(v, k)) continue;

                            var s = str(k, v, tab + "\t");
                            s && p.push(tab + JSON.quote(k) + ':' + s);
                        }
                        return d1 + p.join(',\n') + d2;
                    }
                    break;
                case 'undefined':
                case 'unknown':
                    return "{}";
                    break;
            }
        };
        return str('', { '': val }, '');
    }
}