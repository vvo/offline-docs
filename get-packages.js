var fs = require('fs');
var path = require('path');
var Promise = require('es6-promise').Promise;

module.exports = getPackages;

function getPackages(baseDirectory, cb) {
  var nodeModules = path.join(baseDirectory, 'node_modules');

  read(nodeModules)
    .then(findPackages)
    .then(cb.bind(null, null))
    .catch(cb);
}

function read(directory) {
  return new Promise(function(resolve, reject) {
    fs.readdir(directory, function(err, files) {
      if (err) {
        return reject(err);
      }

      resolve(files.filter(noBin).map(absolutePath(directory)));
    })
  });
}

function findPackages(sources) {
  return new Promise(function(resolve, reject) {

    var searches = sources.map(searchPackageInfo);

    Promise
      .all(searches)
      .then(resolve)
      .catch(reject);
  })
}


function searchPackageInfo(packageDirectory) {
  return new Promise(function(resolve, reject) {
    fs.stat(packageDirectory, function(err, stat) {
      if(err) {
        return reject(err)
      }

      if (stat.isDirectory()) {
        fs.readdir(packageDirectory, function(err, packageFiles) {
          if (err) {
            return reject(err);
          }

          var pkg = packageInfo(packageFiles, packageDirectory);

          resolve(pkg);
        });
      }
    })
  });
}

function packageInfo(packageFiles, packageDirectory) {
  var packageInfo = {};

  packageFiles.forEach(function(fileName) {
    if (fileName === 'package.json') {
      packageInfo.name = require(path.join(packageDirectory, fileName)).name;
      packageInfo.version = require(path.join(packageDirectory, fileName)).version;
    }

    if (/readme\.m(ark)?d(own)?$/i.test(fileName)) {
      packageInfo.readme = path.join(packageDirectory, fileName);
    }
  });

  if (!packageInfo.name && !packageInfo.readme) {
    console.log(packageDirectory)
  }

  if (!packageInfo.name && packageInfo.readme) {
    packageInfo.name = path.basename(packageDirectory)
  }

  return packageInfo;
}

function absolutePath(directory) {

  return function(filePath) {
    return path.join(directory, filePath);
  }
}

function noBin(fileName) {
  return !/^\.bin$/.test(fileName);
}
