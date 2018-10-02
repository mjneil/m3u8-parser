const tagList = {
  MEDIA(playlist, tag) {
    if (!(tag.attributes &&
          tag.attributes.TYPE &&
          tag.attributes['GROUP-ID'] &&
          tag.attributes.NAME)) {
      throw 'ignoring incomplete or missing media group';
    }

    // find the media group, creating defaults as necessary
    const mediaGroupType = playlist.mediaGroups[tag.attributes.TYPE];

    mediaGroupType[tag.attributes['GROUP-ID']] =
      mediaGroupType[tag.attributes['GROUP-ID']] || {};
    const mediaGroup = mediaGroupType[tag.attributes['GROUP-ID']];

    // collect the rendition metadata
    const rendition = {
      default: (/yes/i).test(tag.attributes.DEFAULT)
    };

    if (rendition.default) {
      rendition.autoselect = true;
    } else {
      rendition.autoselect = (/yes/i).test(tag.attributes.AUTOSELECT);
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
      rendition.forced = (/yes/i).test(tag.attributes.FORCED);
    }

    // insert the new rendition
    mediaGroup[tag.attributes.NAME] = rendition;

    return playlist;
  },
  STREAM_INF(playlist, tag) {
    const len = playlist.streams.length;

    if (len === 0) {
      playlist.streams.push({});
    }

    const stream = playlist.streams[len - 1];

    if (!stream.attributes) {
      stream.attributes = {};
    }

    Object.assign(stream.attributes, tag.attributes);

    return playlist;
  },
  URI(playlist, tag) {
    const len = playlist.streams.length;

    if (len === 0) {
      playlist.streams.push({});
    }

    const stream = playlist.streams[len - 1];

    stream.uri = tag.uri;

    return playlist;
  }
};

export const parse = (playlist, tags, extensions) => {
  playlist.mediaGroups = {
    'AUDIO': {},
    'VIDEO': {},
    'CLOSED-CAPTIONS': {},
    'SUBTITLES': {}
  };
  playlist.streams = [];

  const masterTags = tags.filter(tag => !!tagList[tag.key]);

  return masterTags.reduce((playlist, tag) => {
    return tagList[tag.key](playlist, tag);
  }, playlist);
};
