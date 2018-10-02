import segmentTags from './segment.js';

export const tagList = {
  TARGETDURATION(playlist, tag) {
    if (!isFinite(tag.duration) || tag.duration < 0) {
      throw 'invalid taget duration';
    }

    playlist.targetDuration = tag.duration;

    return playlist;
  },
  MEDIA_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw 'invalid media sequence';
    }

    playlist.mediaSequence = tag.number;

    return playlist;
  },
  DISCONTINUITY_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw 'invalid discontinuity sequence';
    }

    playlist.discontinuitySequence = tag.number;
    playlist.timeline = tag.number

    return playlist;
  },
  ENDLIST(playlist) {
    playlist.endList = true;

    return playlist;
  },
  PLAYLIST_TYPE(playlist, tag) {
    if (!(/VOD|EVENT/).test(tag.playlistType)) {
      return playlist;
    }

    playlist.playlistType = tag.playlistType;

    return playlist;
  },
  START(playlist, tag) {
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

export const parse = (playlist, tags, extensions) => {
  playlist.timeline = 0;
  playlist.mediaSequence = 0;
  playlist.discontinuitySequence = 0;

  const mediaTags = tags.filter(tag => !!tagList[tag.key]);

  playlist = mediaTags.reduce((playlist, tag) => {
    return tagList[tag.key](playlist, tag);
  }, playlist);

  return segmentTags(playlist, tags, extensions);
};
