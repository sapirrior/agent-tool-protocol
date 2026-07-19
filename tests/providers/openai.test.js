"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { defineTool, parse } from '../../src/index.js';

test('OpenAI plugin emit and parse', () => {
  const tool = defineTool({
    name: 'testOpenAi',
    description: 'Test description',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    },
    metadata: { strict: true }
  });

  const emitted = tool.emit('openai');
  assert.strictEqual(emitted.type, 'function');
  assert.strictEqual(emitted.function.name, 'testOpenAi');
  assert.strictEqual(emitted.function.strict, true);

  const mockResponse = {
    choices: [
      {
        message: {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_abc',
              type: 'function',
              function: {
                name: 'testOpenAi',
                arguments: '{"query": "hello"}'
              }
            }
          ]
        }
      }
    ]
  };

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'openai');
  assert.strictEqual(parsed[0].name, 'testOpenAi');
  assert.strictEqual(parsed[0].id, 'call_abc');
  assert.deepStrictEqual(parsed[0].args, { query: 'hello' });
  assert.ok(parsed[0].raw);
});

test('OpenAI plugin parser safety', () => {
  const mockResponse = {
    tool_calls: [
      {
        id: 'call_def',
        type: 'function',
        function: {
          name: 'brokenArgs',
          arguments: '{"query": broken json}'
        }
      }
    ]
  };

  const parsed = parse(mockResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].name, 'brokenArgs');
  assert.deepStrictEqual(parsed[0].args, {});
  assert.ok(parsed[0].raw);
});
