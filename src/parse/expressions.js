export default {
  // Basic Tags
  M3U: /^#EXTM3U/,
  VERSION: /^#EXT-X-VERSION:?([0-9.]*)?/,

  // Media Segment Tags
  INF: /^#EXTINF:?([0-9\.]*)?,?(.*)?$/,
  BYTERANGE: /^#EXT-X-BYTERANGE:?([0-9.]*)?@?([0-9.]*)?/,
  DISCONTINUITY: /^#EXT-X-DISCONTINUITY$/,
  KEY: /^#EXT-X-KEY:?(.*)$/,
  MAP: /^#EXT-X-MAP:?(.*)$/,
  PROGRAM_DATE_TIME: /^#EXT-X-PROGRAM-DATE-TIME:?(.*)$/,

  // Media Playlist Tags
  TARGETDURATION: /^#EXT-X-TARGETDURATION:?([0-9.]*)?/,
  MEDIA_SEQUENCE: /^#EXT-X-MEDIA-SEQUENCE:?(\-?[0-9.]*)?/,
  DISCONTINUITY_SEQUENCE: /^#EXT-X-DISCONTINUITY-SEQUENCE:?(\-?[0-9.]*)?/,
  ENDLIST: /^#EXT-X-ENDLIST/,
  PLAYLIST_TYPE: /^#EXT-X-PLAYLIST-TYPE:?(.*)?$/,
  START: /^#EXT-X-START:?(.*)$/,

  // Master Playlist Tags
  MEDIA: /^#EXT-X-MEDIA:?(.*)$/,
  STREAM_INF: /^#EXT-X-STREAM-INF:?(.*)$/
}
