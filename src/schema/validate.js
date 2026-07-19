"use strict";

import { SchemaValidationError } from '../types.js';

let ajvInstance = null;

try {
  const AjvModule = await import('ajv');
  const AjvClass = AjvModule.default || AjvModule.Ajv;
  if (AjvClass) {
    ajvInstance = new AjvClass({ strict: true });
  }
} catch (err) {
  // Optional dependency not present
}

export function validateSchema(schema) {
  if (!ajvInstance) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        'Warning: "ajv" is not installed. Schema validation at tool-definition time is skipped. ' +
        'Install "ajv" to enable strict runtime validation of schemas.'
      );
    }
    return;
  }

  const isValid = ajvInstance.validateSchema(schema);
  if (!isValid) {
    throw new SchemaValidationError(ajvInstance.errors || [{ message: 'Invalid JSON Schema' }]);
  }
}
