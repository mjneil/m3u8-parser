/*! @name m3u8-parser @version 4.2.0 @license Apache-2.0 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _exp = {
  // Basic Tags
  M3U: /^#EXTM3U/,
  VERSION: /^#EXT-X-VERSION:?([0-9.]*)?/,
  // Media Segment Tags
  INF: /^#EXTINF:?([0-9\.]*)?,?(.*)?$/,
  BYTERANGE: /^#EXT-X-BYTERANGE:?([0-9.]*)?@?([0-9.]*)?/,
  DISCONTINUITY: /^#EXT-X-DISCONTINUITY$/,
  KEY: /^#EXT-X-KEY:?(.*)$/,
  MAP: /^#EXT-X-MAP:?(.*)$/,
  PROGRAM_DATE_TIME: /^#EXT-X-PROGRAM-DATE-TIME:?(.*)$/,
  // Media Playlist Tags
  TARGETDURATION: /^#EXT-X-TARGETDURATION:?([0-9.]*)?/,
  MEDIA_SEQUENCE: /^#EXT-X-MEDIA-SEQUENCE:?(\-?[0-9.]*)?/,
  DISCONTINUITY_SEQUENCE: /^#EXT-X-DISCONTINUITY-SEQUENCE:?(\-?[0-9.]*)?/,
  ENDLIST: /^#EXT-X-ENDLIST/,
  PLAYLIST_TYPE: /^#EXT-X-PLAYLIST-TYPE:?(.*)?$/,
  START: /^#EXT-X-START:?(.*)$/,
  // Master Playlist Tags
  MEDIA: /^#EXT-X-MEDIA:?(.*)$/,
  STREAM_INF: /^#EXT-X-STREAM-INF:?(.*)$/
};

/**
 * "forgiving" attribute list psuedo-grammar:
 * attributes -> keyvalue (',' keyvalue)*
 * keyvalue   -> key '=' value
 * key        -> [^=]*
 * value      -> '"' [^"]* '"' | [^,]*
 */
var attributeSeparator = function attributeSeparator() {
  var key = '[^=]*';
  var value = '"[^"]*"|[^,]*';
  var keyvalue = '(?:' + key + ')=(?:' + value + ')';
  return new RegExp('(?:^|,)(' + keyvalue + ')');
};
/**
 * Parse attributes from a line given the separator
 *
 * @param {string} attributes the attribute line to parse
 */

var parseAttributes = function parseAttributes(attributes) {
  // split the string using attributes as the separator
  var attrs = attributes.split(attributeSeparator());
  var result = {};
  var i = attrs.length;
  var attr;

  while (i--) {
    // filter out unmatched portions of the string
    if (attrs[i] === '') {
      continue;
    } // split the key and value


    attr = /([^=]*)=(.*)/.exec(attrs[i]).slice(1); // trim whitespace and remove optional quotes around the value

    attr[0] = attr[0].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^['"](.*)['"]$/g, '$1');
    result[attr[0]] = attr[1];
  }

  return result;
};

var _parsers = {
  // Basic Tags
  M3U: function M3U(tag, match) {
    return tag;
  },
  VERSION: function VERSION(tag, match) {
    if (match[1]) {
      tag.version = parseInt(match[1], 10);
    }

    return tag;
  },
  // Media Segment Tags
  INF: function INF(tag, match) {
    if (match[1]) {
      tag.duration = parseFloat(match[1]);
    }

    if (match[2]) {
      tag.title = match[2];
    }

    return tag;
  },
  BYTERANGE: function BYTERANGE(tag, match) {
    if (match[1]) {
      tag.length = parseInt(match[1], 10);
    }

    if (match[2]) {
      tag.offset = parseInt(match[2], 10);
    }

    return tag;
  },
  DISCONTINUITY: function DISCONTINUITY(tag, match) {
    return tag;
  },
  KEY: function KEY(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]); // parse the IV string into a Uint32Array

      if (tag.attributes.IV) {
        if (tag.attributes.IV.substring(0, 2).toLowerCase() === '0x') {
          tag.attributes.IV = tag.attributes.IV.substring(2);
        }

        tag.attributes.IV = tag.attributes.IV.match(/.{8}/g);
        tag.attributes.IV[0] = parseInt(tag.attributes.IV[0], 16);
        tag.attributes.IV[1] = parseInt(tag.attributes.IV[1], 16);
        tag.attributes.IV[2] = parseInt(tag.attributes.IV[2], 16);
        tag.attributes.IV[3] = parseInt(tag.attributes.IV[3], 16);
        tag.attributes.IV = new Uint32Array(tag.attributes.IV);
      }
    }

    return tag;
  },
  MAP: function MAP(tag, match) {
    if (match[1]) {
      var attributes = parseAttributes(match[1]);

      if (attributes.URI) {
        tag.uri = attributes.URI;
      }

      if (attributes.BYTERANGE) {
        var _attributes$BYTERANGE = attributes.BYTERANGE.split('@'),
            length = _attributes$BYTERANGE[0],
            offset = _attributes$BYTERANGE[1];

        tag.byterange = {};

        if (length) {
          tag.byterange.length = parseInt(length, 10);
        }

        if (offset) {
          tag.byterange.offset = parseInt(offset, 10);
        }
      }
    }

    return tag;
  },
  PROGRAM_DATE_TIME: function PROGRAM_DATE_TIME(tag, match) {
    if (match[1]) {
      tag.dateTimeString = match[1];
      tag.dateTimeObject = new Date(match[1]);
    }

    return tag;
  },
  // Media Playlist Tags
  TARGETDURATION: function TARGETDURATION(tag, match) {
    if (match[1]) {
      tag.duration = parseInt(match[1], 10);
    }

    return tag;
  },
  MEDIA_SEQUENCE: function MEDIA_SEQUENCE(tag, match) {
    if (match[1]) {
      tag.number = parseInt(match[1], 10);
    }

    return tag;
  },
  DISCONTINUITY_SEQUENCE: function DISCONTINUITY_SEQUENCE(tag, match) {
    if (match[1]) {
      tag.number = parseInt(match[1], 10);
    }

    return tag;
  },
  ENDLIST: function ENDLIST(tag, match) {
    return tag;
  },
  PLAYLIST_TYPE: function PLAYLIST_TYPE(tag, match) {
    if (match[1]) {
      tag.playlistType = match[1];
    }

    return tag;
  },
  START: function START(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);
      tag.attributes['TIME-OFFSET'] = parseFloat(tag.attributes['TIME-OFFSET']);
      tag.attributes.PRECISE = /YES/.test(tag.attributes.PRECISE);
    }

    return tag;
  },
  // Master Playlist Tags
  MEDIA: function MEDIA(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);
    }

    return tag;
  },
  STREAM_INF: function STREAM_INF(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);

      if (tag.attributes.RESOLUTION) {
        var split = tag.attributes.RESOLUTION.split('x');
        var resolution = {};

        if (split[0]) {
          resolution.width = parseInt(split[0], 10);
        }

        if (split[1]) {
          resolution.height = parseInt(split[1], 10);
        }

        tag.attributes.RESOLUTION = resolution;
      }

      if (tag.attributes.BANDWIDTH) {
        tag.attributes.BANDWIDTH = parseInt(tag.attributes.BANDWIDTH, 10);
      }

      if (tag.attributes['PROGRAM-ID']) {
        tag.attributes['PROGRAM-ID'] = parseInt(tag.attributes['PROGRAM-ID'], 10);
      }
    }

    return tag;
  }
};

var tagList = {
  M3U: function M3U(playlist, tag) {
    return playlist;
  },
  VERSION: function VERSION(playlist, tag) {
    playlist.version = tag.version || 1;
    return playlist;
  },
  COMMENT: function COMMENT(playlist, tag) {
    playlist.comments.push(tag);
    return playlist;
  },
  UNKOWN: function UNKOWN(playlist, tag) {
    playlist.unknown.push(tag);
    return playlist;
  }
};
var parse = function parse(tags) {
  var basicTags = tags.filter(function (tag) {
    return !!tagList[tag.key];
  });
  return basicTags.reduce(function (playlist, tag) {
    return tagList[tag.key](playlist, tag);
  }, {
    comments: [],
    unknown: []
  });
};

var tagList$1 = {
  INF: function INF(playlist, segment, tag) {
    if (typeof tag.duration === 'undefined') {
      tag.duration = playlist.targetDuration;
    }

    segment.duration = tag.duration || 0.01;
    return playlist;
  },
  BYTERANGE: function BYTERANGE(playlist, segment, tag) {
    if ('length' in tag) {
      segment.byterange = {
        length: tag.length,
        offset: tag.offset || 0
      };
    }

    return playlist;
  },
  DISCONTINUITY: function DISCONTINUITY(playlist, segment, tag) {
    segment.discontinuity = true;
    segment.timeline++;
    playlist.discontinuityStarts.push(playlist.segments.length - 1);
    return playlist;
  },
  KEY: function KEY(playlist, segment, tag) {
    if (!tag.attributes) {
      return playlist;
    }

    if (tag.attributes.METHOD === 'NONE') {
      delete segment.key;
      return playlist;
    }

    segment.key = {
      method: tag.attributes.METHOD || 'AES-128',
      uri: tag.attributes.URI
    };

    if (typeof tag.attributes.IV !== 'undefined') {
      segment.key.iv = tag.attributes.IV;
    }

    return playlist;
  },
  MAP: function MAP(playlist, segment, tag) {
    segment.map = {
      uri: tag.uri,
      byterange: tag.byterange
    };
    return playlist;
  },
  PROGRAM_DATE_TIME: function PROGRAM_DATE_TIME(playlist, segment, tag) {
    if (typeof playlist.dateTimeString === 'undefined') {
      // PROGRAM-DATE-TIME is a media-segment tag, but for backwards
      // compatibility, we add the first occurence of the PROGRAM-DATE-TIME tag
      // to the manifest object
      // TODO: Consider removing this in future major version
      playlist.dateTimeString = tag.dateTimeString;
      playlist.dateTimeObject = tag.dateTimeObject;
    }

    segment.dateTimeString = tag.dateTimeString;
    segment.dateTimeObject = tag.dateTimeObject;
    return playlist;
  },
  URI: function URI(playlist, segment, tag) {
    if (playlist.targetDuration && !segment.duration) {
      segment.duration = playlist.targetDuration;
    }

    segment.uri = tag.uri;
    return playlist;
  }
};
var parse$1 = function parse(playlist, tags, extensions) {
  playlist.segments = [];
  playlist.discontinuityStarts = [];
  var segmentTags = tags.filter(function (tag) {
    return !!tagList$1[tag.key];
  });
  segmentTags.forEach(function (tag) {
    if (playlist.segments.length === 0) {
      playlist.segments.push({
        timeline: playlist.discontinuitySequence
      });
    }

    var segmentIndex = playlist.segments.length - 1;
    var segment = playlist.segments[segmentIndex];

    if (segment.uri) {
      var key = segment.key;
      var map = segment.map;
      segment = {
        timeline: segment.timeline
      };

      if (key) {
        segment.key = key;
      }

      if (map) {
        segment.map = map;
      }

      playlist.segments.push(segment);
    }

    return tagList$1[tag.key](playlist, segment, tag);
  });
  return playlist;
};

var tagList$2 = {
  TARGETDURATION: function TARGETDURATION(playlist, tag) {
    if (!isFinite(tag.duration) || tag.duration < 0) {
      throw new Error('invalid taget duration');
    }

    playlist.targetDuration = tag.duration;
    return playlist;
  },
  MEDIA_SEQUENCE: function MEDIA_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw new Error('invalid media sequence');
    }

    playlist.mediaSequence = tag.number;
    return playlist;
  },
  DISCONTINUITY_SEQUENCE: function DISCONTINUITY_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw new Error('invalid discontinuity sequence');
    }

    playlist.discontinuitySequence = tag.number;
    return playlist;
  },
  ENDLIST: function ENDLIST(playlist) {
    playlist.endList = true;
    return playlist;
  },
  PLAYLIST_TYPE: function PLAYLIST_TYPE(playlist, tag) {
    if (!/VOD|EVENT/.test(tag.playlistType)) {
      return playlist;
    }

    playlist.playlistType = tag.playlistType;
    return playlist;
  },
  START: function START(playlist, tag) {
    if (!tag.attributes || isNaN(tag.attributes['TIME-OFFSET'])) {
      return playlist;
    }

    playlist.start = {
      timeOffset: tag.attributes['TIME-OFFSET'],
      precise: tag.attributes.PRECISE
    };
    return playlist;
  }
};
var parse$2 = function parse$$1(playlist, tags, extensions) {
  playlist.mediaSequence = 0;
  playlist.discontinuitySequence = 0;
  var mediaTags = tags.filter(function (tag) {
    return !!tagList$2[tag.key];
  });
  mediaTags.forEach(function (tag) {
    return tagList$2[tag.key](playlist, tag);
  });
  return parse$1(playlist, tags, extensions);
};

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var tagList$3 = {
  MEDIA: function MEDIA(playlist, tag) {
    if (!(tag.attributes && tag.attributes.TYPE && tag.attributes['GROUP-ID'] && tag.attributes.NAME)) {
      return playlist;
    } // find the media group, creating defaults as necessary


    var mediaGroupType = playlist.mediaGroups[tag.attributes.TYPE];
    mediaGroupType[tag.attributes['GROUP-ID']] = mediaGroupType[tag.attributes['GROUP-ID']] || {};
    var mediaGroup = mediaGroupType[tag.attributes['GROUP-ID']]; // collect the rendition metadata

    var rendition = {
      default: /yes/i.test(tag.attributes.DEFAULT)
    };

    if (rendition.default) {
      rendition.autoselect = true;
    } else {
      rendition.autoselect = /yes/i.test(tag.attributes.AUTOSELECT);
    }

    if (tag.attributes.LANGUAGE) {
      rendition.language = tag.attributes.LANGUAGE;
    }

    if (tag.attributes.URI) {
      rendition.uri = tag.attributes.URI;
    }

    if (tag.attributes['INSTREAM-ID']) {
      rendition.instreamId = tag.attributes['INSTREAM-ID'];
    }

    if (tag.attributes.CHARACTERISTICS) {
      rendition.characteristics = tag.attributes.CHARACTERISTICS;
    }

    if (tag.attributes.FORCED) {
      rendition.forced = /yes/i.test(tag.attributes.FORCED);
    } // insert the new rendition


    mediaGroup[tag.attributes.NAME] = rendition;
    return playlist;
  },
  STREAM_INF: function STREAM_INF(playlist, tag) {
    playlist.streams.push({});
    var len = playlist.streams.length;
    var stream = playlist.streams[len - 1];

    if (!stream.attributes) {
      stream.attributes = {};
    }

    _extends(stream.attributes, tag.attributes);

    return playlist;
  },
  URI: function URI(playlist, tag) {
    var len = playlist.streams.length;

    if (len === 0) {
      playlist.streams.push({});
      len++;
    }

    var stream = playlist.streams[len - 1];
    stream.uri = tag.uri;
    return playlist;
  }
};
var parse$3 = function parse(playlist, tags, extensions) {
  playlist.mediaGroups = {
    'AUDIO': {},
    'VIDEO': {},
    'CLOSED-CAPTIONS': {},
    'SUBTITLES': {}
  };
  playlist.streams = [];
  var masterTags = tags.filter(function (tag) {
    return !!tagList$3[tag.key];
  });
  masterTags.forEach(function (tag) {
    return tagList$3[tag.key](playlist, tag);
  });
  return playlist;
};

var isMaster = function isMaster(tags) {
  var master = tags.filter(function (tag) {
    return tag.key === 'STREAM_INF';
  }).length;
  var media = tags.filter(function (tag) {
    return tag.key === 'INF';
  }).length;

  if (master && media) {
    throw new Error('master and media');
  }

  if (!master && !media) {
    throw new Error('unknown');
  }

  return master;
};

var parseLine = function parseLine(extensions, flags) {
  return function (line, index) {
    // URI
    if (line[0] !== '#') {
      return {
        key: 'URI',
        uri: line
      };
    } // comments


    if (line.indexOf('#EXT') !== 0) {
      return {
        key: 'COMMENT',
        text: line.slice(1)
      };
    } // Add extensions to parsers/expressions


    var parsers = _parsers;
    var exp = _exp;

    for (var key in exp) {
      var match = exp[key].exec(line);

      if (match) {
        var tag = {
          key: key
        };
        return parsers[key](tag, match);
      }
    }

    return {
      key: 'UNKOWN',
      line: line
    };
  };
};
/**
 *
 */


var parse$4 = function parse$$1(manifest, extensions) {
  if (extensions === void 0) {
    extensions = {};
  }

  // strip whitespace
  // strip off any carriage returns here so the regex matching
  // doesn't have to account for them.
  var lines = manifest.split('\n').map(function (line) {
    return line.trim().replace('\r', '');
  }).filter(function (line) {
    return line.length;
  });
  var tags = lines.map(parseLine(extensions));
  var playlist = parse(tags);

  if (isMaster(tags)) {
    return parse$3(playlist, tags, extensions);
  }

  return parse$2(playlist, tags, extensions);
};

var EXT = {
  // Basic Tags
  M3U: '#EXTM3U',
  VERSION: '#EXT-X-VERSION:',
  // Media Segment Tags
  INF: '#EXTINF:',
  BYTERANGE: '#EXT-X-BYTERANGE:',
  DISCONTINUITY: '#EXT-X-DISCONTINUITY',
  KEY: '#EXT-X-KEY',
  MAP: '#EXT-X-MAP',
  PROGRAM_DATE_TIME: '#EXT-X-PROGRAM-DATE-TIME:',
  // Media Playlist Tags
  TARGETDURATION: '#EXT-X-TARGETDURATION:',
  MEDIA_SEQUENCE: '#EXT-X-MEDIA-SEQUENCE:',
  DISCONTINUITY_SEQUENCE: '#EXT-X-DISCONTINUITY-SEQUENCE:',
  ENDLIST: '#EXT-X-ENDLIST',
  PLAYLIST_TYPE: '#EXT-X-PLAYLIST-TYPE:',
  START: '#EXT-X-START:',
  // Master Playlist Tags
  MEDIA: '#EXT-X-MEDIA:',
  STREAM_INF: '#EXT-X-STREAM-INF:'
};

var tagList$4 = {
  M3U: function M3U(playlist) {
    return EXT.M3U;
  },
  VERSION: function VERSION(playlist) {
    return "" + EXT.VERSION + playlist.version;
  }
};
var compose = function compose(playlist) {
  return [tagList$4.M3U(playlist), tagList$4.VERSION(playlist)];
};

var composeAttribute = {
  MEDIA: {
    type: function type(value) {
      return "TYPE=" + value;
    },
    uri: function uri(value) {
      return "URI=\"" + value + "\"";
    },
    groupId: function groupId(value) {
      return "GROUP-ID=\"" + value + "\"";
    },
    language: function language(value) {
      return "LANGUAGE=\"" + value + "\"";
    },
    name: function name(value) {
      return "NAME=\"" + value + "\"";
    },
    default: function _default(value) {
      return "DEFAULT=" + (value ? 'YES' : 'NO');
    },
    autoselect: function autoselect(value) {
      return "AUTOSELECT=" + (value ? 'YES' : 'NO');
    },
    forced: function forced(value) {
      return "FORCED=" + (value ? 'YES' : 'NO');
    },
    instreamId: function instreamId(value) {
      return "INSTREAM-ID=\"" + value + "\"";
    },
    characteristics: function characteristics(value) {
      return "CHARACTERISTICS=\"" + value + "\"";
    }
  },
  // stream-inf attributes are all caps because the parse does not camel case them
  STREAM_INF: {
    BANDWIDTH: function BANDWIDTH(value) {
      return "BANDWIDTH=" + value;
    },
    'AVERAGE-BANDWIDTH': function AVERAGEBANDWIDTH(value) {
      return "AVERAGE-BANDWIDTH=" + value;
    },
    CODECS: function CODECS(value) {
      return "CODECS=\"" + value + "\"";
    },
    RESOLUTION: function RESOLUTION(value) {
      return "RESOLUTION=" + value;
    },
    'FRAME-RATE': function FRAMERATE(value) {
      return "FRAME-RATE=" + value;
    },
    'HDCP-LEVEL': function HDCPLEVEL(value) {
      return "HDCP-LEVEL=" + value;
    },
    AUDIO: function AUDIO(value) {
      return "AUDIO=\"" + value + "\"";
    },
    VIDEO: function VIDEO(value) {
      return "VIDEO=\"" + value + "\"";
    },
    SUBTITLES: function SUBTITLES(value) {
      return "SUBTITLES=\"" + value + "\"";
    },
    'CLOSED-CAPTIONS': function CLOSEDCAPTIONS(value) {
      return "CLOSED-CAPTIONS=\"" + value + "\"";
    }
  }
};
var composeStreams = function composeStreams(playlist) {
  var lines = [];
  var streams = playlist.streams;
  streams.forEach(function (stream) {
    var attributes = stream.attributes;
    var attributeList = Object.keys(attributes).map(function (key) {
      return composeAttribute.STREAM_INF[key](attributes[key]);
    });
    lines.push("" + EXT.STREAM_INF + attributeList.join(','));
    lines.push(stream.uri);
  });
  return lines;
};
var composeMediaGroups = function composeMediaGroups(playlist) {
  var lines = [];
  var mediaGroups = playlist.mediaGroups;

  for (var mediaType in mediaGroups) {
    for (var groupId in mediaGroups[mediaType]) {
      var _loop = function _loop(name) {
        var attributes = mediaGroups[mediaType][groupId][name];
        attributes.mediaType = mediaType;
        attributes.groupId = groupId;
        attributes.name = name;
        var attributeList = Object.keys(attributes).map(function (key) {
          return composeAttribute.MEDIA[key](attributes[key]);
        });
        lines.push("" + EXT.MEDIA + attributeList.join(','));
      };

      for (var name in mediaGroups[mediaType][groupId]) {
        _loop(name);
      }
    }
  }

  return lines;
};
var compose$1 = function compose(playlist, lines) {
  if (playlist.mediaGroups) {
    lines = lines.concat(composeMediaGroups(playlist));
  }

  return lines.concat(composeStreams(playlist));
};

var master = /*#__PURE__*/Object.freeze({
  composeAttribute: composeAttribute,
  composeStreams: composeStreams,
  composeMediaGroups: composeMediaGroups,
  compose: compose$1
});

var composeAttribute$1 = {
  KEY: {
    method: function method(value) {
      return "METHOD=" + value;
    },
    uri: function uri(value) {
      return "URI=\"" + value + "\"";
    },
    iv: function iv(value) {
      return "IV=" + value;
    }
  },
  MAP: {
    uri: function uri(value) {
      return "URI=\"" + value + "\"";
    },
    byterange: function byterange(value) {
      return "BYTERANGE=\"" + value + "\"";
    }
  }
};
var compose$2 = function compose(segment) {
  var lines = [];

  if (segment.byterange) {
    lines.push("" + EXT.BYTERANGE + segment.byterange.length + "@" + segment.byterange.offset);
  }

  if (segment.key) {
    var attributeList = Object.keys(segment.key).map(function (key) {
      return composeAttribute$1.KEY[key](segment.key[key]);
    });
    lines.push("" + EXT.KEY + attributeList.join(','));
  }

  if (segment.map) {
    var _attributeList = Object.keys(segment.map).map(function (key) {
      return composeAttribute$1.MAP[key](segment.map[key]);
    });

    lines.push("" + EXT.MAP + _attributeList.join(','));
  }

  if (segment.discontinuity) {
    lines.push("" + EXT.DISCONTINUITY);
  }

  if (segment.dateTimeString) {
    lines.push("" + EXT.PROGRAM_DATE_TIME + segment.dateTimeString);
  }

  lines.push("" + EXT.INF + segment.duration);
  lines.push(segment.uri);
  return lines.join('\n');
};

var composeAttribute$2 = {
  START: {
    timeOffset: function timeOffset(value) {
      return "TIME-OFFSET=" + value;
    },
    precise: function precise(value) {
      return "PRECISE=" + (value ? 'YES' : 'NO');
    }
  }
};
var composeStart = function composeStart(playlist) {
  var start = playlist.start;
  var attributeList = Object.keys(start).map(function (key) {
    return composeAttribute$2.START[key](start[key]);
  });
  return "" + EXT.START + attributeList.join(',');
};
var compose$3 = function compose$$1(playlist) {
  var lines = [];

  if (playlist.playlistType) {
    lines.push("" + EXT.PLAYLIST_TYPE + playlist.playlistType);
  }

  if (typeof playlist.targetDuration !== 'undefined') {
    lines.push("" + EXT.TARGETDURATION + playlist.targetDuration);
  }

  if (typeof playlist.mediaSequence !== 'undefined') {
    lines.push("" + EXT.MEDIA_SEQUENCE + playlist.mediaSequence);
  }

  if (typeof playlist.discontinuitySequence !== 'undefined') {
    lines.push("" + EXT.DISCONTINUITY_SEQUENCE + playlist.discontinuitySequence);
  }

  if (playlist.start) {
    lines.push(composeStart(playlist));
  }

  if (playlist.segments.length) {
    lines = lines.concat(playlist.segments.map(compose$2));
  }

  if (playlist.endList) {
    lines.push("" + EXT.ENDLIST);
  }

  return lines.join('\n');
};

var media = /*#__PURE__*/Object.freeze({
  composeAttribute: composeAttribute$2,
  composeStart: composeStart,
  compose: compose$3
});

var isMaster$1 = function isMaster(playlist) {
  if (!!playlist.streams && !!playlist.segments) {
    throw new Error('master and media');
  }

  if (!playlist.streams && !playlist.segments) {
    throw new Error('unknown');
  }

  return !!playlist.streams;
};
var compose$4 = function compose$$1(playlist) {
  return compose(playlist).concat((isMaster$1(playlist) ? master : media).compose(playlist)).join('\n');
};

/**
 * @file m3u8/index.js
 *
 * Utilities for parsing M3U8 files. If the entire manifest is available,
 * `Parser` will create an object representation with enough detail for managing
 * playback. `ParseStream` and `LineStream` are lower-level parsing primitives
 * that do not assume the entirety of the manifest is ready and expose a
 * ReadableStream-like interface.
 */

exports.parse = parse$4;
exports.compose = compose$4;
