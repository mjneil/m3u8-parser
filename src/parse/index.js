import _exp from './expressions.js';
import _parsers from './line-parsers.js';
import * as basic from './basic.js';
import * as media from './media.js';
import * as master from './master.js';

const isMaster = (tags) => {
  const master = tags.filter(tag => tag.key === 'STREAM-INF').length;
  const media = tags.filter(tag => tag.key === 'INF').length;

  if (master && media) {
    throw 'master and media';
  }

  if (!master && !media) {
    throw 'unknown'
  }

  return master;
}

const parseLine = (extensions, flags) => (line, index) => {
  // URI
  if (line[0] !== '#') {
    return {
      key: 'URI',
      uri: line
    };
  }

  // comments
  if (line.indexOf('#EXT') !== 0) {
    return {
      key: 'COMMENT',
      text: line.slice(1)
    };
  }

  // Add extensions to keys/parsers/expressions
  const keys = Object.keys(_exp);
  const parsers = _parsers;
  const exp = _exp;

  for (key in keys) {
    const match = exp[key].exec(line);

    if (match) {
      const tag = {
        key
      };

      return parsers[key](tag, match);
    }
  }
  return {
    key: 'UNKOWN',
    line
  };
}

/**
 *
 */
export const parse = (manifest, extensions = {}) => {
  // strip whitespace
  // strip off any carriage returns here so the regex matching
  // doesn't have to account for them.
  const lines = manifest.split('\n')
    .map(line => line.trim().replace('\r', '')).filter(line => line.length);
  const tags = lines.map(parseLine(extensions));
  const playlist = basic.parse(tags);

  if (isMaster(tags)) {
    return master.parse(playlist, tags, extensions);
  }

  return media.parse(playlist, tags, extensions);
};
