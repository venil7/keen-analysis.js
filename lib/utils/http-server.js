var https = require('https'),
    url = require('url');

var serialize = require('keen-core/lib/utils/serialize');

module.exports = {
  'GET'    : handleRequest,
  'POST'   : handleRequest,
  'PUT'    : handleRequest,
  'DELETE' : handleRequest
};

function handleRequest(config, callback){
  var parsedUrl = url.parse(config.url),
      data,
      options,
      req;

  options = {
    host: parsedUrl['hostname'],
    path: parsedUrl.path,
    method: config['method']
  };

  if (config['method'] === 'GET') {
    data = '';
    options.path += '?api_key=' + config.api_key;
    if (config.params) {
      options.path += '&' + serialize(config.params);
    }
  }
  else {
    data = config.params ? JSON.stringify(config.params) : '';
    options['headers'] = {
      'Authorization': config.api_key,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
  }

  req = https.request(options, function(res) {
    var body = '';
    res.on('data', function(d) {
      body += d;
    });
    res.on('end', function() {
      var res = JSON.parse(body), error;
      if (res.error_code) {
        error = new Error(res.message || 'Unknown error occurred');
        error.code = res.error_code;
        callback(error, null);
      }
      else {
        callback(null, res);
      }
    });
  });

  req.on('error', callback);
  // if (data) {
  //   console.log('data', data);
  //
  // }
  // else {
  //   req.write();
  // }
  req.write(data);
  req.end();
}
