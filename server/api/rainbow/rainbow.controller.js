/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  multiparty = require('multiparty');

exports.uploadFile = uploadFile;

function uploadFile (req, res, next) {
  //生成multiparty对象，并配置下载目标路径
  var form = new multiparty.Form({uploadDir: './public/files/'});
  //下载后处理
  form.parse(req, function (err, fields, files) {
    var filesTmp = JSON.stringify(files, null, 2);

    if (err) {
      console.log('parse error: ' + err);
    } else {
      console.log('parse files: ' + filesTmp);
      var inputFile = files.file[0];
      var uploadedPath = inputFile.path;
      //var dstPath = './public/files/' + inputFile.originalFilename;

      var newBaseName = getRandomFileName(inputFile.originalFilename);
      var ext = path.extname(inputFile.originalFilename);

      var dstPath = './public/files/' + newBaseName + ext;
      //重命名为真实文件名
      fs.rename(uploadedPath, dstPath, function (err) {
        if (err) {
          console.log('rename error: ' + err);
        } else {
          console.log('rename ok');
        }
      });
    }

    //res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
    //res.write('received upload:\n\n');
    //res.end(JSON.stringify({receipt: newBaseName}));
    res.json({receipt: newBaseName});
  });
}

function getRandomFileName(originalFilename) {
  return String(Math.random()).substr(2);
}
