/* global FormData, TextDecoder */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { scanUpload } from '../.test-dist/scan-preview.js';
const require = createRequire(import.meta.url);
const expo = dirname(require.resolve('expo/package.json'));
// Exercise the installed Expo serializer itself; a Node fetch-only test misses
// the native runtime's rejection of React Native's legacy URI descriptors.
function expoModule(relative) {
  const source = readFileSync(join(expo, 'src/winter', relative), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  new Function('require', 'exports', outputText)((name) => {
    if (name === '../../utils/blobUtils')
      return { blobToArrayBufferAsync: (blob) => blob.arrayBuffer() };
    throw new Error(`Unexpected dependency: ${name}`);
  }, exports);
  return exports;
}
const { installFormDataPatch } = expoModule('FormData.ts');
const { convertFormDataAsync } = expoModule('fetch/convertFormData.ts');
class NativeFormData {
  _parts = [];
}
installFormDataPatch(NativeFormData);
test('Expo 57 reproduces the pre-network URI error and serializes a readable native File', async () => {
  const original = globalThis.FormData;
  globalThis.FormData = NativeFormData;
  try {
    const old = new FormData();
    old.append('file', {
      uri: 'file:///crop.jpg',
      name: 'crop.jpg',
      type: 'image/jpeg',
    });
    await assert.rejects(
      convertFormDataAsync(old),
      /Unsupported FormDataPart implementation/,
    );
    let reads = 0;
    // File from expo-file-system implements bytes() rather than extending the
    // global Blob constructor. This matches Expo's native File branch exactly.
    const file = {
      name: 'crop.jpg',
      type: 'image/jpeg',
      bytes: async () => {
        reads++;
        return new Uint8Array([255, 216, 255, 217]);
      },
    };
    const form = scanUpload(
      { uri: 'file:///crop.jpg', mimeType: 'image/jpeg' },
      true,
      true,
      file,
    );
    const result = await convertFormDataAsync(form, 'scan-test-boundary');
    const body = new TextDecoder().decode(result.body);
    assert.equal(reads, 1);
    assert.match(body, /name="file"; filename="crop.jpg"/);
    assert.match(body, /content-type: image\/jpeg/);
    assert.match(body, /name="externalProcessingConsent"\r\n\r\ntrue/);
    assert.match(body, /name="medicinesOnlyCropConfirmed"\r\n\r\ntrue/);
    assert.doesNotMatch(body, /file:\/\/\//);
  } finally {
    globalThis.FormData = original;
  }
});
