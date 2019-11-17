// === where is main
var mainIsGlobal = false;//true; /// if TRUE... main.js is loaded from the 'campaignDir' dynamic directory. If FALSE... main.js is loaded from 'assetDir' dynamic directory

// ===== Tracker - set at the start 
var useTracker = false;//false;
var CAMPAIGN = '2019_BQ_CONVERT_TEST';  // ONLY SET THIS if the base project type changes E.g. PROJECTS or BAU
var CLIENT = 'BQ'; //client table name - dont change
var LANG = 'UK';

var EXTRAS = ""; //this can be any additional info you want to track

var TYPE = dc ? dc['reporting_label'] : ""; /* var dc - DO NOT CHANGE - this is the var we assign doubleclick 'dynamicContent' object to - SET IN THE index.html FIXED ASSET and should not be changed */

//Enabler.setDevDynamicContent(devDynamicContent);
var dynamicExit = dc ? dc['exit_URL'].Url : "";
var BackgroundExit = dc ? dc['exit_URL'].Url : ""; // used in older kitchens creative
var useDynamicExit = true;
var defaultExitURL = (useDynamicExit) ? dynamicExit : "https://www.diy.com";
//if(isLocal)	dc = dynamicContent[profileName][0];//use dc.varName in main.js to reference the values from the dynamic content object

var assetDir = "dir_assets";// this string must match the name of the ad-based assets directory field in the profile
var statics = "static_filename"
var productDir = "dir_products";
var campaignDir = "dir_campaign";
var configDir = "config"
var css_path;
var html_path;

var scriptsArr = [];
	scriptsArr.push("https://s0.2mdn.net/ads/studio/cached_libs/tweenmax_1.19.0_643d6911392a3398cb1607993edabfa7_min.js"); 
if (useTracker) scriptsArr.push(getGlobalAssetPath("fbf_tr.js")); 

////// END SETUP ///////////////////////////////////////////////////////////////////////////////////

var root0 = $('root');
if (root0 != null)
{
	root0.id = "root0";
	root0.style.display="block";
	document.body.style.margin = "0px";
}
var _rootPath = "../";
function getAsset(filename, overrideFile)	//overrideFile is to mimic dc dyn pointing to an explicit file
{
	var path = filename.split("/");
	if(fbf.isLocal())
	{
		if(overrideFile) path.push(overrideFile);
		//console.log("path in", path);
		switch(path[0])
		{
			case "dir_assets":
				var folder = location.search.substring(1);
				if(!folder || folder.length == 0 ) alert("please specify size with query sting i.e: '?300x250'");
				path[0] = folder;//"300x250";		//TODO: query string
				break;
			case "dir_global":
				path[0] = "_global";
				break;
			case "asset_config":
				path[0] = "_configs";
				break;
		   case "asset_intro":
				path[0] = "_introvids";
				break;			
	       case "asset_video":
				path[0] = "_videos";
				break;
			default:
				return _rootPath + filename;
				break;

		}
		//console.log("path out", path);
		return path.join("/");
	}else{
		if(path.length == 1)
		{
			return dc[path[0]].Url;
		}else if(path.length == 2)
		{
			return dc[path[0]][path[1]].Url;
		}else if(path.length == 3)
		{
			return dc[path[0]][path[1]][path[2]].Url;
		}else{
			return "";
		}
	}

}


//kick off a series of Enabler checks  
Enabler.isInitialized() ? onDCinitialised() : Enabler.addEventListener(studio.events.StudioEvent.INIT, onDCinitialised);

function onDCinitialised(){
		timedLog("BOOTSTRAP INIT");
		Enabler.isPageLoaded() ? onDCpageLoaded() : Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, onDCpageLoaded);
}
function onDCpageLoaded(){
	timedLog("BOOTSTRAP LOADED");
	Enabler.isVisible() ? onDCadVisible() : Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, onDCadVisible);
}
function onDCadVisible(){
	timedLog("BOOTSTRAP VISIBLE");
	loadJS(getGlobalAssetPath("fbf.js"), onFbFloaded);	
}

function onFbFloaded(){
	timedLog("FBF LOADED");
	log("FbF loaded");
	console.log(dc,WID,HEI);
	if (dc && dc['is_default'] == true && dc[assetDir]['backup.js'] != undefined)
	{
		//if row is set to be default AND backup.js is in the assigned asset folder - only load the backup
		loadBackup();
	} else {
		//otherwise load full ad assets
		
		seeIfWeAreStaticOrNormalBanners();
	}
	
}

function seeIfWeAreStaticOrNormalBanners()
{
	/* check if static image contains content then go the static route else continue with standard get asset way */
	if(dc['is_static'] == true)
	{
		timedLog("----------STATIC CREATIVE");
		loadTheStaticStuff(dc[statics])
	}
	else
	{
		injectLoadedAdAssets();
	}
}

function loadTheStaticStuff(staticToLoad)
{
	console.log("loadTheStaticStuff");
	console.log(staticToLoad);
	console.log(staticToLoad.Url);
	if(staticToLoad.Url != undefined)
	{
		renderStaticCreative(staticToLoad.Url)
	} else {
		timedLog("----------STATIC NOT DEFINED IN SHEET")
	}
	//console.log();
}

function renderStaticCreative(staticImageToUse)
{
	timedLog(staticImageToUse);
	var static_image_to_use = staticImageToUse.replace("http://", "https://");
	var container = $('root') || $('content_dc');
	var WID = window.innerWidth;
	var HEI = window.innerHeight;

	var divToWrite = '<img src="'+ static_image_to_use +'" width="'+ WID +'" height="'+ HEI +'">';
 
    container.innerHTML = divToWrite; // writing css for root div	
    container.style.overflow = "hidden";
    container.style.position = "absolute";
    //container.style.width = WID - 2 + "px";
    //container.style.height = HEI - 2 + "px";
    container.style.top = "0px";
    container.style.left = "0px";
    container.style.margin = "auto";
    container.style.display = "none";
    //container.style.border = "1px solid #666666";

    container.addEventListener("click", staticHandleClick);
    container.style.cursor = 'pointer';
    container.style.display = "block";

    var inApp = studio.common.Environment.hasType(studio.common.Environment.Type.IN_APP); 
    if(!inApp &&  WID==320 && HEI==50) { /*container.style.top = "430px";*/}
    if(!inApp &&  WID==728 && HEI==90) { /*container.style.left = "18px";*/}
}

function staticHandleClick(event) 
{
        var target = event.target || event.srcElement;
        log("handleClick:" + target.id);
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true; //log("main click", window.clickTag);
        Enabler.exitOverride('default', defaultExitURL);
        if(useTracker) trackClick(event.clientX, event.clientY, 'default', defaultExitURL);
} 

// all good - let's go!
function injectLoadedAdAssets(){
	log("FBF LOADED");
	///IF USING INDEX.HTML.GZ.JS USE THIS ------------------------
	//html_path = getAsset("dir_assets/index.html.gz.js"); 
	//fbf.loadModule(html_path, true, onHTMLLoaded);
	///IF USING INDEX.HTML USE THIS ------------------------
	html_path = getAsset("dir_assets/index.html");
	    fbf.loadModule(html_path, false, onHTMLLoaded);
	    timedLog("LOADING MAHAINE MODULE");
}


//inject loaded ad index... load main.js and start ad
function onHTMLLoaded(data)
{
	timedLog("MODULE LOADED");
	var defs = extractDefs(data);
	var scriptAd = extractScript("script_util", data);
	var scriptFonts = extractScript("script_font", data);
	var scriptDom = extractScript("script_dom", data);

	scriptDom = fixImages(scriptDom);

	if(scriptAd)	buildScript(scriptAd);
	if(scriptFonts)	buildScript(scriptFonts);
	if(scriptDom)	buildScript(scriptDom);
	buildDom($("content_dc"));

	//relink css images
	var styles = document.getElementsByTagName("style");
	for (var i = 0; i < styles.length; i++) {
		//styles[i].magic
	}

	timedLog("MODULE BUOILT");
	scriptsArr.push(getAsset("dir_assets/main.js"));
	loadJS(scriptsArr, function(){startBanner();}); //startBanner should be a function on main.js
	return;//
	var html = html.substring(html.indexOf('<div id="root"'), html.indexOf('<noscript>')); //+"<noscript>".length);
    $("content_dc").innerHTML = html;

    (mainIsGlobal) ? scriptsArr.push(getCampaignAssetPath("main.js")) : scriptsArr.push(getAssetPath("main.js"));
	loadJS(scriptsArr, function(){startBanner();}); //startBanner should be a function on main.js
}
function fixImages(script)
{
	var re = new RegExp(/url\('(.*?g)'\)/, 'g');
	var result = script.replace(re, function(match, group) {
	 return match.split(group).join(getAsset("dir_assets/"+group));
	});
	return result;
}
function buildScript(script)
	{
		var oScript = document.createElement("script");
		var oScriptText = document.createTextNode(script);
		oScript.appendChild(oScriptText);
		document.head.appendChild(oScript)
	}
	function extractScript(id, source)
	{
		var indexScriptDomA = 	source.indexOf("<script id=\""+id+"\"");
		indexScriptDomA = 		source.indexOf(">", indexScriptDomA)+1;
		var indexScriptDomB = 	source.indexOf("</script>", indexScriptDomA);
		var scriptDom = 		source.substring(indexScriptDomA, indexScriptDomB);
		return scriptDom;
	}
	function extractDefs(source)
	{
		var indexA = 	source.indexOf("<defs id=\"defs_global\">");
		if(indexA == -1)	return null;	//no svg defs found in html so return null
		var indexB = 	source.indexOf("</defs>", indexA) + 7;
		var result = 	source.substring(indexA, indexB);

		var parser = 	new DOMParser();
		var doc = 		parser.parseFromString(result, "image/svg+xml");
		var defs = 		doc.firstElementChild;
		var ns =		window.moduleIndex ? "m" + window.moduleIndex : "";

		var defs_global = $("defs_global");
		var first = defs.firstElementChild;
		while(first)
		{
			first.id = ns+first.id;
			defs_global.appendChild(first);
			first = defs.firstElementChild;
		}
		return doc;
	}
function loadBackup()
{
	scriptsArr.push(getAsset("dir_assets/backup.js"));
	loadJS(scriptsArr, function(){startDefault();});	//startDefault function is on backup.js
}

			
function $(id)
{
	if (arguments.length > 1)
	{
		var elements = [];
		for (var i = 0; i < arguments.length; i++)	elements.push($(arguments[i]));
		return elements;
	}else{
		var element = document.getElementById(id);
		return element;
	}
}

