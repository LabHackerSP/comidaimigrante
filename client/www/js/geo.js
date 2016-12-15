// Copyright 2015 Tero Karvinen http://TeroKarvinen.com

// debug

function d(s) {
	console.log(s);
	$("#status").text(s);
}

// map

function mapInit() {
	d("mapInit()");
	map = new L.Map('map'); // global
	$("#map").css( {"height": "200px"});

	url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	opt = {minZoom: 8, maxZoom: 12, attribution: "OSM"}
	var layer = new L.TileLayer(url, opt);

	map.addLayer(layer);
	map.setView(new L.LatLng(51.3, 0.7),9);
}

function mapPos(lat, lon) {
	d("mapPos()");
	map.panTo(new L.LatLng(lat, lon));
}

// geo

function geoWin(pos) {
	d("geoWin(): "+pos.coords.latitude+", "+pos.coords.longitude);
	mapPos(pos.coords.latitude, pos.coords.longitude);
}

function geoFail(error) {
	d("geoFail(): "+error.code+": "+error.message);
}

function startGeoWatch() {
	d("startGeoWatch()");
	opt = {timeout: 1000, enableHighAccuracy: true};
	watchGeo = navigator.geolocation.watchPosition(geoWin, geoFail, opt); // global
}

function stopGeoWatch() {
	d("stopGeoWatch()");
	navigator.geolocation.clearWatch(watchGeo);
}

// life cycle

function onPause() {
	d("onPause()");
	stopGeoWatch();
}

function onResume() {
	d("onResume()");
	startGeoWatch();
}

// init event listeners

function onDeviceReady() {
	d("onDeviceReady() - Cordova ready for hardware API calls");
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	startGeoWatch();
}

function onDocumentReady() {
	d("onDocumentReady() - DOM ready for jQuery");
	mapInit();
}

function main() {
	$(document).ready(onDocumentReady);
	document.addEventListener('deviceready', onDeviceReady, false);
}

// main & globals
var watchGeo=null;
var map=null;
main();


