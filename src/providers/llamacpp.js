"use strict";

import { OpenAiPlugin } from './openai.js';

/**
 * Provider plugin for llama.cpp (llama-server).
 * llama-server uses the OpenAI protocol format. Responses are parsed by the OpenAI plugin.
 * This plugin enables emitting llama.cpp specs via tool.emit('llama.cpp').
 */
export const LlamaCppPlugin = {
  ...OpenAiPlugin,
  name: 'llama.cpp',
  canParse() {
    return false; // llama.cpp responses are parsed by the 'openai' plugin to avoid ambiguity.
  }
};
