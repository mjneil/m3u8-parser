import EXT from './tags.js';
import { compose as composeSegment } from './segment.js';

export const composeAttribute = {
  START: {
    timeOffset(value) {
      return `TIME-OFFSET=${value}`;
    },
    precise(value) {
      return `PRECISE=${value ? 'YES' : 'NO'}`;
    }
  }
};

export const composeStart = (playlist) => {
  const start = playlist.start;

  const attributeList = Object.keys(start).map((key) => {
    return composeAttribute.START[key](start[key]);
  });

  return `${EXT.START}${attributeList.join(',')}`;
};

export const compose = (playlist) => {
  return [
    `${EXT.PLAYLIST_TYPE}${playlist.playlistType}`,
    `${EXT.TARGETDURATION}${playlist.targetDuration}`,
    `${EXT.MEDIA_SEQUENCE}${playlist.mediaSequence}`
    `${EXT.DISCONTINUITY_SEQUENCE}${playlist.discontinuitySequence}`
  ].concat(
    composeStart(playlist),
    playlist.segments.map(composeSegment)
    `${EXT.ENDLIST}`
  );

};
