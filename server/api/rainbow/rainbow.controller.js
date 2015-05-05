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
  multiparty = require('multiparty'),
  ImageJS = require("imagejs"),
  Bitmap = ImageJS.Bitmap;

exports.uploadFile = uploadFile;

function uploadFile(req, res, next) {
  //生成multiparty对象，并配置下载目标路径
  var form = new multiparty.Form({uploadDir: './public/files/'});
  //下载后处理
  form.parse(req, function (err, fields, files) {
    var filesTmp = JSON.stringify(files, null, 2);

    if (err) {
      console.log('parse error: ' + err);
    } else {
      //console.log('parse files: ' + filesTmp);
      var inputFile = files.file[0];
      var uploadedPath = inputFile.path;
      //var dstPath = './public/files/' + inputFile.originalFilename;

      var newBaseName = getRandomFileName(inputFile.originalFilename);
      var ext = path.extname(inputFile.originalFilename);
      var newFileName = newBaseName + ext;

      var dstPath = './public/files/' + newFileName;
      //重命名为真实文件名
      fs.rename(uploadedPath, dstPath, function (err) {
        if (err) {
          console.log('rename error: ' + err);
          res.status(500).end();
        } else {
          console.log('rename ok');

          //res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
          //res.write('received upload:\n\n');
          //res.end(JSON.stringify({receipt: newBaseName}));
          console.log('rainbowCount: ' + fields.rainbowCount[0]);
          convertToRainbow(newFileName, fields.rainbowCount[0], function(err, data){
            if (err) {
              res.status(500).end();
            } else {
              var result = data.filter(function(item){
                return item.clusterInd.length !== 0;
              }).sort(function(a, b){
                var lengthOfA = a.clusterInd.length;
                var lengthOfB = b.clusterInd.length;

                if (lengthOfA > lengthOfB) {
                  return -1;
                } else if (lengthOfA === lengthOfB) {
                  return 0;
                } else {
                  return 1;
                }
              }).map(function(item){
                return [Math.round(item.centroid[0]),
                  Math.round(item.centroid[1]),
                  Math.round(item.centroid[2])]
                //return item.centroid;
              });
              res.json(result);
            }
          });
        }
      });
    }
  });
}

function getRandomFileName(originalFilename) {
  return String(Math.random()).substr(2);
}

function convertToRainbow(fileName, rainbowCount, callback) {
  // read JPG data from stream
  var stream = fs.createReadStream('./public/files/' + fileName);
  var bitmap = new Bitmap();
  bitmap.read(stream, {type: ImageJS.ImageType.JPG})
    .then(function () {
      // bitmap is ready

      var width = bitmap.width,
        height = bitmap.height,
        color = {},
        vectors = [],
        kmeans = require('node-kmeans');

      console.log('准备开始读取图片');
      for(var x = 0; x < width; x++) {
        for(var y = 0; y < height; y++) {
          bitmap.getPixel(x, y, color);
          vectors.push([color.r, color.g, color.b]);
        }
      }

      console.log('准备开始 k-means 运算');
      if (rainbowCount > width * height) {
        // 防止出现 The number of points must be greater than the number k of clusters 错误。
        rainbowCount = width * height;
      }
      kmeans.clusterize(vectors, {k: rainbowCount}, function (err, res) {
        if (err) {
          console.error(err);
          callback(err);
        }
        else{
          console.log('k-means 运算结束');
          //console.log('%o', res);
          callback(null, res);
        }
      });
    });
}
