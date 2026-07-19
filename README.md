# Agent Tool Protocol (ATP)

A lightweight, standard, in-process protocol for defining AI tools and parsing tool execution responses consistently across different AI providers.

ATP defines common shapes and exports a minimal runtime without locking you into a heavy framework. It does not perform HTTP requests, run tool executions, or manage retries—it focuses purely on standardizing **schemas** and **parsing**.

## Features

- **Write Once, Emit Anywhere:** Define tools using standard JSON Schema (or flat properties shorthand) and emit specs for **OpenAI**, **Anthropic**, and **Google Gemini**.
- **Universal Parser:** Normalizes raw API responses from any provider into a consistent array of tool calls.
- **Strict Validation:** Optional runtime checking of JSON Schemas using `ajv` during definition.
- **Provider Plugin Extensibility:** Easily register custom providers (e.g. Cohere, Mistral) without modifying the library.
- **Collision-Proof Parsing:** Throws an error (`AmbiguousResponseError`) if a raw response structurally matches multiple providers, preventing silent errors.

---

## Installation

```bash
npm install agent-tool-protocol
```

*Optional:* Install `ajv` to enable strict JSON Schema validation during tool definition:
```bash
npm install ajv
```

---

## Usage

### 1. Define a Tool

Define your tool once. You can use standard JSON Schema (Draft-07 subset) or flat shorthand properties:

```javascript
import { defineTool } from 'agent-tool-protocol';

// Using flat properties shorthand
const readLocalFile = defineTool({
  name: 'readLocalFile',
  description: 'Read files safely from the local directory.',
  parameters: {
    path: { type: 'string', description: 'Absolute or relative file path', required: true },
    encoding: { type: 'string', description: 'File encoding (defaults to utf8)', required: false }
  },
  metadata: {
    strict: true // Provider-specific escape hatch (passed directly through)
  }
});
```

### 2. Emit Provider-Specific Specs

Convert your defined tool into the exact shape expected by each provider's SDK:

```javascript
// OpenAI
const openAiSpec = readLocalFile.emit('openai');
// Result: { type: 'function', function: { name: 'readLocalFile', description: ..., parameters: ..., strict: true } }

// Anthropic
const anthropicSpec = readLocalFile.emit('anthropic');
// Result: { name: 'readLocalFile', description: ..., input_schema: ... }

// Google Gemini
const geminiSpec = readLocalFile.emit('gemini');
// Result: { name: 'readLocalFile', description: ..., parametersJsonSchema: ... }
```

### 3. Parse Tool Calls Universally

Pass the raw response object from *any* supported provider directly to the `parse` function to get a normalized array of tool calls:

```javascript
import { parse } from 'agent-tool-protocol';

// Raw response from OpenAI, Anthropic, or Gemini
const rawResponse = await openai.chat.completions.create({ ... });

const toolCalls = parse(rawResponse);

console.log(toolCalls);
/*
Output:
[
  {
    provider: 'openai',
    name: 'readLocalFile',
    id: 'call_abc123',
    args: { path: 'package.json', encoding: 'utf8' },
    raw: { ... }, // Unmodified original tool call block
    parseError: null // SyntaxError if JSON parsing of arguments failed, otherwise null
  }
]
*/
```

### 4. Isolated Registries (Serverless & Multi-Tenant)

In multi-tenant or serverless environments (e.g. AWS Lambda, Vercel Edge, Cloudflare Workers), global state is shared across requests. Rather than calling global functions like `registerPlugin()`, you can construct an isolated registry:

```javascript
import { createRegistry } from 'agent-tool-protocol';

// Create a sandbox registry
const registry = createRegistry();

// Register a custom plugin in this instance
registry.register(coherePlugin);

// Retrieve plugins active in this registry
const activePlugins = registry.list();
```

---

## Bundler Optimization (Optional AJV)

If you compile your code using a web bundler (like Webpack, Rollup, Vite, or Esbuild) and do not have `ajv` installed, the bundler might throw a build warning or error because of the dynamic `import('ajv')` inside the package.

To fix this, configure your bundler to mark `ajv` as an **external dependency** (so it's ignored at build time):

- **esbuild**: `--external:ajv`
- **webpack**: `externals: { ajv: 'commonjs ajv' }`
- **rollup / vite**: `external: ['ajv']`

---

## Custom Provider Plugins

Extend ATP to support other providers using `registerPlugin()`:

```javascript
import { registerPlugin, parse } from 'agent-tool-protocol';

const coherePlugin = {
  name: 'cohere',
  
  // Return true if the raw response structurally belongs to this provider
  canParse(raw) {
    return !!(raw && raw.cohereToolCalls);
  },

  // Parse and return the normalized tool calls array
  parse(raw) {
    return raw.cohereToolCalls.map(tc => ({
      provider: 'cohere',
      name: tc.name,
      id: tc.id,
      args: tc.parameters || {},
      raw: tc,
      parseError: null
    }));
  },

  // Return the tool schema format expected by Cohere's SDK
  emit(tool) {
    return {
      name: tool.name,
      description: tool.description,
      parameter_definitions: tool.parameters.properties
    };
  }
};

// Register your plugin (user plugins take precedence over built-ins)
registerPlugin(coherePlugin);
```

---

## Error Handling

ATP exports specific error classes:

```javascript
import { parse, AmbiguousResponseError } from 'agent-tool-protocol';

try {
  const toolCalls = parse(rawResponse);
} catch (error) {
  if (error instanceof AmbiguousResponseError) {
    console.error('Response matched multiple registered providers:', error.providers);
  }
}
```

---

## License

ISC
