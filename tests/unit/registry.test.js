"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { registerPlugin, listPlugins } from '../../src/index.js';
import { unregisterPluginInternal } from '../../src/core/registry.js';

test('registry listPlugins returns registered plugins', () => {
  const initialCount = listPlugins().length;
  assert.ok(initialCount >= 3, 'Should have at least 3 built-in plugins');

  const customPlugin = {
    name: 'test-custom',
    canParse: () => false,
    parse: () => [],
    emit: () => ({})
  };

  registerPlugin(customPlugin);
  const updated = listPlugins();
  assert.strictEqual(updated.length, initialCount + 1);
  assert.strictEqual(updated[0].name, 'test-custom', 'Custom plugin should be prepended to registry');

  // Cleanup
  unregisterPluginInternal('test-custom');
});

test('registry throws error on duplicate name registration', () => {
  const plugin = {
    name: 'duplicate-test',
    canParse: () => false,
    parse: () => [],
    emit: () => ({})
  };

  registerPlugin(plugin);
  assert.throws(() => {
    registerPlugin(plugin);
  }, /Plugin with name "duplicate-test" is already registered/);

  unregisterPluginInternal('duplicate-test');
});
