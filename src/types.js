"use strict";

/**
 * Error thrown when a raw response matches the signatures of multiple registered providers.
 */
export class AmbiguousResponseError extends Error {
  /**
   * @param {string[]} providers - The list of provider names that matched.
   */
  constructor(providers) {
    super(`Ambiguous response: matched multiple providers (${providers.join(', ')})`);
    this.name = 'AmbiguousResponseError';
    this.providers = providers;
  }
}

/**
 * Error thrown when the parameters JSON Schema is invalid at tool-definition time.
 */
export class SchemaValidationError extends Error {
  /**
   * @param {any[]} errors - The validation errors returned from AJV.
   */
  constructor(errors) {
    super(`Schema validation failed: ${JSON.stringify(errors)}`);
    this.name = 'SchemaValidationError';
    this.errors = errors;
  }
}
