require.config({
	baseUrl: '../',
	packages: [{
		name: 'butterfly',
		location: 'butterfly/js',
		main: 'butterfly'
	}],
	paths: {
		// require.js plugins
		text: 'butterfly/vendor/requirejs-text/text',
		domReady: 'butterfly/vendor/requirejs-domready/domReady',
		i18n: 'butterfly/vendor/requirejs-i18n/i18n',
        json:'butterfly/vendor/requirejs-json/json',
		css: 'butterfly/vendor/require-css/css',
		view: 'butterfly/js/requirejs-butterfly',

		framework: 'butterfly',

		// lib
		jquery: 'butterfly/vendor/jquery/jquery',
		zepto: 'butterfly/vendor/zepto/zepto',
		underscore: 'butterfly/vendor/underscore/underscore',
		backbone: 'butterfly/vendor/backbone/backbone',
		fastclick: 'butterfly/vendor/fastclick/fastclick',
		iscroll: 'butterfly/vendor/iscroll/iscroll-zoom',
		moment: 'butterfly/vendor/moment/moment',
		spin: 'butterfly/vendor/spinjs/spin',
		swipe: 'butterfly/vendor/swipe/swipe',
		snap: 'butterfly/vendor/snap/snap',

		// components
		components: 'butterfly/js/components',
		listview: 'butterfly/js/components/listview',
		dialog: 'butterfly/js/components/dialog/dialog',
		calendar: 'butterfly/js/components/calendar/calendar',
		datepicker: 'butterfly/js/components/datepicker/js/date',
		notification: 'butterfly/js/components/notification',
		indicator: 'butterfly/js/components/indicator'
	},
	waitSeconds: 5,
	shim: {
		iscroll: {exports: 'IScroll'},
		fastclick: {exports: 'FastClick'}
	}
});

require(['domReady!', 'butterfly', 'iscroll', 'butterfly/fastclick'],
	function(domReady, Butterfly, IScroll, FastClick){

		//ios7 issue fix
		if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
  		$('html').addClass('ipad ios7');
		}
		//iOS scroll to top
		setTimeout(function() {window.scrollTo(0, 1);}, 0);


		//enable fastclick
		FastClick.attach(document.body);

		//this will stop the page from scrolling without IScroll
		// document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
});
