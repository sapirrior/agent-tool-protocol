"use strict";

import { AmbiguousResponseError } from '../types.js';
import { listPlugins } from './registry.js';

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
