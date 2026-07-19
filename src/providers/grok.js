"use strict";

import { OpenAiPlugin } from './openai.js';

/**
 * Provider plugin for xAI's Grok.
 * Grok uses the OpenAI protocol format. Responses are parsed by the OpenAI plugin.
 * This plugin enables emitting Grok-compatible specs via tool.emit('grok').
 */
export const GrokPlugin = {
  ...OpenAiPlugin,
  name: 'grok',
  canParse() {
    return false; // Grok responses are parsed by the 'openai' plugin to avoid ambiguity.
  }
};
