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
  let lines = [];

  if (playlist.playlistType) {
    lines.push(`${EXT.PLAYLIST_TYPE}${playlist.playlistType}`);
  }

  if (typeof playlist.targetDuration !== 'undefined') {
    lines.push(`${EXT.TARGETDURATION}${playlist.targetDuration}`);
  }

  if (typeof playlist.mediaSequence !== 'undefined') {
    lines.push(`${EXT.MEDIA_SEQUENCE}${playlist.mediaSequence}`);
  }

  if (typeof playlist.discontinuitySequence !== 'undefined') {
    lines.push(`${EXT.DISCONTINUITY_SEQUENCE}${playlist.discontinuitySequence}`);
  }

  if (playlist.start) {
    lines.push(composeStart(playlist));
  }

  if (playlist.segments.length) {
    lines = lines.concat(playlist.segments.map(composeSegment));
  }

  if (playlist.endList) {
    lines.push(`${EXT.ENDLIST}`);
  }

  return lines.join('\n');
};
