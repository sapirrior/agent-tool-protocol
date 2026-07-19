"use strict";

/**
 * Plugin Registry manager class. Allows registering and listing provider plugins.
 */
export class Registry {
  constructor() {
    /** @type {Object[]} */
    this.plugins = [];
  }

  /**
   * Registers a new custom provider plugin.
   * Prepends to the plugins list to take precedence over previously registered ones.
   *
   * @param {Object} plugin - The provider plugin object.
   * @param {string} plugin.name - The unique name identifying the provider (e.g. 'openai').
   * @param {function(unknown): boolean} plugin.canParse - Method checking if raw payload belongs to this provider.
   * @param {function(unknown): Object[]} plugin.parse - Parses raw payload to normalized tool calls structure.
   * @param {function(Object): unknown} plugin.emit - Transforms tool definitions into provider-expected structures.
   * @throws {Error} if plugin is invalid or a duplicate name already exists.
   */
  register(plugin) {
    if (!plugin || typeof plugin.name !== 'string') {
      throw new Error('Invalid plugin: plugin name is required');
    }
    const exists = this.plugins.some(p => p.name === plugin.name);
    if (exists) {
      throw new Error(`Plugin with name "${plugin.name}" is already registered`);
    }
    this.plugins.unshift(plugin);
  }

  /**
   * Unregisters a provider plugin by its name.
   * @param {string} name - Name of the provider plugin.
   */
  unregister(name) {
    this.plugins = this.plugins.filter(p => p.name !== name);
  }

  /**
   * Returns a read-only list of currently registered provider plugins.
   * @returns {ReadonlyArray<Object>} List of registered provider plugins.
   */
  list() {
    return Object.freeze([...this.plugins]);
  }
}

const globalRegistry = new Registry();

/**
 * Public function to register a new provider plugin globally.
 * @param {Object} plugin - The provider plugin to register.
 */
export function registerPlugin(plugin) {
  globalRegistry.register(plugin);
}

/**
 * Public function to list all registered plugins globally.
 * @returns {ReadonlyArray<Object>} List of registered provider plugins.
 */
export function listPlugins() {
  return globalRegistry.list();
}

/**
 * Internal testing helper to unregister a plugin.
 * @param {string} name - Name of the plugin.
 */
export function unregisterPluginInternal(name) {
  globalRegistry.unregister(name);
}

/**
 * Factory function to construct a new registry instance for isolation (e.g. in workers).
 * @returns {Registry} A new isolated Registry instance.
 */
export function createRegistry() {
  return new Registry();
}
