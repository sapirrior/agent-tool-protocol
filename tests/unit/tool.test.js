"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { defineTool, SchemaValidationError } from '../../src/index.js';

test('defineTool creates a tool and compiles parameters', () => {
  const tool = defineTool({
    name: 'testTool',
    description: 'A test tool description',
    parameters: {
      type: 'object',
      properties: {
        val: { type: 'string', description: 'some string value' }
      },
      required: ['val']
    }
  });

  assert.strictEqual(tool.name, 'testTool');
  assert.strictEqual(tool.description, 'A test tool description');
  assert.deepStrictEqual(tool.parameters, {
    type: 'object',
    properties: {
      val: { type: 'string', description: 'some string value' }
    },
    required: ['val']
  });
  assert.deepStrictEqual(tool.metadata, {});
});

test('defineTool compiles shorthand flat properties', () => {
  const tool = defineTool({
    name: 'shorthandTool',
    description: 'Shorthand test description',
    parameters: {
      val: { type: 'string', description: 'some string value', required: true },
      opt: { type: 'number', description: 'some optional number', required: false }
    }
  });

  assert.strictEqual(tool.parameters.type, 'object');
  assert.deepStrictEqual(tool.parameters.required, ['val']);
  assert.ok(tool.parameters.properties?.val);
  assert.ok(tool.parameters.properties?.opt);
  assert.strictEqual(tool.parameters.properties?.val.required, undefined);
  assert.strictEqual(tool.parameters.properties?.opt.required, undefined);
});

test('defineTool validates config parameters', () => {
  assert.throws(() => {
    defineTool({ name: '', description: 'test', parameters: { type: 'object' } });
  }, /Tool name is required/);

  assert.throws(() => {
    defineTool({ name: 'test', description: '', parameters: { type: 'object' } });
  }, /Tool description is required/);

  assert.throws(() => {
    defineTool({ name: 'test', description: 'test', parameters: null });
  }, /Tool parameters schema is required/);
});
