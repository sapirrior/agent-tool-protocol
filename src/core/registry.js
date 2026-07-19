"use strict";

export class Registry {
  constructor() {
    this.plugins = [];
  }

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

  unregister(name) {
    this.plugins = this.plugins.filter(p => p.name !== name);
  }

  list() {
    return Object.freeze([...this.plugins]);
  }
}

const globalRegistry = new Registry();

export function registerPlugin(plugin) {
  globalRegistry.register(plugin);
}

export function listPlugins() {
  return globalRegistry.list();
}

export function unregisterPluginInternal(name) {
  globalRegistry.unregister(name);
}

export function createRegistry() {
  return new Registry();
}
