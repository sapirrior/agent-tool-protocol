"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { defineTool, parse } from '../../src/index.js';

test('Gemini plugin emit and parse', () => {
  const tool = defineTool({
    name: 'testGemini',
    description: 'Test description',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    },
    metadata: { behaviorOnError: 'fail' }
  });

  const emitted = tool.emit('gemini');
  assert.strictEqual(emitted.name, 'testGemini');
  assert.deepStrictEqual(emitted.parametersJsonSchema.properties.query, { type: 'string' });
  assert.strictEqual(emitted.behaviorOnError, 'fail');

  const mockResponse = {
    candidates: [
      {
        content: {
          role: 'model',
          parts: [
            {
              functionCall: {
                name: 'testGemini',
                args: { query: 'test' }
              }
            }
          ]
        }
      }
    ]
  };

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'gemini');
  assert.strictEqual(parsed[0].name, 'testGemini');
  assert.strictEqual(parsed[0].id, null, 'Gemini tool calls must have id: null');
  assert.deepStrictEqual(parsed[0].args, { query: 'test' });
  assert.ok(parsed[0].raw);
});

test('Gemini plugin parse with raw functionCall', () => {
  const mockResponse = {
    functionCall: {
      name: 'directGemini',
      args: '{"query": "direct"}'
    }
  };

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'gemini');
  assert.strictEqual(parsed[0].name, 'directGemini');
  assert.strictEqual(parsed[0].id, null);
  assert.deepStrictEqual(parsed[0].args, { query: 'direct' });
});
