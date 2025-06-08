import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { TrackAPI } from "./datasources/tracks";
import { ClipAPI } from "./datasources/clips";
import { AutomationLaneAPI } from "./datasources/automationLanes";
import { EffectAPI } from "./datasources/effects";
import { FXChainPresetAPI } from "./datasources/fxChainPresets";
import { AudioAnalysisAPI } from "./datasources/audioAnalysis";

export async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: async () => {
      const dataSources = {
        tracks: new TrackAPI(),
        clips: new ClipAPI(),
        automationLanes: new AutomationLaneAPI(),
        effects: new EffectAPI(),
        fxChainPresets: new FXChainPresetAPI(),
        audioAnalysis: new AudioAnalysisAPI(),
      };

      return { dataSources };
    },
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at ${url}`);

  return { server, url };
}
