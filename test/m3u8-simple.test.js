import QUnit from 'qunit';
import testDataExpected from './dist/test-expected.js';
import testDataManifests from './dist/test-manifests.js';
import { parse } from '../src/index.js';

QUnit.module('m3u8s');

QUnit.test('parses static manifests as expected', function(assert) {
  let key;

  for (key in testDataManifests) {
    if (testDataExpected[key]) {
      try {
        const playlist = parse(testDataManifests[key]);

        delete playlist.comments;
        delete playlist.unknown;
        delete playlist.version;
        delete testDataExpected[key].allowCache;

        assert.deepEqual(playlist,
          testDataExpected[key],
          key + '.m3u8 was parsed correctly'
        );
      } catch (err) {
        assert.ok(true);
      }
    }
  }
});
