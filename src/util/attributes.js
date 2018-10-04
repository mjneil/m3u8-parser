/**
 * "forgiving" attribute list psuedo-grammar:
 * attributes -> keyvalue (',' keyvalue)*
 * keyvalue   -> key '=' value
 * key        -> [^=]*
 * value      -> '"' [^"]* '"' | [^,]*
 */
export const attributeSeparator = function() {
  const key = '[^=]*';
  const value = '"[^"]*"|[^,]*';
  const keyvalue = '(?:' + key + ')=(?:' + value + ')';

  return new RegExp('(?:^|,)(' + keyvalue + ')');
};

/**
 * Parse attributes from a line given the separator
 *
 * @param {string} attributes the attribute line to parse
 */
export const parseAttributes = function(attributes) {
  // split the string using attributes as the separator
  const attrs = attributes.split(attributeSeparator());
  const result = {};
  let i = attrs.length;
  let attr;

  while (i--) {
    // filter out unmatched portions of the string
    if (attrs[i] === '') {
      continue;
    }

    // split the key and value
    attr = (/([^=]*)=(.*)/).exec(attrs[i]).slice(1);
    // trim whitespace and remove optional quotes around the value
    attr[0] = attr[0].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^\s+|\s+$/g, '');
    attr[1] = attr[1].replace(/^['"](.*)['"]$/g, '$1');
    result[attr[0]] = attr[1];
  }
  return result;
};

export const composeAttributeValue = {
  decimalInteger({ name, value }) {
    return `${name}=${parseInt(value, 10)}`;
  },
  hexadecimalSequence({ name, value }) {
    return `${name}=${value}`;
  },
  decimalFloatingPoint({ name, value }) {
    return `${name}=${parseFloat(value)}`;
  },
  signedDecimalFloatingPoint({ name, value }) {
    return `${name}=${parseFloat(value)}`;
  },
  quotedString({ name, value }) {
    return `${name}="${value}"`;
  },
  enumeratedString({ name, value }) {
    return `${name}=${value}`;
  },
  decimalResolution({ name, value }) {
    return `${name}=${parseInt(value.width, 10)}x${parseInt(value.height, 10)}`;
  },
  enumeratedStringBoolean({ name, value }) {
    return `${name}=${value ? 'YES' : 'NO'}`;
  }
};

export const composeAttributeList = (attributes) => {
  return attributes.map((attribute) => {
    return composeAttributeValue[attribute.type](attribute);
  }).join(',');
};
