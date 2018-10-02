import EXT from './tags.js';

export const composeAttribute = {
  KEY: {
    method(value) {
      return `METHOD=${value}`;
    },
    uri(value) {
      return `URI="${value}"`;
    },
    iv(value) {
      return `IV=${value}`;
    }
  },
  MAP: {
    uri(value) {
      return `URI="${value}"`;
    },
    byterange(value) {
      return `BYTERANGE="${value}"`;
    }
  }
};

export const compose = (segment) => {
  const lines = [];

  if (segment.byterange) {
    lines.push(`${EXT.BYTERANGE}${segment.byterange.length}@${segment.byterange.offset}`);
  }

  if (segment.key) {
    const attributeList = Object.keys(segment.key).map((key) => {
      return composeAttribute.KEY[key](segment.key[key]);
    });

    lines.push(`${EXT.KEY}${attributeList.join(',')}`);
  }

  if (segment.map) {
    const attributeList = Object.keys(segment.map).map((key) => {
      return composeAttribute.MAP[key](segment.map[key]);
    });

    lines.push(`${EXT.MAP}${attributeList.join(',')}`);
  }

  if (segment.discontinuity) {
    lines.push(`${EXT.DISCONTINUITY}`);
  }

  if (segment.dateTimeString) {
    lines.push(`${EXT.PROGRAM_DATE_TIME}${segment.dateTimeString}`);
  }

  lines.push(`${EXT.INF}${segment.duration}`);
  lines.push(segment.uri);

  return lines;
};
