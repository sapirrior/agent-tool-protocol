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
            provider: 'gemini',
            name,
            args: args || {},
            id: null,
            raw: part,
            parseError
          });
        }
      }
      return results;
    }

    if (raw.functionCall) {
      const name = raw.functionCall.name || '';
      const rawArgs = raw.functionCall.args;
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
        provider: 'gemini',
        name,
        args: args || {},
        id: null,
        raw: raw,
        parseError
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
