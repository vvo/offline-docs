module.exports = function(packages) {
  var compression = require('compression');
  var express = require('express');
  var fs = require('fs');
  var marked = require('marked');
  var path = require('path');
  var serveStatic = require('serve-static');
  var staticFiles = serveStatic(path.join(__dirname, 'site'));

  var renderer = new marked.Renderer();

  marked.setOptions({
    gfm: true,
    renderer: renderer,
    highlight: function (code) {
      return require('highlight.js').highlightAuto(code).value;
    }
  });

  renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return '<h' + level + '><a name="' +
                  escapedText +
                   '" class="anchor" href="#' +
                   escapedText +
                   '"><span class="octicon octicon-link"></span></a>' +
                    text + '</h' + level + '>';
  };

  var app = express();
  app.use(compression());
  app.use('/', staticFiles);
  app.use('/show/*', staticFiles);

  var packagesList = packages.map(function(packageInfo) {
    return {
      name: packageInfo.name,
      version: packageInfo.version
    }
  });

  app.get('/packages', function(req, res) {
    res.send(packagesList);
  });

  packages.forEach(function(packageInfo) {
    packageInfo.readme = marked(fs.readFileSync(packageInfo.readme, 'utf8'));
    app.get('/package/' + packageInfo.name, function(req, res) {
      res.send(packageInfo);
    });
  });

  app.get('/css/highlight.js.:style.css', function(req, res) {
    var style = path.join(__dirname, 'node_modules', 'highlight.js', 'styles', req.params.style + '.css');
    fs.createReadStream(style).pipe(res);
  })

  return app;
}

