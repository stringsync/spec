import type { BunRequest, Server } from 'bun';
import type { IntentServer } from './intent-server';
import type { IntentService } from './intent-service';

export class BunIntentServer implements IntentServer {
  private server: Server | null = null;
  private stopResolvers = Promise.withResolvers<void>();

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

    console.log(`Listening for events on port ${port}`);

    return this.stopResolvers.promise;
  }

  async stop(): Promise<void> {
    if (!this.server) {
      throw new Error('Server not started');
    }
    await this.server.stop();
    this.server = null;
    this.stopResolvers.resolve();
    this.stopResolvers = Promise.withResolvers();
  }
}
