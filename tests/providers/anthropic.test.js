"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { defineTool, parse } from '../../src/index.js';

test('Anthropic plugin emit and parse', () => {
  const tool = defineTool({
    name: 'testAnthropic',
    description: 'Test description',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    },
    metadata: { someMetadataKey: 'value' }
  });

  const emitted = tool.emit('anthropic');
  assert.strictEqual(emitted.name, 'testAnthropic');
  assert.deepStrictEqual(emitted.input_schema.properties.query, { type: 'string' });
  assert.strictEqual(emitted.someMetadataKey, 'value');

  const mockResponse = {
    content: [
      {
        type: 'text',
        text: 'Hello'
      },
      {
        type: 'tool_use',
        id: 'toolu_123',
        name: 'testAnthropic',
        input: { query: 'test' }
      }
    ]
  };

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'anthropic');
  assert.strictEqual(parsed[0].name, 'testAnthropic');
  assert.strictEqual(parsed[0].id, 'toolu_123');
  assert.deepStrictEqual(parsed[0].args, { query: 'test' });
  assert.ok(parsed[0].raw);
});

test('Anthropic plugin parse with raw array', () => {
  const mockResponse = [
    {
      type: 'tool_use',
      id: 'toolu_456',
      name: 'directTool',
      input: '{"query": "direct"}'
    }
  ];

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'anthropic');
  assert.strictEqual(parsed[0].name, 'directTool');
  assert.strictEqual(parsed[0].id, 'toolu_456');
  assert.deepStrictEqual(parsed[0].args, { query: 'direct' });
});
