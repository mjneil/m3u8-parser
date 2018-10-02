import * as basic from './basic.js';
import * as master from './master.js';
import * as media from './media.js';

export const isMaster = (playlist) => {
  if (!!playlist.streams && !!playlist.segments) {
    throw new Error('master and media');
  }

  if (!playlist.streams && !playlist.segments) {
    throw new Error('unknown');
  }

  return !!playlist.streams;
};

export const compose = (playlist) => {
  return basic.compose(playlist).concat(
    (isMaster(playlist) ? master : media).compose(playlist)
  ).join('\n');
};
