import { parseAttributes } from '../util/attributes.js';

export default {
  // Basic Tags
  M3U(tag, match) {
    return tag;
  },
  VERSION(tag, match) {
    if (match[1]) {
      tag.version = parseInt(match[1], 10);
    }
    return tag;
  },

  // Media Segment Tags
  INF(tag, match) {
    if (match[1]) {
      tag.duration = parseFloat(match[1]);
    }
    if (match[2]) {
      tag.title = match[2];
    }
    return tag;
  },
  BYTERANGE(tag, match) {
    if (match[1]) {
      tag.length = parseInt(match[1], 10);
    }
    if (match[2]) {
      tag.offset = parseInt(match[2], 10);
    }
    return tag;
  },
  DISCONTINUITY(tag, match) {
    return tag;
  },
  KEY(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);
      // parse the IV string into a Uint32Array
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
  MAP(tag, match) {
    if (match[1]) {
      const attributes = parseAttributes(match[1]);

      if (attributes.URI) {
        tag.uri = attributes.URI;
      }
      if (attributes.BYTERANGE) {
        const [length, offset] = attributes.BYTERANGE.split('@');

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
  PROGRAM_DATE_TIME(tag, match) {
    if (match[1]) {
      tag.dateTimeString = match[1];
      tag.dateTimeObject = new Date(match[1]);
    }
    return tag;
  },

  // Media Playlist Tags
  TARGETDURATION(tag, match) {
    if (match[1]) {
      tag.duration = parseInt(match[1], 10);
    }
    return tag;
  },
  MEDIA_SEQUENCE(tag, match) {
    if (match[1]) {
      tag.number = parseInt(match[1], 10);
    }
    return tag;
  },
  DISCONTINUITY_SEQUENCE(tag, match) {
    if (match[1]) {
      tag.number = parseInt(match[1], 10);
    }
    return tag;
  },
  ENDLIST(tag, match) {
    return tag;
  },
  PLAYLIST_TYPE(tag, match) {
    if (match[1]) {
      tag.playlistType = match[1];
    }
    return tag;
  },
  START(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);

      tag.attributes['TIME-OFFSET'] = parseFloat(tag.attributes['TIME-OFFSET']);
      tag.attributes.PRECISE = (/YES/).test(tag.attributes.PRECISE);
    }
    return tag;
  },

  // Master Playlist Tags
  MEDIA(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);
    }
    return tag;
  },
  STREAM_INF(tag, match) {
    if (match[1]) {
      tag.attributes = parseAttributes(match[1]);

      if (tag.attributes.RESOLUTION) {
        const split = tag.attributes.RESOLUTION.split('x');
        const resolution = {};

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
