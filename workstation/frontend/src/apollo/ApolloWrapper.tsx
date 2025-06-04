import React, { ReactNode } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider as BaseApolloProvider } from '@apollo/client';

// Create the Apollo client
const client = new ApolloClient({
  uri: 'http://localhost:7008/api/graphql',
  cache: new InMemoryCache()
});

interface ApolloWrapperProps {
  children: ReactNode;
}

// Cast ApolloProvider to fix React 18/19 compatibility
const ApolloProvider = BaseApolloProvider as React.ComponentType<React.PropsWithChildren<{ client: ApolloClient<any> }>>;

// Apollo wrapper component that can be used in App.tsx
export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
