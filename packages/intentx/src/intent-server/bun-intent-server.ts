import type { BunRequest, Server } from 'bun';
import type { IntentService } from '../intent-service';
import type { IntentServer } from './types';

export class BunIntentServer implements IntentServer {
  private server: Server | null = null;

  constructor(private intentService: IntentService) {}

  async start(port: number): Promise<void> {
    if (this.server) {
      throw new Error('Server already started');
    }

    this.server = Bun.serve({
      port,
      routes: {
        '/events': {
          GET: async () => {
            const events = await this.intentService.getAllIntentEvents();
            console.log(`got ${events.length} events`);

            const data = JSON.stringify({ events }, null, 2);

            return new Response(data, { status: 200 });
          },
          POST: async (req: BunRequest) => {
            const json = await req.json();
            const events = this.intentService.parseIntentEvents(json);

            await this.intentService.addIntentEvents(events);
            console.log(`added ${events.length} events`);

            return new Response(null, { status: 200 });
          },
        },
      },
    });

    console.log(`intent server started on port ${port}`);
  }

  async stop(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not started');
    }
    await this.server.stop();
    this.server = null;
    console.log('intent server stopped');
  }
}
