import React, { useState } from 'react';

const AudioSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]); // Replace 'any' with the appropriate type

    const handleSearch = async () => {
        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data.results); // Adjust based on the actual response structure
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <div>
            <h2>Audio Search</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for audio segments..."
            />
            <button onClick={handleSearch}>Search</button>
            <div>
                {results.length > 0 ? (
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>{result.text}</li> // Adjust based on the actual result structure
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
};

export default AudioSearch;