import DataLoader from "dataloader";
import { v4 as uuidv4 } from "uuid";
import { Effect, BaseEffect } from "../../types/core";

interface EffectInput {
  name: string;
  type: "native" | "juce" | "python";
  enabled?: boolean;
  parameters?: Record<string, any>;
}

export class EffectAPI {
  private effectLoader: DataLoader<string, Effect | null>;
  private effects: Map<string, Effect>;
  private trackEffects: Map<string, Set<string>>;

  constructor() {
    this.effects = new Map();
    this.trackEffects = new Map();
    this.effectLoader = new DataLoader((ids) => this.batchLoadEffects(ids));
  }

  private async batchLoadEffects(
    ids: readonly string[]
  ): Promise<(Effect | null)[]> {
    return ids.map((id) => this.effects.get(id) || null);
  }

  async get(id: string): Promise<Effect | null> {
    return this.effectLoader.load(id);
  }

  async getByTrackId(trackId: string): Promise<Effect[]> {
    const effectIds = this.trackEffects.get(trackId) || new Set();
    const effects = await Promise.all(
      Array.from(effectIds).map((id) => this.get(id))
    );
    return effects.filter((effect): effect is Effect => effect !== null);
  }

  async create(trackId: string, input: EffectInput): Promise<Effect> {
    const id = uuidv4();
    const newEffect: Effect = {
      id,
      name: input.name,
      type: input.type,
      enabled: input.enabled ?? true,
      parameters: input.parameters || {},
    };

    this.effects.set(id, newEffect);

    if (!this.trackEffects.has(trackId)) {
      this.trackEffects.set(trackId, new Set());
    }
    this.trackEffects.get(trackId)!.add(id);

    return newEffect;
  }

  async update(id: string, input: Partial<EffectInput>): Promise<Effect> {
    const existingEffect = await this.get(id);
    if (!existingEffect) {
      throw new Error("Effect not found");
    }

    const updatedEffect: Effect = {
      ...existingEffect,
      ...input,
      parameters: {
        ...existingEffect.parameters,
        ...(input.parameters || {}),
      },
    };

    this.effects.set(id, updatedEffect);
    this.effectLoader.clear(id);
    return updatedEffect;
  }

  async delete(id: string): Promise<boolean> {
    const effect = await this.get(id);
    if (!effect) {
      return false;
    }

    // Remove from effects map
    const success = this.effects.delete(id);

    // Remove from track effects
    for (const [trackId, effectIds] of this.trackEffects.entries()) {
      if (effectIds.has(id)) {
        effectIds.delete(id);
        if (effectIds.size === 0) {
          this.trackEffects.delete(trackId);
        }
      }
    }

    this.effectLoader.clear(id);
    return success;
  }
}
