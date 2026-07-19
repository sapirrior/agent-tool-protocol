"use strict";

export const AnthropicPlugin = {
  name: 'anthropic',

  canParse(raw) {
    if (!raw) return false;
    if (Array.isArray(raw)) {
      return raw.some(block => block?.type === 'tool_use');
    }
    if (typeof raw === 'object' && Array.isArray(raw.content)) {
      return raw.content.some(block => block?.type === 'tool_use');
    }
    return false;
  },

  parse(raw) {
    const content = Array.isArray(raw) ? raw : (raw.content || []);
    const results = [];

    for (const block of content) {
      if (block && block.type === 'tool_use') {
        const name = block.name || '';
        const id = block.id || null;
        const rawInput = block.input;
        let args = {};
        let parseError = null;
        if (typeof rawInput === 'string') {
          try {
            args = JSON.parse(rawInput);
          } catch (e) {
            args = {};
            parseError = e;
          }
        } else if (rawInput && typeof rawInput === 'object') {
          args = rawInput;
        }

        results.push({
          provider: 'anthropic',
          name,
          args: args || {},
          id,
          raw: block,
          parseError
        });
      }
    }

    return results;
  },

  emit(tool) {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
      ...tool.metadata
    };
  }
};
