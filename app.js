/*
 * base64.js - Base64 encoding and decoding functions
 *
 * See: http://developer.mozilla.org/en/docs/DOM:window.btoa
 *      http://developer.mozilla.org/en/docs/DOM:window.atob
 *
 * Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
 * Released under the MIT license
 */

if (typeof btoa == 'undefined') {
    function btoa(str) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var encoded = [];
        var c = 0;
        while (c < str.length) {
            var b0 = str.charCodeAt(c++);
            var b1 = str.charCodeAt(c++);
            var b2 = str.charCodeAt(c++);
            var buf = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);
            var i0 = (buf & (63 << 18)) >> 18;
            var i1 = (buf & (63 << 12)) >> 12;
            var i2 = isNaN(b1) ? 64 : (buf & (63 << 6)) >> 6;
            var i3 = isNaN(b2) ? 64 : (buf & 63);
            encoded[encoded.length] = chars.charAt(i0);
            encoded[encoded.length] = chars.charAt(i1);
            encoded[encoded.length] = chars.charAt(i2);
            encoded[encoded.length] = chars.charAt(i3);
        }
        return encoded.join('');
    }
}

function Toolbox () {
    this.selection = null;

    this.width_element  = null;
    this._width         = 60;
    this.height_element = null;
    this._height        = 60;
    this.radius_element = null;
    this._radius        = 30;

    this.height = function(_) {
        if (arguments.length) {
            this._height = _;
            if (this.selection)
                this.selection.height = this._height;
            if (this.height_element)
                this.height_element.value = this._height;
            return this;
        }
        return this._height;
    }
    this.radius = function(_) {
        if (arguments.length) {
            this._radius = _;
            if (this.selection)
                this.selection.radius = this._radius;
            if (this.radius_element)
                this.radius_element.value = this._radius;
            return this;
        }
        return this._radius;
    }
    this.width = function(_) {
        if (arguments.length) {
            this._width = _;
            if (this.selection)
                this.selection.width = this._width;
            if (this.width_element)
                this.width_element.value = this._width;
            return this;
        }
        return this._width;
    }
}

function OnChange(el, cb) {
    if(window.addEventListener) {
        el.addEventListener('change', cb, false);
    } else if (window.attachEvent){
        el.attachEvent("onchange", cb);
    }
}

Toolbox.prototype.set_width_element = function (el) {
    var toolbox = this;
    toolbox.width_element = el;
    toolbox.width_element.value = toolbox._width;
    toolbox.width_element.disabled = true;

    OnChange(toolbox.width_element, function (e) {
        toolbox.width(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.set_height_element = function (el) {
    var toolbox = this;
    toolbox.height_element = el;
    toolbox.height_element.value = toolbox._height;
    toolbox.height_element.disabled = true;

    OnChange(toolbox.height_element, function (e) {
        toolbox.height(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.set_radius_element = function (el) {
    var toolbox = this;
    toolbox.radius_element = el;
    toolbox.radius_element.value = toolbox._radius;
    toolbox.radius_element.disabled = true;

    OnChange(toolbox.radius_element, function (e) {
        toolbox.radius(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.selectObject = function (selection) {
    this.selection = selection;
    this.radius(selection.radius);
    this.width(selection.width);
    this.height(selection.height);
    this.enable_tools();
};

Toolbox.prototype.disable_tools = function () {
    if (this.radius_element)
        this.radius_element.disabled = true;
    if (this.width_element)
        this.width_element.disabled = true;
    if (this.height_element)
        this.height_element.disabled = true;
}

Toolbox.prototype.enable_tools = function () {
    if (this.radius_element)
        this.radius_element.disabled = false;
    if (this.width_element)
        this.width_element.disabled = false;
    if (this.height_element)
        this.height_element.disabled = false;
}

Toolbox.prototype.unselect = function () {
    this.selection = null;
    this.disable_tools();
};

var prev_onload = window.onload || function () {},
    toolbox;


var prev_select_object = selectObject;

selectObject = function (x, y) {
    var selection = prev_select_object(x,y);

    if (selection) {
        toolbox.selectObject(selection);
    } else {
        toolbox.unselect();
    }
    return selection;
};

var old_set_new_radius = Node.prototype.setNewRadius;

Node.prototype.setNewRadius = function (x,y) {
    old_set_new_radius.bind(this)(x,y);
    if (toolbox.selection == this) {
        toolbox.height(this.height);
        toolbox.width(this.width);
        toolbox.radius(this.radius);
    }
};

window.onload = function () {
    var toolbox_el = document.getElementsByClassName("toolbox")[0];
    if (toolbox_el) {
        toolbox = new Toolbox();
        var radius_node = toolbox_el.getElementsByClassName("radius");
        if (radius_node)
            toolbox.set_radius_element(radius_node[0]);

        var height_node = toolbox_el.getElementsByClassName("height");
        if (height_node)
            toolbox.set_height_element(height_node[0]);

        var width_node = toolbox_el.getElementsByClassName("width");
        if (width_node)
            toolbox.set_width_element(width_node[0]);
    }
    prev_onload();
};

