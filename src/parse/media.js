import { parse as parseSegments } from './segment.js';

export const tagList = {
  TARGETDURATION(playlist, tag) {
    if (!isFinite(tag.duration) || tag.duration < 0) {
      throw new Error('invalid taget duration');
    }

    playlist.targetDuration = tag.duration;

    return playlist;
  },
  MEDIA_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw new Error('invalid media sequence');
    }

    playlist.mediaSequence = tag.number;

    return playlist;
  },
  DISCONTINUITY_SEQUENCE(playlist, tag) {
    if (!isFinite(tag.number)) {
      throw new Error('invalid discontinuity sequence');
    }

    playlist.discontinuitySequence = tag.number;

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
  playlist.mediaSequence = 0;
  playlist.discontinuitySequence = 0;

  const mediaTags = tags.filter(tag => !!tagList[tag.key]);

  mediaTags.forEach((tag) => {
    return tagList[tag.key](playlist, tag);
  });

  return parseSegments(playlist, tags, extensions);
};
