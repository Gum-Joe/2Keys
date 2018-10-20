var ProgressBar = require('progress');
var https = require('https');

var req = https.request({
  host: 'download.github.com',
  port: 443,
  path: '/HotKeyIt/ahkdll-v2-release/archive/master.zip'
});

req.on('response', function (res) {
  var len = parseInt(res.headers['content-length'], 10);

  console.log();
  var bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: len
  });

  res.on('data', function (chunk) {
    bar.tick(chunk.length);
  });

  res.on('end', function () {
    console.log('\n');
  });
});

req.end();