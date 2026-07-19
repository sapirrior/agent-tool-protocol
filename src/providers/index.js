"use strict";

import { registerPlugin } from '../core/registry.js';
import { OpenAiPlugin } from './openai.js';
import { AnthropicPlugin } from './anthropic.js';
import { GeminiPlugin } from './gemini.js';
import { GrokPlugin } from './grok.js';
import { LlamaCppPlugin } from './llamacpp.js';

// Registers built-ins automatically when providers index is loaded
registerPlugin(OpenAiPlugin);
registerPlugin(AnthropicPlugin);
registerPlugin(GeminiPlugin);
registerPlugin(GrokPlugin);
registerPlugin(LlamaCppPlugin);
