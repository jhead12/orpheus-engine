import DataLoader from 'dataloader';
import { v4 as uuidv4 } from 'uuid';
import { Track, TrackType, AutomationMode, Effect, FXChainPreset } from '../../types/core';

interface TrackInput {
  name: string;
  type?: TrackType;
  color?: string;
}

interface TrackUpdateInput extends Partial<TrackInput> {
  mute?: boolean;
  solo?: boolean;
  armed?: boolean;
  volume?: number;
  pan?: number;
  automation?: boolean;
  automationMode?: AutomationMode;
}

export class TrackAPI {
  private trackLoader: DataLoader<string, Track | null>;
  private tracks: Map<string, Track>;

  constructor() {
    this.tracks = new Map();
    this.trackLoader = new DataLoader(ids => this.batchLoadTracks(ids));
  }

  private async batchLoadTracks(ids: readonly string[]): Promise<(Track | null)[]> {
    return ids.map(id => this.tracks.get(id) || null);
  }

  async get(id: string): Promise<Track | null> {
    return this.trackLoader.load(id);
  }

  async getAll(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }

  async create(input: TrackInput): Promise<Track> {
    const id = uuidv4();
    const newTrack: Track = {
      id,
      name: input.name,
      type: input.type || TrackType.Audio,
      mute: false,
      solo: false,
      armed: false,
      volume: 0,
      pan: 0,
      automation: false,
      automationMode: AutomationMode.Off,
      automationLanes: [],
      clips: [],
      fx: {
        preset: null,
        effects: [],
        selectedEffectIndex: 0
      },
      color: input.color || '#' + Math.floor(Math.random() * 16777215).toString(16)
    };

    this.tracks.set(id, newTrack);
    return newTrack;
  }

  async update(id: string, input: TrackUpdateInput): Promise<Track> {
    const existingTrack = await this.get(id);
    if (!existingTrack) {
      throw new Error('Track not found');
    }

    const updatedTrack: Track = {
      ...existingTrack,
      ...input
    };

    this.tracks.set(id, updatedTrack);
    this.trackLoader.clear(id);
    return updatedTrack;
  }

  async delete(id: string): Promise<boolean> {
    const success = this.tracks.delete(id);
    this.trackLoader.clear(id);
    return success;
  }
}
