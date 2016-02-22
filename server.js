var express = require('express');
var app = express();
var path = require('path');
var httpProxy = require('http-proxy');

//代理到长安服务器
var proxy = new httpProxy.createProxyServer({
	target: {
		host: '61.186.243.102',
		port: 80
	}
});
//代理中间件，只代理url包含/cameap的请求
app.use(function(req, res, next) {
	if (req.url.match(new RegExp('^\/appcv\/'))) {
		console.log('proxy to: 61.186.243.102');
		proxy.web(req, res);
	} else {
		next();
	}
});

app.use(express.static(path.resolve('.')));

app.get('/', function(req, res) {
	res.redirect('/main/appIndex.html');
});


app.listen(process.env.PORT || 8003);
console.log('i am up.');
