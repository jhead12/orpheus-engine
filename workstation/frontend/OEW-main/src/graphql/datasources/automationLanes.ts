import DataLoader from "dataloader";
import { v4 as uuidv4 } from "uuid";
import {
  AutomationLane,
  AutomationNode,
  AutomationLaneEnvelope,
} from "../../types/core";

interface AutomationLaneInput {
  label: string;
  envelope: AutomationLaneEnvelope;
  minValue: number;
  maxValue: number;
  enabled?: boolean;
  show?: boolean;
  expanded?: boolean;
}

interface AutomationNodeInput {
  position: { bar: number; beat: number; tick: number };
  value: number;
}

export class AutomationLaneAPI {
  private laneLoader: DataLoader<string, AutomationLane | null>;
  private lanes: Map<string, AutomationLane>;
  private trackLanes: Map<string, Set<string>>;
  private laneNodes: Map<string, Set<string>>;
  private nodes: Map<string, AutomationNode>;

  constructor() {
    this.lanes = new Map();
    this.trackLanes = new Map();
    this.laneNodes = new Map();
    this.nodes = new Map();
    this.laneLoader = new DataLoader((ids) => this.batchLoadLanes(ids));
  }

  private async batchLoadLanes(
    ids: readonly string[]
  ): Promise<(AutomationLane | null)[]> {
    return ids.map((id) => this.lanes.get(id) || null);
  }

  async get(id: string): Promise<AutomationLane | null> {
    return this.laneLoader.load(id);
  }

  async getByTrackId(trackId: string): Promise<AutomationLane[]> {
    const laneIds = this.trackLanes.get(trackId) || new Set();
    const lanes = await Promise.all(
      Array.from(laneIds).map((id) => this.get(id))
    );
    return lanes.filter((lane): lane is AutomationLane => lane !== null);
  }

  async create(
    trackId: string,
    input: AutomationLaneInput
  ): Promise<AutomationLane> {
    const id = uuidv4();
    const newLane: AutomationLane = {
      id,
      label: input.label,
      envelope: input.envelope,
      enabled: input.enabled ?? true,
      minValue: input.minValue,
      maxValue: input.maxValue,
      nodes: [],
      show: input.show ?? true,
      expanded: input.expanded ?? false,
    };

    this.lanes.set(id, newLane);

    if (!this.trackLanes.has(trackId)) {
      this.trackLanes.set(trackId, new Set());
    }
    this.trackLanes.get(trackId)!.add(id);

    return newLane;
  }

  async addNode(
    laneId: string,
    input: AutomationNodeInput
  ): Promise<AutomationNode> {
    const lane = await this.get(laneId);
    if (!lane) {
      throw new Error("Automation lane not found");
    }

    const nodeId = uuidv4();
    const newNode: AutomationNode = {
      id: nodeId,
      pos: input.position,
      value: input.value,
    };

    this.nodes.set(nodeId, newNode);

    if (!this.laneNodes.has(laneId)) {
      this.laneNodes.set(laneId, new Set());
    }
    this.laneNodes.get(laneId)!.add(nodeId);

    // Update the lane's nodes array
    const updatedLane: AutomationLane = {
      ...lane,
      nodes: [...lane.nodes, newNode],
    };
    this.lanes.set(laneId, updatedLane);
    this.laneLoader.clear(laneId);

    return newNode;
  }

  async update(
    id: string,
    input: Partial<AutomationLaneInput>
  ): Promise<AutomationLane> {
    const existingLane = await this.get(id);
    if (!existingLane) {
      throw new Error("Automation lane not found");
    }

    const updatedLane: AutomationLane = {
      ...existingLane,
      ...input,
    };

    this.lanes.set(id, updatedLane);
    this.laneLoader.clear(id);
    return updatedLane;
  }

  async delete(id: string): Promise<boolean> {
    const lane = await this.get(id);
    if (!lane) {
      return false;
    }

    // Delete associated nodes
    const nodeIds = this.laneNodes.get(id) || new Set();
    for (const nodeId of nodeIds) {
      this.nodes.delete(nodeId);
    }
    this.laneNodes.delete(id);

    // Remove from lanes map
    const success = this.lanes.delete(id);

    // Remove from track lanes
    for (const [trackId, laneIds] of this.trackLanes.entries()) {
      if (laneIds.has(id)) {
        laneIds.delete(id);
        if (laneIds.size === 0) {
          this.trackLanes.delete(trackId);
        }
      }
    }

    this.laneLoader.clear(id);
    return success;
  }
}
