// App.js

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import "./styles.css"; // Import your CSS file.

// Spotify API credentials
const clientId = "c020d529e4654214a8bb7d839948ad33";
const clientSecret = "7225f3ab66ba4fa9a84f94fc18c844cb";

function App() {
    // Existing state variables
    const [searchInput, setSearchInput] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [albums, setAlbums] = useState([]);
    const [artistAvailable, setArtistAvailable] = useState(true);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    // Fetch access token from Spotify API on component mount
    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                // Set up parameters for access token request
                const parameters = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
                };

                // Fetch access token
                const response = await fetch('https://accounts.spotify.com/api/token', parameters);
                const { access_token } = await response.json();
                setAccessToken(access_token);
            } catch (error) {
                console.error('Error fetching access token:', error);
            }
        };

        // Call the function to fetch access token
        fetchAccessToken();
    }, []);

    // Function to handle search
    async function search() {
        console.log("Search for " + searchInput);

        // Parameters for artist search
        const artistParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };

        try {
            // Fetch artist based on search input
            const response = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist`, artistParameters);
            const data = await response.json();

            if (data.artists.items.length > 0) {
                // If artist is available, fetch albums
                const artistId = data.artists.items[0].id;

                const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US&limit=50`, artistParameters);
                const albumsData = await albumsResponse.json();
                setAlbums(albumsData.items);
                setArtistAvailable(true);
            } else {
                // If artist is not available, update state accordingly
                setArtistAvailable(false);
                setAlbums([]); // Clear albums if artist is not available
            }
        } catch (error) {
            // Handle errors during artist or album fetch
            console.error('Error fetching artist or albums:', error);
            setArtistAvailable(false);
            setAlbums([]); // Clear albums in case of an error
        }
    }

    // Function to handle click on album
    function handleAlbumClick(event, album) {
        event.preventDefault();
        setSelectedAlbum(album);
    }

    // UI rendering
    return (
        <Container>
            <div className="App">
                {/* Form for artist search */}
                <form onSubmit={(e) => { e.preventDefault(); search(); }}>
                    <InputGroup className="mb-3" size="lg">
                        <FormControl
                            placeholder="Search For Artist"
                            type="input"
                            onChange={event => setSearchInput(event.target.value)}
                        />
                        <Button type="submit">Search</Button>
                    </InputGroup>
                </form>

                {/* Display error message if artist is not available */}
                {!artistAvailable && (
                    <div className="custom-alert">
                        <img src="error cat.jpg" alt="Error" className="error-image" />
                        <p>This artist is not available.</p>
                    </div>
                )}

                {/* Display albums if available */}
                {albums.length > 0 && (
                    <Row className="mx-2 row row-cols-1 row-cols-md-2 row-cols-lg-3">
                        {/* Map through albums and display as cards */}
                        {albums.map((album, i) => (
                            <Card key={i} onClick={(e) => handleAlbumClick(e, album)}>
                                {album.images && album.images[0] && (
                                    <Card.Img src={album.images[0].url} alt={album.name} />
                                )}
                                <Card.Body>
                                    <Card.Title>{album.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Artist:</strong> {album.artists.map(artist => artist.name).join(', ')}<br />
                                        <strong>Release Date:</strong> {album.release_date}<br />
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))}
                    </Row>
                )}

                {/* Display selected album information */}
                {selectedAlbum && (
                    <div className="selected-album-info">
                        <h2>{selectedAlbum.name}</h2>
                        <p>
                            <strong>Artist:</strong> {selectedAlbum.artists.map(artist => artist.name).join(', ')}<br />
                            <strong>Release Date:</strong> {selectedAlbum.release_date}<br />
                            <strong>Open on Spotify:</strong> <a href={selectedAlbum.external_urls.spotify} target="_blank" rel="noopener noreferrer">Open</a>
                        </p>
                        <Button onClick={() => setSelectedAlbum(null)}>Close</Button>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default App;
