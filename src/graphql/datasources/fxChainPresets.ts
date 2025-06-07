import DataLoader from "dataloader";
import { v4 as uuidv4 } from "uuid";
import { FXChainPreset, Effect } from "../../types/core";

interface FXChainPresetInput {
  name: string;
  effects: Effect[];
}

export class FXChainPresetAPI {
  private presetLoader: DataLoader<string, FXChainPreset | null>;
  private presets: Map<string, FXChainPreset>;

  constructor() {
    this.presets = new Map();
    this.presetLoader = new DataLoader((ids) => this.batchLoadPresets(ids));
  }

  private async batchLoadPresets(
    ids: readonly string[]
  ): Promise<(FXChainPreset | null)[]> {
    return ids.map((id) => this.presets.get(id) || null);
  }

  async get(id: string): Promise<FXChainPreset | null> {
    return this.presetLoader.load(id);
  }

  async getAll(): Promise<FXChainPreset[]> {
    return Array.from(this.presets.values());
  }

  async create(input: FXChainPresetInput): Promise<FXChainPreset> {
    const id = uuidv4();
    const newPreset: FXChainPreset = {
      id,
      name: input.name,
      effects: input.effects,
    };

    this.presets.set(id, newPreset);
    return newPreset;
  }

  async update(
    id: string,
    input: Partial<FXChainPresetInput>
  ): Promise<FXChainPreset> {
    const existingPreset = await this.get(id);
    if (!existingPreset) {
      throw new Error("FX Chain Preset not found");
    }

    const updatedPreset: FXChainPreset = {
      ...existingPreset,
      ...input,
      effects: input.effects || existingPreset.effects,
    };

    this.presets.set(id, updatedPreset);
    this.presetLoader.clear(id);
    return updatedPreset;
  }

  async delete(id: string): Promise<boolean> {
    const success = this.presets.delete(id);
    this.presetLoader.clear(id);
    return success;
  }
}
