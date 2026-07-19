"use strict";

export class AmbiguousResponseError extends Error {
  constructor(providers) {
    super(`Ambiguous response: matched multiple providers (${providers.join(', ')})`);
    this.name = 'AmbiguousResponseError';
    this.providers = providers;
  }
}

export class SchemaValidationError extends Error {
  constructor(errors) {
    super(`Schema validation failed: ${JSON.stringify(errors)}`);
    this.name = 'SchemaValidationError';
    this.errors = errors;
  }
}
