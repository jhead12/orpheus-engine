interface MCPServerOptions {
  onMessage: (message: any) => void;
  capabilities: string[];
}

export class MCPServerService {
  private onMessage: (message: any) => void;
  private capabilities: string[];

  constructor(options: MCPServerOptions) {
    this.onMessage = options.onMessage;
    this.capabilities = options.capabilities;
  }

  async send(message: any): Promise<any> {
    // TODO: Implement actual server communication
    return Promise.resolve({});
  }
}
