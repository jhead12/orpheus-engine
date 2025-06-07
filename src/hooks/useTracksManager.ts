import { gql, useQuery, useMutation } from "@apollo/client";

// Query to get all tracks
const GET_TRACKS = gql`
  query GetTracks {
    tracks {
      id
      name
      type
      mute
      solo
      armed
      volume
      pan
      clips {
        id
        name
        start
        end
      }
      automationLanes {
        id
        label
        envelope
      }
    }
  }
`;

// Mutation to create a new track
const CREATE_TRACK = gql`
  mutation CreateTrack($input: TrackInput!) {
    createTrack(input: $input) {
      id
      name
      type
    }
  }
`;

export function useTracksManager() {
  // Query tracks
  const { loading, error, data } = useQuery(GET_TRACKS);

  // Create track mutation
  const [createTrack] = useMutation(CREATE_TRACK, {
    update(cache, { data: { createTrack } }) {
      const { tracks } = cache.readQuery({ query: GET_TRACKS }) || {
        tracks: [],
      };
      cache.writeQuery({
        query: GET_TRACKS,
        data: { tracks: [...tracks, createTrack] },
      });
    },
  });

  const addNewTrack = async (name: string, type: string) => {
    try {
      await createTrack({
        variables: {
          input: {
            name,
            type,
          },
        },
      });
    } catch (err) {
      console.error("Error creating track:", err);
    }
  };

  return {
    tracks: data?.tracks || [],
    loading,
    error,
    addNewTrack,
  };
}
