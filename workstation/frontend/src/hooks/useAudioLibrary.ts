import { useQuery, gql } from '@apollo/client';

const GET_AUDIO_LIBRARY = gql`
  query GetAudioLibrary {
    audioLibrary {
      description
      location
      files {
        id
        filename
        type
        description
        usage
        path
      }
      supported_formats
    }
  }
`;

const GET_AUDIO_FILES = gql`
  query GetAudioFiles {
    audioFiles {
      id
      filename
      type
      description
      usage
      path
      size
      duration
      created_at
      updated_at
    }
  }
`;

export function useAudioLibrary() {
  const { loading, error, data, refetch } = useQuery(GET_AUDIO_LIBRARY);
  
  return {
    loading,
    error,
    library: data?.audioLibrary,
    files: data?.audioLibrary?.files || [],
    refetch
  };
}

export function useAudioFiles() {
  const { loading, error, data, refetch } = useQuery(GET_AUDIO_FILES);
  
  return {
    loading,
    error,
    files: data?.audioFiles || [],
    refetch
  };
}

export function useAudioFile(id: string) {
  const GET_AUDIO_FILE = gql`
    query GetAudioFile($id: ID!) {
      audioFile(id: $id) {
        id
        filename
        type
        description
        usage
        path
        size
        duration
        created_at
        updated_at
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_AUDIO_FILE, {
    variables: { id },
    skip: !id
  });

  return {
    loading,
    error,
    file: data?.audioFile
  };
}
