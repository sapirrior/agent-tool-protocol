"use strict";

import { AmbiguousResponseError } from '../types.js';
import { listPlugins } from './registry.js';

/**
 * Universally parse raw provider responses and normalize them into a standard tool calls structure.
 * Iterates through all registered plugins and delegates parsing if a single matching signature is found.
 *
 * @param {unknown} raw - The raw response payload from an LLM API.
 * @returns {Object[]} An array of normalized parsed tool calls.
 * @property {string} provider - The name of the matching provider plugin.
 * @property {string} name - The tool name.
 * @property {string|null} id - The tool execution call ID (null if provider doesn't support them).
 * @property {Object} args - Arguments extracted and parsed (guaranteed to be an object).
 * @property {unknown} raw - Unmodified original tool call block from the response.
 * @throws {AmbiguousResponseError} If raw payload matches signatures of multiple registered providers.
 */
export function parse(raw) {
  if (raw === null || typeof raw !== 'object') {
    return [];
  }

  const plugins = listPlugins();
  const matches = plugins.filter(plugin => plugin.canParse(raw));

  if (matches.length === 0) {
    return [];
  }

  if (matches.length > 1) {
    throw new AmbiguousResponseError(matches.map(p => p.name));
  }

  return matches[0].parse(raw);
}
