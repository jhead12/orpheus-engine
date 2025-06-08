import { GraphQLScalarType } from "graphql";
import { audioContext } from "../services/utils/audio";

const AudioBufferScalar = new GraphQLScalarType({
  name: "AudioBuffer",
  description: "AudioBuffer custom scalar type",
  serialize(value: AudioBuffer) {
    // Convert AudioBuffer to a format that can be sent over the wire
    const channels = [];
    for (let i = 0; i < value.numberOfChannels; i++) {
      channels.push(Array.from(value.getChannelData(i)));
    }
    return {
      numberOfChannels: value.numberOfChannels,
      length: value.length,
      sampleRate: value.sampleRate,
      duration: value.duration,
      channels,
    };
  },
  parseValue(value: any) {
    // Convert wire format back to AudioBuffer
    const buffer = audioContext.createBuffer(
      value.numberOfChannels,
      value.length,
      value.sampleRate
    );
    value.channels.forEach((channel: Float32Array, i: number) => {
      buffer.copyToChannel(Float32Array.from(channel), i);
    });
    return buffer;
  },
});

const TimelinePositionScalar = new GraphQLScalarType({
  name: "TimelinePosition",
  description: "TimelinePosition custom scalar type",
  serialize(value: any) {
    return {
      bar: value.bar,
      beat: value.beat,
      tick: value.tick,
    };
  },
  parseValue(value: any) {
    return new TimelinePosition(value.bar, value.beat, value.tick);
  },
});

export const resolvers = {
  AudioBuffer: AudioBufferScalar,
  TimelinePosition: TimelinePositionScalar,

  Query: {
    track: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return dataSources.tracks.get(id);
    },
    tracks: async (_: any, __: any, { dataSources }: any) => {
      return dataSources.tracks.getAll();
    },
    clip: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return dataSources.clips.get(id);
    },
    clips: async (
      _: any,
      { trackId }: { trackId: string },
      { dataSources }: any
    ) => {
      return dataSources.clips.getByTrackId(trackId);
    },
    automationLane: async (
      _: any,
      { id }: { id: string },
      { dataSources }: any
    ) => {
      return dataSources.automationLanes.get(id);
    },
    automationLanes: async (
      _: any,
      { trackId }: { trackId: string },
      { dataSources }: any
    ) => {
      return dataSources.automationLanes.getByTrackId(trackId);
    },
    effect: async (_: any, { id }: { id: string }, { dataSources }: any) => {
      return dataSources.effects.get(id);
    },
    effects: async (
      _: any,
      { trackId }: { trackId: string },
      { dataSources }: any
    ) => {
      return dataSources.effects.getByTrackId(trackId);
    },
    fxChainPreset: async (
      _: any,
      { id }: { id: string },
      { dataSources }: any
    ) => {
      return dataSources.fxChainPresets.get(id);
    },
    fxChainPresets: async (_: any, __: any, { dataSources }: any) => {
      return dataSources.fxChainPresets.getAll();
    },
    audioAnalysis: async (
      _: any,
      { clipId }: { clipId: string },
      { dataSources }: any
    ) => {
      const clip = await dataSources.clips.get(clipId);
      if (!clip.audio?.audioBuffer) {
        return null;
      }
      return dataSources.audioAnalysis.analyze(clip.audio.audioBuffer);
    },
  },

  Mutation: {
    createTrack: async (_: any, { input }: any, { dataSources }: any) => {
      return dataSources.tracks.create(input);
    },
    updateTrack: async (_: any, { id, input }: any, { dataSources }: any) => {
      return dataSources.tracks.update(id, input);
    },
    deleteTrack: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.tracks.delete(id);
    },

    createClip: async (
      _: any,
      { trackId, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.clips.create(trackId, input);
    },
    updateClip: async (_: any, { id, input }: any, { dataSources }: any) => {
      return dataSources.clips.update(id, input);
    },
    deleteClip: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.clips.delete(id);
    },

    createAutomationLane: async (
      _: any,
      { trackId, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.automationLanes.create(trackId, input);
    },
    updateAutomationLane: async (
      _: any,
      { id, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.automationLanes.update(id, input);
    },
    deleteAutomationLane: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.automationLanes.delete(id);
    },

    addAutomationNode: async (
      _: any,
      { laneId, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.automationNodes.create(laneId, input);
    },
    updateAutomationNode: async (
      _: any,
      { id, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.automationNodes.update(id, input);
    },
    deleteAutomationNode: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.automationNodes.delete(id);
    },

    addEffect: async (
      _: any,
      { trackId, input }: any,
      { dataSources }: any
    ) => {
      return dataSources.effects.create(trackId, input);
    },
    updateEffect: async (_: any, { id, input }: any, { dataSources }: any) => {
      return dataSources.effects.update(id, input);
    },
    deleteEffect: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.effects.delete(id);
    },

    createFXChainPreset: async (
      _: any,
      { name, effects }: any,
      { dataSources }: any
    ) => {
      return dataSources.fxChainPresets.create({ name, effects });
    },
    updateFXChainPreset: async (
      _: any,
      { id, name, effects }: any,
      { dataSources }: any
    ) => {
      return dataSources.fxChainPresets.update(id, { name, effects });
    },
    deleteFXChainPreset: async (_: any, { id }: any, { dataSources }: any) => {
      return dataSources.fxChainPresets.delete(id);
    },
  },
};
