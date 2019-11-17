function _setup(Base)
{
	Object.defineProperty(Base.prototype, "visible", {get: function(){return this.style.visibility != "hidden";}, set: function(visibile){this.style.visibility = visibile ? "inherit" : "hidden";}});
	Object.defineProperty(Base.prototype, "display", {get: function(){return this.style.display != "none";}, set: function(display){this.style.display = display ? "block" : "none";}});
	Object.defineProperty(Base.prototype, "buttonMode", {get: function(){return this.style.cursor === "pointer";}, set: function(buttonMode){this.style.cursor = buttonMode ? "pointer" : "auto";}});
	Object.defineProperty(Base.prototype, "mouseEnabled", {get: function(){return this.style.pointerEvents != "none";}, set: function(mouseEnabled){this.style.pointerEvents = mouseEnabled ? "auto" : "none";}});
	Object.defineProperty(Base.prototype, "transform", {get: getTransform, set: setTransform});
	Object.defineProperty(Base.prototype, "transformStyle", {get: getTransformStyle});
	Object.defineProperty(Base.prototype, "_x", {get: getX, set: setX});
	Object.defineProperty(Base.prototype, "_y", {get: getY, set: setY});
	Object.defineProperty(Base.prototype, "_rotation", {get: getRotation, set: setRotation});
	Object.defineProperty(Base.prototype, "_scaleX", {get: getScaleX, set: getScaleX});
	Object.defineProperty(Base.prototype, "_scaleY", {get: getScaleY, set: getScaleY});
	Object.defineProperty(Base.prototype, "_width", {get: getWidth, set: setWidth});
	Object.defineProperty(Base.prototype, "_height", {get: getHeight, set: setHeight});
	Object.defineProperty(Base.prototype, "numChildren", {get: function(){return this.children.length}});
	Object.defineProperty(Base.prototype, "scrollRect", {get: getScrollRect, set:setScrollRect});

	Base.prototype._ = function(id){
	return this.querySelector(id);
	}
	Base.prototype.__ = function(id){
		return this.querySelectorAll(id);
	}
	Base.prototype._t = function(id){
		return this.querySelector("[data-type=\'"+id+"\']");
	}
	Base.prototype.__t = function(id){
		return this.querySelectorAll("[data-type=\'"+id+"\']");
	}
	Base.prototype.cache = function(obj){
		if (typeof obj === 'undefined') obj = {};
	    obj.x = this._x;
	    obj.y = this._y;
	    obj.scaleX = this._scaleX;
	    obj.scaleY = this._scaleY;
		obj.rotation = this._rotation;
		return obj;
	}
	Base.prototype.childByIndex = function(index){
		return this.children[index];
	}
}
_setup(HTMLElement);
_setup(SVGElement);

function getScrollRect()
{
	return this._scrollRect;
}
function setScrollRect(rect)
{
	this._scrollRect = rect;
	
	var x = rect.x;
	var y = rect.y;
	var width = rect.width;
	var height = rect.height;
	var svg = this._("svg");
    var defs = svg.firstElementChild;    
    var r;
    var children = defs.children;
    if(children == undefined) children = defs.childNodes;  //ie fixer
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if(child.tagName == "clipPath")
      {
        r = child.firstElementChild;
        r.setAttributeNS(null, 'x', x);
        r.setAttributeNS(null, 'y', y);
        r.setAttributeNS(null, 'width', width);
        r.setAttributeNS(null, 'height', height);
        return r;
      }
    };
    var _svgNS = 'http://www.w3.org/2000/svg';
    var clippath = document.createElementNS(_svgNS, 'clipPath');
    clippath.setAttributeNS(null, 'id', 'clip');
    r = document.createElementNS(_svgNS, 'rect');
    r.setAttributeNS(null, 'x', x);
    r.setAttributeNS(null, 'y', y);
    r.setAttributeNS(null, 'width', width);
    r.setAttributeNS(null, 'height', height);

    clippath.appendChild(r);    
    defs.appendChild(clippath);

	var g = svg.lastElementChild;
	var ps = g.children;
	if(ps == undefined) ps = g.childNodes;  //ie fixer
	for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
	  p.setAttributeNS(null, 'clip-path', 'url(#clip)');
	}
   // var p = svg.lastElementChild.firstElementChild;
    //p.setAttributeNS(null, 'clip-path', 'url(#clip)');
    //svg.setAttributeNS(null, 'clippath', 'url(#clip)');
    //svg.setAttributeNS(null, 'clipPath', 'url(#clip)');
}

function getTransform()
{
	var matrix = {a:1,b:0,c:0,d:1,tx:0,ty:0};
	var trans = this.transformStyle;
	if(trans && trans != "none")
	{
		trans = trans.substring(trans.indexOf("(")+1,trans.lastIndexOf(")"));
		var m = trans.split(",");
		matrix.a = parseFloat(m[0]);
		matrix.b = parseFloat(m[1]);
		matrix.c = parseFloat(m[2]);
		matrix.d = parseFloat(m[3]);
		matrix.tx = parseFloat(m[4]);
		matrix.ty = parseFloat(m[5]);
	}
	return matrix;
}
function getTransformStyle()
{
	var style = document.defaultView.getComputedStyle(this, null);
	if(style == null) return null;
	var trans = style.getPropertyValue("-webkit-transform") || style.getPropertyValue("-moz-transform") || style.getPropertyValue("-ms-transform") || style.getPropertyValue("-o-transform") || style.getPropertyValue("transform") || null;
	return trans == "none" ? null : trans;
}
function setTransform(m)
{
	//todo
	var matrixString = "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + m.tx + "," + m.ty + ")";
	this.style[getPropPrefix("transform")] = matrixString;
}
function concat(left, right)
{
	/*
	 a , b, u
	 c , d, v
	 tx,ty, w
	*/
	var matrix = {a:1,b:0,c:0,d:1,tx:0,ty:0};
	matrix.a = left.a * right.a + left.b * right.c;
	matrix.b = left.a * right.b + left.b * right.d;
	matrix.c = left.c * right.a + left.d * right.c;
	matrix.d = left.c * right.b + left.d * right.d;
	matrix.tx = left.tx1 * right.a + left.ty1 * right.c + right.tx2;
	matrix.ty = left.tx1 * right.b + left.ty1 * right.d + right.ty2;
	

	return matrix;
}
function decompose(matrix){
	// http://stackoverflow.com/questions/16359246/how-to-extract-position-rotation-and-scale-from-matrix-svg
    // @see https://gist.github.com/2052247
    // calculate delta transform point
    var px = dtPoint(matrix, { x: 0, y: 1 });
    var py = dtPoint(matrix, { x: 1, y: 0 });

    // calculate skew
    var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
        translateX: matrix.tx,
        translateY: matrix.ty,
        scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
        skewX: skewX,
        skewY: skewY,
        rotation: skewY // rotation is the same as skew y NOT x?!?!
    };        
}

function getRotation()
{
	var matrix = this.transform;
	var skewX = ((180 / Math.PI) * Math.atan2(matrix.d, matrix.c) - 90);
	var skewY = ((180 / Math.PI) * Math.atan2(matrix.b, matrix.a));
	return skewY;
}
function setRotation()
{
	//todo
}
function getX()
{
	return this.transform.tx;
}
function getY()
{
	return this.transform.ty;
}
function setX(tx)
{
	var matrix = this.transform;
	matrix.tx = tx;
	this.transform = matrix;
}
function setY(ty)
{
	var matrix = this.transform;
	matrix.ty = ty;
	this.transform = matrix;
}
function getScaleX()
{
	var matrix = this.transform;	
	return Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
}
function getScaleY()
{
	var matrix = this.transform;	
	return Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
}
function setScaleX(scale)
{
	//todo
}
function setScaleY(scale)
{
	//todo
}
function setHeight(height)
{
	//todo
	//this.setScaleX(this)
}
function setWidth(width)
{
	//todo
}
function getHeight()
{
	var height = this.offsetHeight;
	if(isNaN(height) || !height) height = parseFloat(this.style.height);
	return this._scaleY * height; //this.clientHeight
}
function getWidth()
{
	var width = this.offsetWidth;
	if(isNaN(width) || !width) width = parseFloat(this.style.width);
	return this._scaleX * this.offsetWidth; //this.clientHeight
}
function dtPoint(matrix, point){
	return { x: (point.x * matrix.a + point.y * matrix.c), y: (point.x * matrix.b + point.y * matrix.d)};
}
function rotateMatrix(m, angle)
{
	angle *= (Math.PI / 180);	//to radians
	var sin = Math.sin( angle );
	var cos = Math.cos( angle );
	var a = m.a;
	var b = m.b;
	var c = m.c;
	var d = m.d;
	var tx = m.tx;
	var ty = m.ty;
	m.a = a*cos - b*sin;
	m.b = a*sin + b*cos;
	m.c = c*cos - d*sin;
	m.d = c*sin + d*cos;
	m.tx = tx*cos - ty*sin;
	m.ty = tx*sin + ty*cos;
	return m;
}

//logging utils
window.logging = false;
window.debug = false;
if(window.console && window.console.log)
{
	window.log = function()
	{
		if(this.logging)
		{	
			if(this.debug)
			{
				var mainArguments = Array.prototype.slice.call(arguments);
				var error = new Error();
				if(error.stack)
				{
					var line = new Error().stack.split('\n')[2];
					var func = line.substring(line.indexOf("at ") + 3, line.lastIndexOf("(")-1);
					line = line.substring(line.lastIndexOf("/")+1, line.lastIndexOf(")")-2);	
					mainArguments.push("\t<["+func+"()::"+line+"]>");
				}				
				Function.prototype.apply.call(console.log, console, mainArguments);
			}else{
				Function.prototype.apply.call(console.log, console, arguments);
			}
		}
	}	
}else{
	window.log = {log:function(){}};
}
//end logging utils

//keyline utils
function addDivKeyline(parent,width,height,colour,thickness) 
{
	//create four divs that create a 1px border
	var keyline = document.createElement('div');
	keyline.id = "keyline";
	keyline.style.cssText = "position:absolute;width:"+width+"px;height:"+height+"px;pointer-events:none;";
	//keyline.style.cssText = "position:absolute;display:block;width:'"+width+"'px;height:'"+height+"px;";
	var lhs		= "<div class='do' style='width:100%; height:"+thickness+"px; top:0px; background-color:"+colour+"'></div>";
	var top 	= "<div class='do' style='width:100%; height:"+thickness+"px; bottom: 0px; background-color:"+colour+"'></div>";
	var rhs 	= "<div class='do' style='width:"+thickness+"px; height:100%; left:0px; background-color:"+colour+"'></div>";
	var bottom	= "<div class='do' style='width:"+thickness+"px; height:100%; right: 0px; background-color:"+colour+"'></div>";
	keyline.innerHTML = lhs+top+rhs+bottom;
	return parent.appendChild(keyline);
}
function addKeylineTo(parent,width,height,colour,thickness) 
{
	var svgns = "http://www.w3.org/2000/svg";
	var keyline = document.createElement("div");
	keyline.className = "do";
	keyline.style.width = width+"px";
	keyline.style.height = height+"px";
	keyline.style.pointerEvents = "none";
	keyline.appendChild(createSVGRect(svgns, 0, 0, width, 1, colour));			//top
	keyline.appendChild(createSVGRect(svgns, 0, height-1, width, 1, colour));	//bottom
	keyline.appendChild(createSVGRect(svgns, 0, 0, 1, height, colour));		//left
	keyline.appendChild(createSVGRect(svgns, width-1, 0, 1, height, colour));	//right
	keyline.mouseEnabled = false;
	keyline.mouseChildren = false;
	parent.appendChild(keyline);
	return keyline;
}
function createSVGRect(svgns, x, y, width, height, fill)
{
	var svg = document.createElementNS(svgns, "svg");
	svg.setAttribute('style', 'pointer-events:none;left:'+x+'px;top:'+y+'px;-moz-transform:matrix(1,0,0,1,0,0);-ms-transform:matrix(1,0,0,1,0,0);-o-transform:matrix(1,0,0,1,0,0);-webkit-transform:matrix(1,0,0,1,0,0);transform:matrix(1,0,0,1,0,0);');
	svg.setAttribute('width', width);
	svg.setAttribute('height', height);
	svg.setAttribute('class', "do");
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

	var rect = document.createElementNS(svgns, 'rect');
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('height', height);
    rect.setAttribute('width', width);
    rect.setAttribute('fill', fill);
    rect.setAttribute('style', "pointer-events:none;");
    svg.appendChild(rect);
    return svg;
}
//end keyline utils



//check if it's iPad ------------------------------------------------------------
//var isiPad = navigator.userAgent.match(/iPad/i) != null;

//use to check if transforms are supported as we rely on them for now, show backup if falses - todo could try and use getPropPrefix function fromGS
function supportsTransforms() {
	if (!window.getComputedStyle) return false;
	var el = document.createElement('p'); 
	var has2d;
	var transforms = {'webkitTransform':'-webkit-transform','OTransform':'-o-transform','msTransform':'-ms-transform','MozTransform':'-moz-transform','transform':'transform'};

	document.body.appendChild(el);
	for (var t in transforms) {
		if (el.style[t] !== undefined) {
			el.style[t] = "matrix(1,0,0,1,0,0)";
			has2d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
		}
	}
	document.body.removeChild(el);
	return (has2d !== undefined && has2d.length > 0 && has2d !== "none");
}


function getPropPrefix(p)
{
	var e = document.createElement("div");
	var s = e.style, a, i;
	if (s[p] !== undefined)	return p;
	p = p.charAt(0).toUpperCase() + p.substr(1);
	a = ["O","Moz","ms","Ms","webkit"];
	i = 5;
	while (--i > -1 && s[a[i]+p] === undefined) { }
	if (i >= 0){
		_prefix = (i === 3) ? "ms" : a[i];
		return _prefix + p;
	}
	return null;
}
//console.log("GS", getPropPrefix("transform"));

var tweens = [];
function to(target, time, obj)
{
	var tween = TweenLite.to(target, time, obj);
	tweens.push(tween);
	return tween;
}


//a namespace for fbf utils
var fbf = (function () {
	

	var privateMethod = function () {

	};

	var module = {};
	module.publicMethod = function () {

	};

	//http://sharextras.org/jsdoc/extras/trunk/symbols/src/Media%20Preview_source_web_extras_components_preview_pdfjs_compatibility.js.html
	/*ajax*/
	//type = "GET" or "POST", format = "text" or "xml",  async = true or false
	module.ajax = function(url, callback, options)
	{
		var xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		
		if(options == undefined) options = {type:"GET", async:false, format:"text"};	//, 
		else{
			if(options.type == undefined)	options.type = "GET";
			if(options.async == undefined)	options.async = false;
			if(options.format == undefined)	options.format = "text";
		}

		xmlhttp.open(options.type || "GET", url, options.async || false);

		if(options.async)
		{
			xmlhttp.onreadystatechange = function()
			{
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
				{
					//callback((options.format == "text") ? xmlhttp.response : xmlhttp.response);	//responseXML
				//	var b = new Uint8Array(xmlhttp.responseText);
				//	var bb = (new VBArray(xmlhttp.responseBody).toArray());
					if(callback)	callback(xmlhttp.response ? xmlhttp.response : xmlhttp.responseText);//xmlhttp.response ? xmlhttp.response : xmlhttp.responseText);	//responseXML
				}else if (xmlhttp.readyState == 4 && options.error){
					options.error("error");
				}
			}
			xmlhttp.send(null);
		}else{
			xmlhttp.send(options.data);
			if(callback)	callback(options.format == "xml" ? xmlhttp.responseXML : xmlhttp.responseText);
		}
	}
	module.loadSvgs = function(callback, file)
	{
		file = file || "svg.gz.js";
		fbf.ajaxBinary(file, function onComplete(data){
			var defs = $("svg_defs");
			//clear any old defs
			while(defs.firstChild) defs.removeChild(defs.firstChild);
			var string = fbf.gunzip(data);
			var newdiv = document.createElement("div");
				//defs.innerHTML = string;

					
				var parser = new DOMParser();
				var doc = parser.parseFromString(string, "image/svg+xml");	//text/html
				var dg = doc.firstChild;//doc.getElementById("defs_global")
				dg.id = "defs_global";
				defs.appendChild(dg);

				//defs.innerHTML = string;
			//defs.innerHTML += string;
	//		document.body.appendChild(newdiv);
	//		defs.appendChild(newdiv.firstChild);
	//		document.body.removeChild(newdiv);
			//defs.setAttribute("innerHTML",string);
//defs.appendChild(newdiv);
			//var defs_g = document.createElement("defs");
			//defs_g
			//var string = fbf.gunzip(data)
			//defs_g.innerHTML=string;
			//defs.appendChild(defs_g);
				callback();
		});//fbf.gunzip(data)		//appendChild(escapeHTML(fbf.gunzip(data)));console.log($("svg_defs").innerHTML)
	}
		module.loadModule = function(url, zipped, callback)
	{
		if(zipped)
		{
			fbf.ajaxBinary(url, function onComplete(data){callback(fbf.gunzip(data));});
		}else{
			//TODO
			fbf.ajax(url, callback);
		}
		
	}
	function escapeHTML(someText) {
	  var div = document.createElement('div');
	  var text = document.createTextNode(someText);
	  //div.appendChild(text);
	  div.innerHTML = someText;
	  return div;//.innerHTML;
	}
	module.ajaxBinary = function(url, callback)
	{
		var xmlhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttp.open("GET", url, true);
		xmlhttp.responseType = "arraybuffer";	//force binary
		xmlhttp.onreadystatechange = function()
		{
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{
				var data = xmlhttp.response ? xmlhttp.response : new VBArray(xmlhttp.responseBody).toArray();	//ie9 workaround
				//convert to string - http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers#answer-18644158
				if(typeof data == "object" && data.length) {
					if(false && data.length < 246300){
						data = String.fromCharCode.apply(null, data);
					}else{
						var bs = "", length = data.length;
						for (var i = 0; i < length; i++)  bs += String.fromCharCode(data[i]);
						data = bs;
					}				
				}else if(typeof data == "object"){
					var bytes = new Uint8Array(data);
					if(false && bytes.length < 246300){
						data = String.fromCharCode.apply(null, bytes);
					}else{
						var bs = "", length = bytes.length;
						for (var i = 0; i < length; i++)  bs += String.fromCharCode(bytes[i]);
						data = bs;
					}
					
				}
				//convert to bytes
			    var bytes = [];
			    for (var i = 0; i < data.length; i++) {
			        bytes[i]=data.charCodeAt(i) & 0xFF;
			    }
				callback(bytes);	
			}
		}
		xmlhttp.send(null);
	}
	module.gunzip = function(data)
	{
		//header check
		if(data[0] == 0x1f && data[1] == 0x8b)
		{
			var gunzip = new Zlib.Gunzip(data); 
	    	var plain = gunzip.decompress();
		}else{
			plain = data;
		}		
		var asciistring = "";
	    for (var i = 0; i < plain.length; i++) {         
	        asciistring += String.fromCharCode(plain[i]);
	    }
	    return asciistring;
	}
	module.hide = function()
	{
		for (var i = 0; i < arguments.length; i++){
			if(arguments[i].nodeType && arguments[i].nodeType == 1)	arguments[i].visible = false;
			else if(arguments[i].length)	this.hide.apply(null, arguments[i]);
		}
	}
	module.show = function()
	{
		for (var i = 0; i < arguments.length; i++){
			if(arguments[i].nodeType && arguments[i].nodeType == 1)	arguments[i].visible = true;
			else if(arguments[i].length)	this.show.apply(null, arguments[i]);
		}
	}
	module.displayNone = function()
	{
		for (var i = 0; i < arguments.length; i++){
			if(arguments[i].nodeType && arguments[i].nodeType == 1)	arguments[i].display = false;
			else if(arguments[i].length)	this.displayNone.apply(null, arguments[i]);
		}
	}
	module.displayBlock = function()
	{
		for (var i = 0; i < arguments.length; i++){
			if(arguments[i].nodeType && arguments[i].nodeType == 1)	arguments[i].display = true;
			else if(arguments[i].length)	this.displayBlock.apply(null, arguments[i]);
		}
	}
	module.addListener = function(target/*element*/, event/*string*/, callback/*function*/, params/*any:null*/, returnEvent/*boolean:false*/, applyParams/*boolean:false*/)
	{
		if (params === undefined) params = null;
		if (returnEvent === undefined) returnEvent = false;
		if (applyParams === undefined) applyParams = false;

		var handler = function(e)
		{
			if(params == null)
			{
				if(!returnEvent)	callback();
				else 				callback(e);
			}else{
				if(!returnEvent)
				{
					if(!applyParams)
					{
						callback(params);
					}else{
						callback.apply(null, params);	//check callBackParams is an array
					}
				}else{
					if(!applyParams)
					{
						callback(params, e);
					}else{
						var duplicate = params.concat(e);	//check callBackParams is an array
						callback.apply(null, duplicate);
					}
				}
			}
		}
		target.addEventListener(event,handler);
	}
	//create and inject div into parent with given id and html contents
	module.injectDiv = function(id,innerHTML,parent) 
	{
		var div = document.createElement('div');
		div.id = id;
		div.innerHTML = innerHTML;
		return parent.appendChild(div);
	}

	//language mappings - could be initialized from config
	var mapping = [];
	mapping["uk"]	= ["english"];
	mapping["nl"]	= ["dutch", "english"];
	mapping["benl"] = ["belgianDutch", "dutch", "english"];
	mapping["befr"] = ["belgianFrench", "french", "english"];
	mapping["dk"]	= ["danish","english"];
	mapping["fi"]	= ["finnish","english"];
	mapping["sv"]	= ["swedish","english"];
	mapping["no"]	= ["norwegian","english"];
	mapping["uaeen"]= ["english"];
	mapping["ksa"] = ["arabic"];
	mapping["rsa"]	= ["southafrican", "english"];
	mapping["au"]	= ["australian", "english"];
	mapping["nz"]	= ["newz", "english"];
	mapping["fr"]	= ["french"];
	mapping["it"]	= ["italian"];
	mapping["de"]	= ["german"];
	mapping["ch"]	= ["german"];
	mapping["at"]	= ["german"];
	mapping["es"]	= ["spanish"];
	mapping["pt"]	= ["portuguese"];
	mapping["pl"]	= ["polish"];
	mapping["uaear"]= ["arabic"];
	mapping["ru"]	= ["russian"];

	for(var key in mapping) mapping[key].push("default");

	module.setLang = function(div, lang)
	{
		if(div.length){
			for(var i = 0; i < div.length; i++) this.setLang(div[i], lang);
			return;
		}
		var totallang = div.children.length;
		var mappings = mapping[lang];
		var found = false;
		for(var j = 0; j < mappings.length; j++)
		{
			var language = mappings[j];
			for (var i = 0; i < totallang; i++) {     	
		    	var divlang = div.children[i].id;
		    	var langCheck = divlang.indexOf("_"+language);
		    	if(langCheck != -1 && (langCheck == divlang.length-language.length-1)){
		    		this.show(div.children[i]);
		    		found = true;	
		    	} else {
		    		this.hide(div.children[i]);
		    	}
			}
			if(found) break; //we found preference so bug out woop
		}
	}
	module.isMobile = function()
	{
		return /Mobi/.test(navigator.userAgent);
	}
	module.isIE = function()
	{
		var ua = window.navigator.userAgent;
		return (ua.indexOf('MSIE ')  >=  0 || ua.indexOf('Trident/') >= 0 || ua.indexOf('Edge/') >= 0);
	}
	module.isLocal = function()
	{
		return window.location.protocol === "file:" || window.location.hostname == "localhost";
	}
	module.replaceSVGDefs = function(globals_id)
	{
		var uses = document.querySelectorAll("use");
		var trans = getPropPrefix("transform");
		//TODO improve
		var defs = document.querySelector("defs");//$(globals_id !== undefined ? globals_id : "defs_global");
		for (var i = 0; i < uses.length; i++) {
			var use = uses[i];
			var ref = use.getAttribute("xlink:href");
			var def = defs.querySelector(ref);
			var clone = def.cloneNode(true);
			var transform = use.getAttribute("transform");
			if(transform)	clone.setAttribute("transform", transform);
			use.parentNode.appendChild(clone);
			use.parentNode.removeChild(use);
		};
	}
	module.replaceSVGDefs2 = function(globals_id)
	{
		var uses = document.querySelectorAll("use");
		//TODO improve
		var defs = document.querySelector("defs");//$(globals_id !== undefined ? globals_id : "defs_global");
		for (var i = 0; i < uses.length; i++) {
			var use = uses[i];
			var par = use.parentNode;
			par.removeChild(use);
			par.appendChild(use);
		};
	}
	//traverse the dom, and call a function passing in each element and current depth
	module.traverseDom = function(node, func, depth)
	{
		if(depth === undefined) depth = 0;
	    var result = func(node, depth);
	    if(result === false) return;
	    node = node.firstChild;
	    depth++;
	    while (node) {
	        this.traverseDom(node, func, depth);
	        node = node.nextSibling;
	    }
	}
	module.logDom = function(root)
	{
		var domString = "";
		function buildDom(node, depth)
		{
		    if(typeof node.id === "undefined" || node.id.length < 1 || node.id.indexOf("instance") !== -1 || node.id == "defs_global") return false;//|| node.id.indexOf("instance") != -1
		    var tab = "";
		    while(depth--) tab += "\t";
		    //roundMatrixValues(node);
		    //log(node.id);
		    domString += tab + "var " + node.id + " = $('" +  node.id + "');" + "\n";
		    return true;
		}
		this.traverseDom(root, buildDom);
		return domString;
	}
	module.clean = function(node, recurse)//remove empty textnodes
	{
		if(recurse === undefined) recurse = true;
		for(var n = 0; n < node.childNodes.length; n ++)
		{
			var child = node.childNodes[n];
			if(child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))){
				node.removeChild(child);
				n--;
			}else if(child.nodeType === 1){
				this.clean(child, recurse);
			}
		}
	}
	module.getChildrenMatching = function(container, id)
	{
		var children = container.children;
		var results = [];
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if(child.id !== undefined && child.id.indexOf(id) != -1) results.push(child);
		}
		return results;	
	}
	//video utils
	module.createVideo = function(id, width, height /*src, src, src...*/)
	{
		log("setupVideodiv("+id+")");
		var vid = document.createElement('video');
		vid.id = id;
		vid.width = width;
		vid.height = height;
		vid.preload = "none";
		vid.muted = true;
		vid.style.position = "absolute";
		for (var i = 3; i < arguments.length; i++){
			var source = arguments[i];
			var type = source.substr(source.lastIndexOf(".")+1);
			vid.appendChild(this.generateVideoSource(source, "video/"+type));
		};
		return vid;	//todo return a wrapper		
	}
	module.generateVideoSource = function(src, type)
	{
		var source = document.createElement('source');
	    source.src = src;
	    source.type = type;
	    return source;
	}
	//end video utils

	function handleClick(event)
	{
		console.log("handleClick", event);
	}

	var listener = document.createElement("div");
	listener.id = "listener";
	listener.style.display = "none";
	//document.body.appendChild(listener);
	listener.addEventListener("clickthrough", handleClick);

	

  	return module;
})();

var Rectangle = function(x, y, w, h)
{
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
}


/*
custom events:
http://stackoverflow.com/questions/5342917/custom-events-in-ie-without-using-libraries
http://help.dottoro.com/ljrinokx.php ?

event handling:
http://www.anujgakhar.com/2013/05/22/cross-browser-event-handling-in-javascript/

greensock:
https://support.sizmek.com/hc/en-us/articles/206136366--reference-glossary-HTML5-Shared-Libraries
*/

//GUNZIP min - in function else explodes
function gzip()
{
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function n(e){throw e;}var q=void 0,aa=this;function r(e,c){var d=e.split("."),b=aa;!(d[0]in b)&&b.execScript&&b.execScript("var "+d[0]);for(var a;d.length&&(a=d.shift());)!d.length&&c!==q?b[a]=c:b=b[a]?b[a]:b[a]={}};var u="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;new (u?Uint8Array:Array)(256);var v;for(v=0;256>v;++v)for(var w=v,ba=7,w=w>>>1;w;w>>>=1)--ba;function x(e,c,d){var b,a="number"===typeof c?c:c=0,f="number"===typeof d?d:e.length;b=-1;for(a=f&7;a--;++c)b=b>>>8^z[(b^e[c])&255];for(a=f>>3;a--;c+=8)b=b>>>8^z[(b^e[c])&255],b=b>>>8^z[(b^e[c+1])&255],b=b>>>8^z[(b^e[c+2])&255],b=b>>>8^z[(b^e[c+3])&255],b=b>>>8^z[(b^e[c+4])&255],b=b>>>8^z[(b^e[c+5])&255],b=b>>>8^z[(b^e[c+6])&255],b=b>>>8^z[(b^e[c+7])&255];return(b^4294967295)>>>0}
var A=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],z=u?new Uint32Array(A):A;function B(){}B.prototype.getName=function(){return this.name};B.prototype.getData=function(){return this.data};B.prototype.H=function(){return this.I};r("Zlib.GunzipMember",B);r("Zlib.GunzipMember.prototype.getName",B.prototype.getName);r("Zlib.GunzipMember.prototype.getData",B.prototype.getData);r("Zlib.GunzipMember.prototype.getMtime",B.prototype.H);function D(e){var c=e.length,d=0,b=Number.POSITIVE_INFINITY,a,f,g,k,m,p,t,h,l,y;for(h=0;h<c;++h)e[h]>d&&(d=e[h]),e[h]<b&&(b=e[h]);a=1<<d;f=new (u?Uint32Array:Array)(a);g=1;k=0;for(m=2;g<=d;){for(h=0;h<c;++h)if(e[h]===g){p=0;t=k;for(l=0;l<g;++l)p=p<<1|t&1,t>>=1;y=g<<16|h;for(l=p;l<a;l+=m)f[l]=y;++k}++g;k<<=1;m<<=1}return[f,d,b]};var E=[],F;for(F=0;288>F;F++)switch(!0){case 143>=F:E.push([F+48,8]);break;case 255>=F:E.push([F-144+400,9]);break;case 279>=F:E.push([F-256+0,7]);break;case 287>=F:E.push([F-280+192,8]);break;default:n("invalid literal: "+F)}
var ca=function(){function e(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:n("invalid length: "+a)}}var c=[],d,b;for(d=3;258>=d;d++)b=e(d),c[d]=b[2]<<24|b[1]<<
16|b[0];return c}();u&&new Uint32Array(ca);function G(e,c){this.i=[];this.j=32768;this.d=this.f=this.c=this.n=0;this.input=u?new Uint8Array(e):e;this.o=!1;this.k=H;this.z=!1;if(c||!(c={}))c.index&&(this.c=c.index),c.bufferSize&&(this.j=c.bufferSize),c.bufferType&&(this.k=c.bufferType),c.resize&&(this.z=c.resize);switch(this.k){case I:this.a=32768;this.b=new (u?Uint8Array:Array)(32768+this.j+258);break;case H:this.a=0;this.b=new (u?Uint8Array:Array)(this.j);this.e=this.F;this.q=this.B;this.l=this.D;break;default:n(Error("invalid inflate mode"))}}
var I=0,H=1;
G.prototype.g=function(){for(;!this.o;){var e=J(this,3);e&1&&(this.o=!0);e>>>=1;switch(e){case 0:var c=this.input,d=this.c,b=this.b,a=this.a,f=c.length,g=q,k=q,m=b.length,p=q;this.d=this.f=0;d+1>=f&&n(Error("invalid uncompressed block header: LEN"));g=c[d++]|c[d++]<<8;d+1>=f&&n(Error("invalid uncompressed block header: NLEN"));k=c[d++]|c[d++]<<8;g===~k&&n(Error("invalid uncompressed block header: length verify"));d+g>c.length&&n(Error("input buffer is broken"));switch(this.k){case I:for(;a+g>b.length;){p=
m-a;g-=p;if(u)b.set(c.subarray(d,d+p),a),a+=p,d+=p;else for(;p--;)b[a++]=c[d++];this.a=a;b=this.e();a=this.a}break;case H:for(;a+g>b.length;)b=this.e({t:2});break;default:n(Error("invalid inflate mode"))}if(u)b.set(c.subarray(d,d+g),a),a+=g,d+=g;else for(;g--;)b[a++]=c[d++];this.c=d;this.a=a;this.b=b;break;case 1:this.l(da,ea);break;case 2:fa(this);break;default:n(Error("unknown BTYPE: "+e))}}return this.q()};
var K=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],L=u?new Uint16Array(K):K,N=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],O=u?new Uint16Array(N):N,P=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],Q=u?new Uint8Array(P):P,R=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ga=u?new Uint16Array(R):R,ha=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,
13,13],U=u?new Uint8Array(ha):ha,V=new (u?Uint8Array:Array)(288),W,ia;W=0;for(ia=V.length;W<ia;++W)V[W]=143>=W?8:255>=W?9:279>=W?7:8;var da=D(V),X=new (u?Uint8Array:Array)(30),Y,ja;Y=0;for(ja=X.length;Y<ja;++Y)X[Y]=5;var ea=D(X);function J(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g=a.length,k;b<c;)f>=g&&n(Error("input buffer is broken")),d|=a[f++]<<b,b+=8;k=d&(1<<c)-1;e.f=d>>>c;e.d=b-c;e.c=f;return k}
function Z(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g=a.length,k=c[0],m=c[1],p,t;b<m&&!(f>=g);)d|=a[f++]<<b,b+=8;p=k[d&(1<<m)-1];t=p>>>16;e.f=d>>t;e.d=b-t;e.c=f;return p&65535}
function fa(e){function c(a,c,b){var d,e=this.w,f,g;for(g=0;g<a;)switch(d=Z(this,c),d){case 16:for(f=3+J(this,2);f--;)b[g++]=e;break;case 17:for(f=3+J(this,3);f--;)b[g++]=0;e=0;break;case 18:for(f=11+J(this,7);f--;)b[g++]=0;e=0;break;default:e=b[g++]=d}this.w=e;return b}var d=J(e,5)+257,b=J(e,5)+1,a=J(e,4)+4,f=new (u?Uint8Array:Array)(L.length),g,k,m,p;for(p=0;p<a;++p)f[L[p]]=J(e,3);if(!u){p=a;for(a=f.length;p<a;++p)f[L[p]]=0}g=D(f);k=new (u?Uint8Array:Array)(d);m=new (u?Uint8Array:Array)(b);e.w=
0;e.l(D(c.call(e,d,g,k)),D(c.call(e,b,g,m)))}G.prototype.l=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length-258,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(this.a=b,d=this.e(),b=this.a),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b>=a&&(this.a=b,d=this.e(),b=this.a);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.D=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(d=this.e(),a=d.length),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b+m>a&&(d=this.e(),a=d.length);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.e=function(){var e=new (u?Uint8Array:Array)(this.a-32768),c=this.a-32768,d,b,a=this.b;if(u)e.set(a.subarray(32768,e.length));else{d=0;for(b=e.length;d<b;++d)e[d]=a[d+32768]}this.i.push(e);this.n+=e.length;if(u)a.set(a.subarray(c,c+32768));else for(d=0;32768>d;++d)a[d]=a[c+d];this.a=32768;return a};
G.prototype.F=function(e){var c,d=this.input.length/this.c+1|0,b,a,f,g=this.input,k=this.b;e&&("number"===typeof e.t&&(d=e.t),"number"===typeof e.A&&(d+=e.A));2>d?(b=(g.length-this.c)/this.r[2],f=258*(b/2)|0,a=f<k.length?k.length+f:k.length<<1):a=k.length*d;u?(c=new Uint8Array(a),c.set(k)):c=k;return this.b=c};
G.prototype.q=function(){var e=0,c=this.b,d=this.i,b,a=new (u?Uint8Array:Array)(this.n+(this.a-32768)),f,g,k,m;if(0===d.length)return u?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(g=d.length;f<g;++f){b=d[f];k=0;for(m=b.length;k<m;++k)a[e++]=b[k]}f=32768;for(g=this.a;f<g;++f)a[e++]=c[f];this.i=[];return this.buffer=a};
G.prototype.B=function(){var e,c=this.a;u?this.z?(e=new Uint8Array(c),e.set(this.b.subarray(0,c))):e=this.b.subarray(0,c):(this.b.length>c&&(this.b.length=c),e=this.b);return this.buffer=e};function $(e){this.input=e;this.c=0;this.m=[];this.s=!1}$.prototype.G=function(){this.s||this.g();return this.m.slice()};
$.prototype.g=function(){for(var e=this.input.length;this.c<e;){var c=new B,d=q,b=q,a=q,f=q,g=q,k=q,m=q,p=q,t=q,h=this.input,l=this.c;c.u=h[l++];c.v=h[l++];(31!==c.u||139!==c.v)&&n(Error("invalid file signature:"+c.u+","+c.v));c.p=h[l++];switch(c.p){case 8:break;default:n(Error("unknown compression method: "+c.p))}c.h=h[l++];p=h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24;c.I=new Date(1E3*p);c.O=h[l++];c.N=h[l++];0<(c.h&4)&&(c.J=h[l++]|h[l++]<<8,l+=c.J);if(0<(c.h&8)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);
c.name=m.join("")}if(0<(c.h&16)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);c.K=m.join("")}0<(c.h&2)&&(c.C=x(h,0,l)&65535,c.C!==(h[l++]|h[l++]<<8)&&n(Error("invalid header crc16")));d=h[h.length-4]|h[h.length-3]<<8|h[h.length-2]<<16|h[h.length-1]<<24;h.length-l-4-4<512*d&&(f=d);b=new G(h,{index:l,bufferSize:f});c.data=a=b.g();l=b.c;c.L=t=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;x(a,q,q)!==t&&n(Error("invalid CRC-32 checksum: 0x"+x(a,q,q).toString(16)+" / 0x"+t.toString(16)));c.M=
d=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;(a.length&4294967295)!==d&&n(Error("invalid input size: "+(a.length&4294967295)+" / "+d));this.m.push(c);this.c=l}this.s=!0;var y=this.m,s,M,S=0,T=0,C;s=0;for(M=y.length;s<M;++s)T+=y[s].data.length;if(u){C=new Uint8Array(T);for(s=0;s<M;++s)C.set(y[s].data,S),S+=y[s].data.length}else{C=[];for(s=0;s<M;++s)C[s]=y[s].data;C=Array.prototype.concat.apply([],C)}return C};r("Zlib.Gunzip",$);r("Zlib.Gunzip.prototype.decompress",$.prototype.g);r("Zlib.Gunzip.prototype.getMembers",$.prototype.G);}).call(this); //@ sourceMappingURL=gunzip.min.js.map
}
gzip();

function TextField(font, text, fontSize, kerning, leadingOffset, align, colour, wrapper, width) {
    var html;
    if (typeof font === "string") html = false;
    if (typeof font === "object") html = true;
    if (typeof text !== "string") text = String(text);
    //check the fonts are available
    if (html == false && !fonts[font]) throw "font " + font + " not found";
    else if (html) {
        for (var property in font) {
            if (font.hasOwnProperty(property)) {
                if (!fonts[font[property]]) throw "font " + font[property] + " not found";
            }
        }
    }
    var scale = (1 / 1024) * fontSize;
    var twip = 1 / 20;
    align = align || "left";

    wrapper = wrapper || div();
    wrapper.className = "do";

    while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
    //FF fix, firefox dies if you try and set svg properties when it isnt on the dom, cheers  
    var doFFFix = !fbf.isIE();	//https://github.com/vuejs/vue/issues/3195
    if(doFFFix)
    {
   	    if(wrapper.parentNode)
	    {
	    	var parent = wrapper.parentNode;
	    	var wrapperSibling = wrapper.nextSibling;
	    }
	    document.body.appendChild(wrapper);
	    var oldVisibile = wrapper.style.visible || "visible";
	    wrapper.style.visible = "hidden";
    }

    
    //

    var textField = svg();
    textField.setAttribute("class", "do");
    textField.className = "do";
    textField.setAttribute("fill", colour || "#000000");
    /*
    textField.setAttribute("fill", "#ff0000");
    //textField.setAttribute("fill", "none");
    textField.setAttribute("stroke", "#00ff00");
    textField.setAttribute("stroke-width", "20"); //fontSize?
    */
    var defs_global = document.getElementById("defs_global");
    var svg_defs = document.getElementById("svg_defs");
    defs_global = svg_defs.firstElementChild;

    var svgns = "http://www.w3.org/2000/svg";
    var xlinkns = "http://www.w3.org/1999/xlink";

    var settings = getFontSettings(html ? font.normal : font, fontSize, kerning, leadingOffset);

    var fontObj = fonts[html ? font.normal : font];
    var ascent = fontObj.ascent;
    var descent = fontObj.descent;
    var height = (ascent + descent) * twip;
    var offset = (1024 - height) * scale;
    var leading = fontObj.leading * scale;

    var sx = 2,
        sy = 0;//2;
    var y = sy + (ascent * twip) * scale;
    var x = sx;

    var maxWidth = width || 0;
    var maxHeight = 0;
    var maxLineWidth = 0;

    //((ascent + descent)*scale*twip)+offset = font size :D - cool

    //create groups per line to allow for awesomeness
    //perhaps only set y on the group rather than per use
    var groups = [];
    var widths = [];
    var group = document.createElementNS(svgns, "g");
    groups.push(group);
    var delta = (ascent * twip) - 1024;
    var diff = ((ascent + descent) * twip) - 1024;

    var __leading = leading;
    var _leading = (ascent + descent) * twip;
    leading = _leading * scale;

    var lastCode = -1;
    var lastNewLine = -1;
    var trans = "matrix(" + scale + ",0,0," + scale + ",";
    var scriptScale = 0.5625; //<--RELATIVE TO FONT
    var transHalf = "matrix(" + (scale * scriptScale) + ",0,0," + (scale * scriptScale) + ",";
    var mode = "normal";
    var skew = 0;
    var charScale = 1;
    var charColour = null;

    var supScale = scriptScale;
    var subDelta = (((ascent -descent )* twip) * scale) - (((ascent - descent) * twip) * scale * supScale);

    var yCache = y;

    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        if (html) {
            if (code == 60 && text.charCodeAt(i + 1) != 48) //  "<"
            {
                var closeTag = text.charAt(i + 1) === "/";
                if (closeTag) {
                    //reset
                    settings = getFontSettings(html ? font.normal : font, fontSize, kerning, leadingOffset);

                    if (mode == "sup") {
                        y += subDelta;//leading * scale * 1.75;
                    }
                    skew = 0;
                    charScale = 1;
                    i += mode.length + 2; //skip "</?>"
                    mode = "normal";
                    charColour = null;
                    continue;
                }
                var tagEnd = text.indexOf(">", i);
                var mode = text.substring(i + 1, tagEnd); //text.charAt(i+1);
                var modeLength = mode.length;
                //contains attributes
                var spaceIndex = mode.indexOf(" ");
                if (spaceIndex != -1) {
                    var attributes = mode.substring(spaceIndex + 1);
                    if (attributes.indexOf("color") != -1) {
                        attributes = attributes.split("\'");
                        charColour = attributes[1];
                    }
                    mode = mode.substring(0, spaceIndex);
                }
                if (mode == "b") {
                    settings = getFontSettings(html ? font.bold : font, fontSize, kerning, leadingOffset);
                } else if (mode == "i") {
                    skew = -10;
                } else if (mode == "sup") {
                    charScale = supScale;
                    y -= subDelta;
                    console.log("l lo", leading, leadingOffset, ascent)
                } else if (mode == "sub") {
                    charScale = supScale;
                }else {

                }
                i += modeLength + 1; //skip "<?>"
                continue;
            } else if (code == 62) //   ">"
            {

            }
        }
        if (code == 10) //new line
        {
            lastNewLine = i;
            y += leading + leadingOffset;
            x = sx;
            widths.push(maxLineWidth);
            maxLineWidth = 0;
            textField.appendChild(group);
            group = document.createElementNS(svgns, "g");
            groups.push(group);
            lastCode = -1;
            continue;
        }
        if ((code == 32 || i == text.length - 1) && width) //space
        {
            //TODO, if width set try to auto wrap
            //TODO what if space is the offender, i.e. crosses the line/max
            /*
                if current x at point of space is greater than width
                    back track to previous space, insert a newline and set i there
                    also need to remove all use tags from group
            */
            if (x > width) {
                var lastSpace = text.lastIndexOf(" ", i - 1);
                if (lastSpace == -1) {
                    width = 0; //cannot fit so bugout
                } else {
                    //cut out space and replace with \n
                    text = text.substr(0, lastSpace) + String.fromCharCode(10) + text.substr(lastSpace + 1);
                    //var previousSpace = text.lastIndexOf(" ", lastSpace-1);
                    //if(lastNewLineIndex == -1) lastNewLineIndex = 0;
                    var diff = i - lastSpace;
                    groups.length = 0;
                    widths.length = 0;
                    while (group.lastElementChild) //diff--)
                    {
                        if (group.lastElementChild) group.removeChild(group.lastElementChild);
                    }
                    while (textField.lastElementChild) textField.removeChild(textField.lastElementChild);
                    i = lastSpace - 1;
                    //if(i < 0) i = 0;  //incase there was no last newline
                    i = -1;
                    //lastNewLine = -1;
                    x = sx;
                    y = sy + (ascent * twip) * scale
                    maxLineWidth = 0;
                    maxWidth = width || 0;
                    lastCode = -1;
                    group = document.createElementNS(svgns, "g");
                    groups.push(group);
                    settings = getFontSettings(html ? font.normal : font, fontSize, kerning, leadingOffset);
                    continue;
                }
            }
        }
        var char = defs_global.querySelector(settings.fontId + code);
        if (!char) continue; //char not found
        var useTag = document.createElementNS(svgns, "use");
        if (charColour) useTag.setAttribute("fill", charColour);
        var id = settings.fontId + code;
        useTag.setAttributeNS(xlinkns, "xlink:href", id);

        var combi = (lastCode << 16) | code;
        if (lastCode != -1 && settings.kerningTable[combi]) {
            x += settings.kerningTable[combi] * scale * twip;
        }
        //TODO check is css transform is also needed
        var transform = (charScale == 1 ? trans : transHalf) + x + "," + y + ")";
        if (skew != 0) transform += " skewX(" + skew + ")";
        //if(charScale != 1)    transform += " scale("+charScale+")";
        useTag.setAttribute("transform", transform);
        group.appendChild(useTag);
        var dx = settings.advanceTable[code] * scale * twip;
        if (charScale != 1) dx *= scriptScale;
        x += dx + kerning;

        lastCode = code;
        if (x > maxLineWidth) maxLineWidth = x;
        if (x > maxWidth) maxWidth = x;
    }
    if (group.parentNode == null) {
        textField.appendChild(group);
        widths.push(maxLineWidth);
    }
    maxHeight += ((settings.descent * twip) * scale) + y;
    textField.setAttribute("width", maxWidth + "px");
    textField.setAttribute("height", maxHeight + "px");
    wrapper.setAttribute("data-width", Math.ceil(maxWidth));
    wrapper.setAttribute("data-height", Math.ceil(maxHeight));
    wrapper.style.width = Math.ceil(maxWidth) + "px";
    wrapper.style.height = Math.ceil(maxHeight) + "px";
    wrapper.appendChild(textField);

    if (align != "left") {
        if (align == "right") {
            for (var i = 0; i < groups.length; i++) {
                TweenLite.set(groups[i], { x: maxWidth - widths[i] });
            }
        } else if (align == "center" || align == "middle") {
            for (var i = 0; i < groups.length; i++) {
                TweenLite.set(groups[i], { x: ((maxWidth - widths[i]) * 0.5) - 1 });	//-1 to counter 2 px start offset
            }
        }
    }

    if(doFFFix)
    {
		if(parent){
			if(wrapperSibling){
				parent.insertBefore(wrapper, wrapperSibling);
			}else{
				parent.appendChild(wrapper);
			}
		} else{
			wrapper.parentNode.removeChild(wrapper);
		}
		wrapper.style.visible = oldVisibile;
	}
    return wrapper;
}


function TextField2(font, text, fontSize, kerning, leadingOffset, align, colour, wrapper)
{
    if(!fonts[font])        throw "font "+font+" not found";
    var scale = (1/1024) * fontSize;
    var twip = 1/20;
    align = align || "left";

    wrapper = wrapper || div();
    wrapper.className = "do";

    while(wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
    //FF fix, firefox dies if you try and set svg properties when it isnt on the dom, cheers
    
    if(wrapper.parentNode)
    {
    	var parent = wrapper.parentNode;
    	var wrapperSibling = wrapper.nextSibling;
    }
    document.body.appendChild(wrapper);
    var oldVisibile = wrapper.style.visible || "visible";
    wrapper.style.visible = "hidden";

    var textField = svg();
    textField.setAttribute("class", "do");
    textField.className = "do";
    textField.setAttribute("fill", colour || "#000000");
    /*
    textField.setAttribute("fill", "#ff0000");
    //textField.setAttribute("fill", "none");
    textField.setAttribute("stroke", "#00ff00");
    textField.setAttribute("stroke-width", "20"); //fontSize?
    */
    var defs_global = document.getElementById("defs_global");
    var svg_defs = document.getElementById("svg_defs");
    defs_global = svg_defs.firstElementChild;

    var svgns = "http://www.w3.org/2000/svg";
    var xlinkns = "http://www.w3.org/1999/xlink";

    var fontObj = fonts[font];
    var ascent = fontObj.ascent;
    var descent = fontObj.descent;
    var height = (ascent + descent) * twip;
    var offset = (1024 - height) * scale;
    var leading = fontObj.leading * scale;

    var sx = 2, sy = 2;
    var y = sy + (ascent*twip)*scale;
    var x = sx;

    var advanceTable = fontObj.advance;
    var kerningTable = fontObj.kerning;
    var fontId = "#f"+fontObj.id+"_";

    var maxWidth = 0;
    var maxHeight = 0;
    var maxLineWidth = 0;
    
    //((ascent + descent)*scale*twip)+offset = font size :D - cool

    //create groups per line to allow for awesomeness
    //perhaps only set y on the group rather than per use
    var groups = [];
    var widths = [];
    var group = document.createElementNS(svgns, "g");
    groups.push(group);
    var delta = (ascent * twip) - 1024;
    var diff = ((ascent + descent) * twip) - 1024;

    var __leading = leading;
    var _leading = (ascent + descent) * twip;
    leading = _leading * scale;

    var lastCode = -1;
    var trans = "matrix("+scale+",0,0,"+scale+",";

    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        if(code == 10)  //new line
        {
            y += leading + leadingOffset;
            x = sx;  
            widths.push(maxLineWidth);
            maxLineWidth = 0;         
            textField.appendChild(group);
            group = document.createElementNS(svgns, "g");
            groups.push(group);
            lastCode = -1;
            continue;
        }
        var char = defs_global.querySelector(fontId+code);
        if(!char) continue;     //char not found
        var useTag = document.createElementNS(svgns, "use");
        var id = fontId+code;
        useTag.setAttributeNS(xlinkns, "xlink:href", id);
        
        var combi = (lastCode<<16) | code;
        if(lastCode != -1 && kerningTable[combi])
        {
            x += kerningTable[combi] * scale * twip;
        }
        //TODO check is css transform is also needed
        useTag.setAttribute("transform", trans+x+","+y+")");
        group.appendChild(useTag);
        x += (advanceTable[code] * scale * twip) + kerning;
        
        lastCode = code;
        if(x > maxLineWidth)    maxLineWidth = x;
        if(x > maxWidth)        maxWidth = x;
    }
    if(group.parentNode == null){
        textField.appendChild(group);
         widths.push(maxLineWidth);
    } 
    maxHeight += ((descent*twip)*scale) + y;
    textField.setAttribute("width", maxWidth + "px");
    textField.setAttribute("height", maxHeight + "px");
    wrapper.appendChild(textField);
    
    if(align != "left")
    {
        if(align == "right")
        {
            for (var i = 0; i <  groups.length; i++) {
                 TweenLite.set(groups[i], {x:maxWidth - widths[i]}); 
            }
        }else if(align == "center" || align == "middle")
        {
            for (var i = 0; i <  groups.length; i++) {
                 TweenLite.set(groups[i], {x:(maxWidth - widths[i]) * 0.5}); 
            }
        }
    }

   if(parent){
   	if(wrapperSibling){
   		parent.insertBefore(wrapper, wrapperSibling);
   	}else{
   		parent.appendChild(wrapper);
   	}

   } else{
   	wrapper.parentNode.removeChild(wrapper);
   }
   console.log("vis", oldVisibile);
    wrapper.style.visible = oldVisibile;

    return wrapper;
}

function getFontSettings(font, fontSize, kerning, leadingOffset) {
    var scale = (1 / 1024) * fontSize;
    var twip = 1 / 20;

    var settings = {};
    var fontObj = fonts[font];

    settings.ascent = fontObj.ascent;
    settings.descent = fontObj.descent;
    settings.height = (settings.ascent + settings.descent) * twip;
    settings.offset = (1024 - settings.height) * scale;
    settings.leading = fontObj.leading * scale;

    var sx = 2,
        sy = 2;
    var y = sy + (settings.ascent * twip) * scale;
    var x = sx;

    settings.advanceTable = fontObj.advance;
    settings.kerningTable = fontObj.kerning;
    settings.fontId = "#f" + fontObj.id + "_";

    return settings;
}