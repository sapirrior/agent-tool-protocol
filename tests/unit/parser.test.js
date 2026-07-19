"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { parse, registerPlugin, AmbiguousResponseError } from '../../src/index.js';
import { unregisterPluginInternal } from '../../src/core/registry.js';

test('parse returns empty array on invalid inputs', () => {
  assert.deepStrictEqual(parse(null), []);
  assert.deepStrictEqual(parse(undefined), []);
  assert.deepStrictEqual(parse(123), []);
  assert.deepStrictEqual(parse('hello'), []);
  assert.deepStrictEqual(parse({}), []);
});

test('parse throws AmbiguousResponseError when multiple plugins match', () => {
  // Define custom plugins that always match everything
  const pluginA = {
    name: 'pluginA',
    canParse: () => true,
    parse: () => [],
    emit: () => ({})
  };
  const pluginB = {
    name: 'pluginB',
    canParse: () => true,
    parse: () => [],
    emit: () => ({})
  };

  registerPlugin(pluginA);
  registerPlugin(pluginB);

  try {
    assert.throws(() => {
      parse({ choices: [] });
    }, (err) => {
      return err instanceof AmbiguousResponseError &&
        err.providers.includes('pluginA') &&
        err.providers.includes('pluginB');
    });
  } finally {
    // Cleanup
    unregisterPluginInternal('pluginA');
    unregisterPluginInternal('pluginB');
  }
});
