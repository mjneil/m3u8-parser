export const tagList = {
  M3U(playlist, tag) {
    return playlist;
  },
  VERSION(playlist, tag) {
    playlist.version = tag.version || 1;

    return playlist;
  },
  COMMENT(playlist, tag) {
    playlist.comments.push(tag);

    return playlist;
  },
  UNKOWN(playlist, tag) {
    playlist.unknown.push(tag);

    return playlist;
  }
};

export const parse = (tags) => {
  const basicTags = tags.filter(tag => !!tagList[tag.key]);

  return basicTags.reduce((playlist, tag) => {
    return tagList[tag.key](playlist, tag);
  }, { comments: [], unknown: [] });
};
