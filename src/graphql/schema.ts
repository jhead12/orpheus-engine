import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar AudioBuffer
  scalar TimelinePosition

  enum TrackType {
    AUDIO
    MIDI
    SEQUENCER
  }

  enum AutomationMode {
    READ
    WRITE
    TOUCH
    LATCH
    OFF
  }

  enum AutomationLaneEnvelope {
    VOLUME
    PAN
    SEND
    FILTER
    TEMPO
    EFFECT
  }

  type AutomationNode {
    id: ID!
    position: TimelinePosition!
    value: Float!
    curve: Float
  }

  type AutomationLane {
    id: ID!
    label: String!
    envelope: AutomationLaneEnvelope!
    enabled: Boolean!
    minValue: Float!
    maxValue: Float!
    nodes: [AutomationNode!]!
    show: Boolean!
    expanded: Boolean!
  }

  type Effect {
    id: ID!
    name: String!
    enabled: Boolean!
    type: String!
    parameters: JSON
  }

  type FXChainPreset {
    id: ID!
    name: String!
    effects: [Effect!]!
  }

  type AudioData {
    audioBuffer: AudioBuffer
    buffer: AudioBuffer
    waveform: [Float!]!
    start: TimelinePosition!
    end: TimelinePosition!
  }

  type Clip {
    id: ID!
    name: String!
    type: TrackType!
    start: TimelinePosition!
    end: TimelinePosition!
    loopEnd: TimelinePosition!
    startLimit: TimelinePosition
    endLimit: TimelinePosition
    muted: Boolean!
    audio: AudioData
  }

  type TrackIO {
    id: ID!
    name: String!
    active: Boolean!
  }

  type FXChain {
    preset: FXChainPreset
    selectedEffectIndex: Int!
    effects: [Effect!]!
  }

  type Track {
    id: ID!
    name: String!
    type: TrackType!
    color: String!
    mute: Boolean!
    solo: Boolean!
    armed: Boolean!
    volume: Float!
    pan: Float!
    automation: Boolean!
    automationMode: AutomationMode!
    automationLanes: [AutomationLane!]!
    clips: [Clip!]!
    effects: [Effect!]
    fx: FXChain!
    inputs: [TrackIO!]
    outputs: [TrackIO!]
  }

  type AudioAnalysisSpectrum {
    frequencies: [Float!]!
    magnitudes: [Float!]!
  }

  type AudioAnalysisSpectrogram {
    data: [[Float!]!]!
    timeAxis: [Float!]!
    frequencyAxis: [Float!]!
  }

  type AudioAnalysisResults {
    waveform: [Float!]
    spectrum: AudioAnalysisSpectrum
    spectrogram: AudioAnalysisSpectrogram
  }

  type Query {
    track(id: ID!): Track
    tracks: [Track!]!
    clip(id: ID!): Clip
    clips(trackId: ID!): [Clip!]!
    automationLane(id: ID!): AutomationLane
    automationLanes(trackId: ID!): [AutomationLane!]!
    effect(id: ID!): Effect
    effects(trackId: ID!): [Effect!]!
    fxChainPreset(id: ID!): FXChainPreset
    fxChainPresets: [FXChainPreset!]!
    audioAnalysis(clipId: ID!): AudioAnalysisResults
  }

  input TimelinePositionInput {
    bar: Int!
    beat: Int!
    tick: Int!
  }

  input AutomationNodeInput {
    position: TimelinePositionInput!
    value: Float!
    curve: Float
  }

  input EffectParametersInput {
    type: String!
    value: JSON!
  }

  input TrackInput {
    name: String!
    type: TrackType!
    color: String
  }

  input ClipInput {
    name: String!
    type: TrackType!
    start: TimelinePositionInput!
    end: TimelinePositionInput!
    loopEnd: TimelinePositionInput!
    muted: Boolean
  }

  input AutomationLaneInput {
    label: String!
    envelope: AutomationLaneEnvelope!
    minValue: Float!
    maxValue: Float!
    enabled: Boolean
    show: Boolean
    expanded: Boolean
  }

  input EffectInput {
    name: String!
    type: String!
    enabled: Boolean
    parameters: JSON
  }

  type Mutation {
    createTrack(input: TrackInput!): Track!
    updateTrack(id: ID!, input: TrackInput!): Track!
    deleteTrack(id: ID!): Boolean!

    createClip(trackId: ID!, input: ClipInput!): Clip!
    updateClip(id: ID!, input: ClipInput!): Clip!
    deleteClip(id: ID!): Boolean!

    createAutomationLane(
      trackId: ID!
      input: AutomationLaneInput!
    ): AutomationLane!
    updateAutomationLane(id: ID!, input: AutomationLaneInput!): AutomationLane!
    deleteAutomationLane(id: ID!): Boolean!

    addAutomationNode(laneId: ID!, input: AutomationNodeInput!): AutomationNode!
    updateAutomationNode(id: ID!, input: AutomationNodeInput!): AutomationNode!
    deleteAutomationNode(id: ID!): Boolean!

    addEffect(trackId: ID!, input: EffectInput!): Effect!
    updateEffect(id: ID!, input: EffectInput!): Effect!
    deleteEffect(id: ID!): Boolean!

    createFXChainPreset(name: String!, effects: [EffectInput!]!): FXChainPreset!
    updateFXChainPreset(
      id: ID!
      name: String
      effects: [EffectInput!]
    ): FXChainPreset!
    deleteFXChainPreset(id: ID!): Boolean!
  }
`;
