import EXT from './tags.js';

export const tagList = {
  M3U(playlist) {
    return EXT.M3U;
  },
  VERSION(playlist) {
    return `${EXT.VERSION}${playlist.version}`;
  }
};

export const compose = (playlist) => {
  return [
    tagList.M3U(playlist),
    tagList.VERSION(playlist)
  ];
};
