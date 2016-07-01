/**
 * Created by JounQin on 16/7/1.
 */
'use strict';

var Transform = require('readable-stream/transform'),
    rs = require('replacestream'),
    xml2js = require('xml2js');

var DEFAULT_OPTIONS = {outType: true};

module.exports = function (options) {

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    return new Transform({
        objectMode: true,
        transform: function (file, enc, callback) {
            if (file.isNull()) {
                return callback(null, file);
            }

            function process() {
                if (file.isStream()) {
                    file.contents = file.contents.pipe(rs());
                    return callback(null, file);
                }

                if (file.isBuffer()) {
                    return new xml2js.Parser(options.parserOpts)
                        .parseString(file.contents, function (err, result) {
                            
                            result = options.outType
                                ? new xml2js.Builder(options.buildOpts).buildObject(result) : JSON.stringify(result);

                            options.callback && (result = options.callback(result) || result);

                            file.contents = new Buffer(result);
                            
                            callback(null, file);
                        });
                }

                callback(null, file);
            }

            process();
        }
    });
};