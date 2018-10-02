export const tagList = {
  INF(playlist, segment, tag) {
    segment.duration = tag.duration || 0.01;

    return playlist;
  },
  BYTERANGE(playlist, segment, tag) {
    if ('length' in tag) {
      segment.byterange = {
        length: tag.length,
        offset: tag.offset || 0
      };
    }

    return playlist;
  },
  DISCONTINUITY(playlist, segment, tag) {
    segment.discontinuity = true;
    playlist.timeline++;
    playlist.discontinuityStarts.push(playlist.segments.length);

    return playlist;
  },
  KEY(playlist, segment, tag) {
    if (!tag.attributes) {
      return playlist;
    }

    if(tag.attributes.METHOD === 'NONE') {
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
  MAP(playlist, segment, tag) {
    segment.map = {
      uri: tag.uri,
      byterange: tag.byterange
    };

    return playlist;
  },
  PROGRAM_DATE_TIME(playlist, segment, tag) {
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
  URI(playlist, segment, tag) {
    if (playlist.targetDuration && !segment.duration) {
      segment.duration = playlist.targetDuration;
    }

    segment.uri = tag.uri;

    return playlist;
  }
};

export const parse= (playlist, tags, extensions) => {
  playlist.segments = [];
  playlist.discontinuityStarts = [];

  const segmentTags = tags.filter(tag => !!tagList[tag.key]);

  return segmentTags.reduce((playlist, tag) => {
    if (playlist.segments.length === 0) {
      playlist.segments.push({});
    }

    let segmentIndex = playlist.segments.length - 1;
    let segment = playlist.segments[segmentIndex];

    if (segment.uri) {
      segment = {
        key: segment.key,
        map: segment.map
      };

      playlist.segments.push(segment);
    }

    return tagList[tag.key](playlist, segment, tag);
  }, playlist);
};
