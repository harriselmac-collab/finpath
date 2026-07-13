export interface MCPToolCall {
  method: 'tools/call';
  params: {
    name: string;
    arguments?: Record<string, any>;
  };
}

export interface MCPToolResponse {
  result?: {
    content?: {
      type: string;
      text?: string;
    }[];
  };
  error?: {
    code: number;
    message: string;
  };
}

export class StitchMCPClient {
  private serverUrl: string;
  private apiKey: string;

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
  }

  async callTool(toolName: string, args: Record<string, any> = {}): Promise<any> {
    const response = await fetch(this.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      } as MCPToolCall),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MCP call failed: ${response.status} ${text}`);
    }

    const result: MCPToolResponse = await response.json();
    if (result.error) {
      throw new Error(`MCP error: ${result.error.message}`);
    }

    const content = result.result?.content?.[0];
    if (content?.type === 'text' && content.text) {
      try {
        return JSON.parse(content.text);
      } catch {
        return content.text;
      }
    }

    return result.result;
  }

  async createPassClass(classDef: Record<string, any>): Promise<any> {
    return this.callTool('stitch_create_pass_class', classDef);
  }

  async createPassObject(objectDef: Record<string, any>): Promise<any> {
    return this.callTool('stitch_create_pass_object', objectDef);
  }

  async getPassJwt(objectId: string): Promise<any> {
    return this.callTool('stitch_get_pass_jwt', { objectId });
  }
}
