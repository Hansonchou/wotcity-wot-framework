/**
 *
 * WoT.City Open Source Project
 * 
 * Copyright 2015 Jollen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

 "use strict";

/**
 * Module dependencies.
 */

var coap = require('coap')
  , url = require("url")
  , EventEmitter = require('events').EventEmitter
  , util = require('util');

/**
 * Expose `CoapServer` constructor.
 */
if (typeof(module) != "undefined" && typeof(exports) != "undefined") {
  exports = module.exports = CoapServer;
}

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {Object} options
 * @api private
 */

function CoapServer(options) {
  // Superclass Constructor
  EventEmitter.call(this);

  options = options || {};
  this.clientsPath = [];
  this.host = options.host ? String(options.host) : 'localhost';
  this.port = options.port ? options.port : 8000;
  this.route = {};
  this.handlers = {};
}

util.inherits(CoapServer, EventEmitter);

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {Object} request
 * @param {Object} response
 * @api private
 */
CoapServer.prototype.onRequest = function(request, response) {
  this.emit('newThing', {
    name: request.url
  });
};

/**
 * Initialize a new `CoapServer` with the given `options`.
 *
 * @param {String} path
 * @param {Object} data
 * @api private
 */

CoapServer.prototype.dispatchData = function(path, data) {
  var connections = this.clientsPath[path];

  if (typeof(connections) === 'undefined')
    return;

  //console.log('Pushing [' + data + '] to ' + path);

  for (var i = 0; i < connections.length; i++) {
    connections[i].write(data);
  }
};

/**
 * Start websocket server.
 *
 * @param {Object} route
 * @return {}
 * @api public
 */

CoapServer.prototype.start = function(route, handlers) {
  var self = this;

  var server = coap.createServer().listen(this.port, function() {
      console.info('WoT/CoAP server is listening at coap://' + self.host + ':' + self.port);
  });

  var coapRequest = function(request, response) {
    self.onRequest(request, response);

    // `response` is an instance of OutgoingMessage
    var connection = {
      request: request,
      response: response,
      server: self
    };

    route(request.url, connection, handlers, self.clientsPath);
  };

  server.on('request', coapRequest);
};
