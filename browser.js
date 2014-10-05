var page = require('page');
var request = require('superagent');
var Vue = require('vue');
var packageList;

var main = new Vue({
  el: 'body',
  data: {
    list: false,
    detail: false,
    packages: [],
  }
});

page('/', function index() {
  request
    .get('/packages')
    .end(function(res) {
      main.list = true;
      main.detail = false;
      main.packages = res.body;
    });
});

page('/show/:packageName', function(ctx) {
  request
    .get('/package/' + ctx.params.packageName)
    .end(function(res) {
      main.detail = res.body.readme;
      main.list = false;
    })
});

page();


