"use strict";

export const GeminiPlugin = {
  name: 'gemini',

  canParse(raw) {
    if (!raw || typeof raw !== 'object') {
      return false;
    }
    const hasParts = Array.isArray(raw.candidates?.[0]?.content?.parts) &&
      raw.candidates[0].content.parts.some(part => part?.functionCall);
    return !!(hasParts || raw.functionCall);
  },

  parse(raw) {
    const results = [];

    const parts = raw.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part?.functionCall) {
          const name = part.functionCall.name || '';
          const rawArgs = part.functionCall.args;
          let args = {};
          if (typeof rawArgs === 'string') {
            try {
              args = JSON.parse(rawArgs);
            } catch (e) {
              args = {};
            }
          } else if (rawArgs && typeof rawArgs === 'object') {
            args = rawArgs;
          }

          results.push({
            provider: 'gemini',
            name,
            args,
            id: null,
            raw: part
          });
        }
      }
      return results;
    }

    if (raw.functionCall) {
      const name = raw.functionCall.name || '';
      const rawArgs = raw.functionCall.args;
      let args = {};
      if (typeof rawArgs === 'string') {
        try {
          args = JSON.parse(rawArgs);
        } catch (e) {
          args = {};
        }
      } else if (rawArgs && typeof rawArgs === 'object') {
        args = rawArgs;
      }

      results.push({
        provider: 'gemini',
        name,
        args,
        id: null,
        raw: raw
      });
    }

    return results;
  },

  emit(tool) {
    return {
      name: tool.name,
      description: tool.description,
      parametersJsonSchema: tool.parameters,
      ...tool.metadata
    };
  }
};
