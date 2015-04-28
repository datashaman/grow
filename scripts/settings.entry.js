/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	window.jQuery(document).ready(function($) {
	  var _, baseurl, initListGroup, refreshListGroup, store;
	  _ = window._;
	  baseurl = window.baseurl;
	  store = window.store;
	  refreshListGroup = function(tableView, input) {
	    var value;
	    $(tableView + ' .list-group-item').removeClass('active');
	    value = $(input).val();
	    if (value) {
	      return _.find($(tableView + ' .list-group-item').get(), function(cell) {
	        if ($(cell).html() === value) {
	          $(cell).addClass('active');
	          return true;
	        }
	      });
	    }
	  };
	  initListGroup = function(tableView, input, key, def) {
	    $(input).val(store.get(key, def));
	    refreshListGroup(tableView, input);
	    return $(tableView + ' .list-group-item').click(function() {
	      $(input).val($(this).html());
	      return refreshListGroup(tableView, input);
	    });
	  };
	  initListGroup('#select-climate', '#climate', 'climate', 'Dry Summer - Wet Winter');
	  return $('#settings').submit(function() {
	    var elements, values;
	    elements = $('#settings').serializeArray();
	    values = _.zipObject(_.map(elements, function(element) {
	      return [element.name, element.value];
	    }));
	    store(values);
	    window.location.href = baseurl + '/';
	    return false;
	  });
	});

	//# sourceMappingURL=settings.js.map

/***/ }
/******/ ]);