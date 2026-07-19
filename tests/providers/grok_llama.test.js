"use strict";

import { test } from 'node:test';
import assert from 'node:assert';
import { defineTool, parse } from '../../src/index.js';

test('grok and llama.cpp plugins emit and parse compatibility', () => {
  const tool = defineTool({
    name: 'testLocal',
    description: 'Test local / grok tool definition',
    parameters: {
      type: 'object',
      properties: {
        val: { type: 'string' }
      }
    }
  });

  // Verify emit formats
  const grokEmitted = tool.emit('grok');
  assert.strictEqual(grokEmitted.type, 'function');
  assert.strictEqual(grokEmitted.function.name, 'testLocal');

  const llamaEmitted = tool.emit('llama.cpp');
  assert.strictEqual(llamaEmitted.type, 'function');
  assert.strictEqual(llamaEmitted.function.name, 'testLocal');

  // Verify parsing works for grok when response matches OpenAI signature
  const mockGrokResponse = {
    choices: [
      {
        message: {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_grok',
              type: 'function',
              function: {
                name: 'testLocal',
                arguments: '{"val": "hello"}'
              }
            }
          ]
        }
      }
    ]
  };

  // The parse() should match 'openai' (as grok and llama.cpp delegate parsing to openai format to prevent collisions)
  const parsed = parse(mockGrokResponse);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].provider, 'openai');
  assert.strictEqual(parsed[0].name, 'testLocal');
  assert.deepStrictEqual(parsed[0].args, { val: 'hello' });
});
