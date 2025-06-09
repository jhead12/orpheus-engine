import DataLoader from "dataloader";
import { v4 as uuidv4 } from "uuid";
import { Clip, TrackType, TimelinePosition } from "../../types/core";

interface ClipInput {
  name: string;
  type: TrackType;
  start: TimelinePosition;
  end: TimelinePosition;
  loopEnd: TimelinePosition;
  muted?: boolean;
}

export class ClipAPI {
  private clipLoader: DataLoader<string, Clip | null>;
  private clips: Map<string, Clip>;
  private trackClips: Map<string, Set<string>>;

  constructor() {
    this.clips = new Map();
    this.trackClips = new Map();
    this.clipLoader = new DataLoader((ids) => this.batchLoadClips(ids));
  }

  private async batchLoadClips(
    ids: readonly string[]
  ): Promise<(Clip | null)[]> {
    return ids.map((id) => this.clips.get(id) || null);
  }

  async get(id: string): Promise<Clip | null> {
    return this.clipLoader.load(id);
  }

  async getByTrackId(trackId: string): Promise<Clip[]> {
    const clipIds = this.trackClips.get(trackId) || new Set();
    const clips = await Promise.all(
      Array.from(clipIds).map((id) => this.get(id))
    );
    return clips.filter((clip): clip is Clip => clip !== null);
  }

  async create(trackId: string, input: ClipInput): Promise<Clip> {
    const id = uuidv4();
    const newClip: Clip = {
      id,
      name: input.name,
      type: input.type,
      start: input.start,
      end: input.end,
      loopEnd: input.loopEnd,
      muted: input.muted ?? false,
    };

    this.clips.set(id, newClip);

    if (!this.trackClips.has(trackId)) {
      this.trackClips.set(trackId, new Set());
    }
    this.trackClips.get(trackId)!.add(id);

    return newClip;
  }

  async update(id: string, input: Partial<ClipInput>): Promise<Clip> {
    const existingClip = await this.get(id);
    if (!existingClip) {
      throw new Error("Clip not found");
    }

    const updatedClip: Clip = {
      ...existingClip,
      ...input,
    };

    this.clips.set(id, updatedClip);
    this.clipLoader.clear(id);
    return updatedClip;
  }

  async delete(id: string): Promise<boolean> {
    const clip = await this.get(id);
    if (!clip) {
      return false;
    }

    // Remove from clips map
    const success = this.clips.delete(id);

    // Remove from track clips
    for (const [trackId, clipIds] of this.trackClips.entries()) {
      if (clipIds.has(id)) {
        clipIds.delete(id);
        if (clipIds.size === 0) {
          this.trackClips.delete(trackId);
        }
      }
    }

    this.clipLoader.clear(id);
    return success;
  }
}
