import EXT from './tags.js';

export const composeAttribute = {
  MEDIA: {
    type(value) {
      return `TYPE=${value}`;
    },
    uri(value) {
      return `URI="${value}"`;
    },
    groupId(value) {
      return `GROUP-ID="${value}"`;
    },
    language(value) {
      return `LANGUAGE="${value}"`;
    },
    name(value) {
      return `NAME="${value}"`;
    },
    default(value) {
      return `DEFAULT=${value ? 'YES' : 'NO'}`;
    },
    autoselect(value) {
      return `AUTOSELECT=${value ? 'YES' : 'NO'}`;
    },
    forced(value) {
      return `FORCED=${value ? 'YES' : 'NO'}`;
    },
    instreamId(value) {
      return `INSTREAM-ID="${value}"`;
    },
    characteristics(value) {
      return `CHARACTERISTICS="${value}"`;
    }
  },
  // stream-inf attributes are all caps because the parse does not camel case them
  STREAM_INF: {
    BANDWIDTH(value) {
      return `BANDWIDTH=${value}`;
    },
    'AVERAGE-BANDWIDTH': (value) => {
      return `AVERAGE-BANDWIDTH=${value}`;
    },
    CODECS(value) {
      return `CODECS="${value}"`;
    },
    RESOLUTION(value) {
      return `RESOLUTION=${value}`;
    },
    'FRAME-RATE': (value) => {
      return `FRAME-RATE=${value}`;
    },
    'HDCP-LEVEL': (value) => {
      return `HDCP-LEVEL=${value}`;
    },
    AUDIO(value) {
      return `AUDIO="${value}"`;
    },
    VIDEO(value) {
      return `VIDEO="${value}"`;
    },
    SUBTITLES(value) {
      return `SUBTITLES="${value}"`;
    },
    'CLOSED-CAPTIONS': (value) => {
      return `CLOSED-CAPTIONS="${value}"`;
    }
  }
};

export const composeStreams = (playlist) => {
  const lines = [];
  const streams = playlist.streams;

  streams.forEach((stream) => {
    const attributes = stream.attributes;
    const attributeList = Object.keys(attributes).map((key) => {
      return composeAttribute.STREAM_INF[key](attributes[key]);
    });

    lines.push(`${EXT.STREAM_INF}${attributeList.join(',')}`);
    lines.push(stream.uri);
  });

  return lines;
};

export const composeMediaGroups = (playlist) => {
  const lines = [];
  const mediaGroups = playlist.mediaGroups;

  for (const mediaType in mediaGroups) {
    for (const groupId in mediaGroups[mediaType]) {
      for (const name in mediaGroups[mediaType][groupId]) {
        const attributes = mediaGroups[mediaType][groupId][name];

        attributes.mediaType = mediaType;
        attributes.groupId = groupId;
        attributes.name = name;

        const attributeList = Object.keys(attributes).map((key) => {
          return composeAttribute.MEDIA[key](attributes[key]);
        });

        lines.push(`${EXT.MEDIA}${attributeList.join(',')}`);
      }
    }
  }

  return lines;
};

export const compose = (playlist, lines) => {
  if (playlist.mediaGroups) {
    lines = lines.concat(composeMediaGroups(playlist));
  }

  return lines.concat(composeStreams(playlist));
};
