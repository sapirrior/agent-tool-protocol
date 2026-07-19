"use strict";

import { validateSchema } from '../schema/validate.js';
import { listPlugins } from './registry.js';

export function defineTool(config) {
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Tool name is required and must be a string');
  }
  if (!config.description || typeof config.description !== 'string') {
    throw new Error('Tool description is required and must be a string');
  }
  if (!config.parameters || typeof config.parameters !== 'object') {
    throw new Error('Tool parameters schema is required and must be an object');
  }

  // Compile shorthand parameters if present
  let parametersSchema;
  const rawParams = config.parameters;

  if (rawParams.type === 'object') {
    parametersSchema = rawParams;
  } else {
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(rawParams)) {
      if (value && typeof value === 'object') {
        const { required: isRequired, ...rest } = value;
        properties[key] = rest;
        if (isRequired) {
          required.push(key);
        }
      }
    }

    parametersSchema = {
      type: 'object',
      properties,
    };
    if (required.length > 0) {
      parametersSchema.required = required;
    }
  }

  // Validate the compiled parameters schema
  validateSchema(parametersSchema);

  const toolDef = {
    name: config.name,
    description: config.description,
    parameters: parametersSchema,
    metadata: config.metadata || {},

    emit(providerName) {
      const plugins = listPlugins();
      const plugin = plugins.find(p => p.name === providerName);
      if (!plugin) {
        throw new Error(`Provider plugin "${providerName}" is not registered`);
      }
      return plugin.emit(this);
    }
  };

  return toolDef;
}
