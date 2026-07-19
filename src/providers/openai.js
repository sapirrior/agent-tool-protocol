"use strict";

export const OpenAiPlugin = {
  name: 'openai',

  canParse(raw) {
    if (!raw || typeof raw !== 'object') {
      return false;
    }
    return Array.isArray(raw.choices?.[0]?.message?.tool_calls) || Array.isArray(raw.tool_calls);
  },

  parse(raw) {
    const toolCalls = raw.choices?.[0]?.message?.tool_calls || raw.tool_calls || [];
    const results = [];

    for (const call of toolCalls) {
      if (call.type === 'function' || call.function) {
        const name = call.function?.name || '';
        const id = call.id || null;
        const rawArgs = call.function?.arguments;
        let args = {};
        let parseError = null;
        if (typeof rawArgs === 'string') {
          try {
            args = JSON.parse(rawArgs);
          } catch (e) {
            args = {};
            parseError = e;
          }
        } else if (rawArgs && typeof rawArgs === 'object') {
          args = rawArgs;
        }

        results.push({
          provider: 'openai',
          name,
          args: args || {},
          id,
          raw: call,
          parseError
        });
      }
    }

    return results;
  },

  emit(tool) {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        ...tool.metadata
      }
    };
  }
};
