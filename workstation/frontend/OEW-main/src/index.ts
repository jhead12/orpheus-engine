import { startApolloServer } from "../graphql/server";

// ...other imports...

async function startApp() {
  try {
    // Start the Apollo Server
    const { url } = await startApolloServer();
    console.log(`GraphQL API available at ${url}`);

    // Start your existing application...
  } catch (error) {
    console.error("Failed to start application:", error);
  }
}

startApp();
