import React from "react";
//Rather than using an external css file, I Implemented the library below that helped me with the styling.
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, InputGroup, FormControl, Button, Row, Card} from 'react-bootstrap';
//I imported the library below to help me use the user input implementation.
import { useState, useEffect} from "react";

//I obtained the credentials to use this API by signing up in Spotify.
const client_id = "c020d529e4654214a8bb7d839948ad33"
const client_Secret = "7225f3ab66ba4fa9a84f94fc18c844cb"

function App() {
    //I implemented search input using useState.
    const[searchInput, setSearchInput] = useState("");
    const[accessToken, setAccessToken] = useState("")
    const[albums, setAlbums] = useState([]);

    useEffect(() => {
        // API Token.
        //Spotify's guidelines requires to provide the following information.
        //Notice, I follow the guidelines provided by Spotify. It is required to display this format in order to
        //display the information from the API.
        var parameters = {
            method: 'Post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_Secret
        }
        //Fetch allows to request and access token for a client to use.
        fetch('https://accounts.spotify.com/api/token', parameters)
            .then(result => result.json())
            .then(data => setAccessToken(data.access_token))
    }, [])

    // Search implementation.
    async function search() {
        console.log("Search for " + searchInput); // Expected search.

        //Artist ID.
        //Spotify documentation provides this information used.
        var artistParameters = {
            method: 'Get',
            headers: {
                'Content-Type': 'application/json',
                //Verifies that you are a legit client.
                'Authorization': 'Bearer ' + accessToken
            }
        }
        //Get request with Artist ID (displays all the albums of the searched artist.
        var artist_Id = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist'
            , artistParameters)
            .then(response => response.json())
            .then(data => {return data.artists.items[0].id})

        //Display albums from artist ID.
        var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artist_Id + '/albums'
            + '?include_groups=album&market=US&limit=50', artistParameters)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setAlbums(data.items);
            });
    }

    return(
        <div className="App">
            <Container>
                <InputGroup className="mb-3" size="lg">
                    <FormControl
                        //This allows the user to search for an artist whether they click on search or hit enter.
                    placeholder="Search For Artist"
                    type="input"
                    onKeyPress={event => {
                        if (event.key == "Enter") {
                            search();
                        }
                    }}
                    onChange={event => setSearchInput(event.target.value)}
                    />
                    <Button onClick={search}></Button>
                </InputGroup>
            </Container>
            <Container>
                <Row className="mx-2 row row-cols-4">
                    {albums.map( (album, i) => {
                        return(
                            // I retrieve all the images from the API provided by Spotify.
                            <Card>

                                <Card.Img src={album.images[0].url} />
                                <Card.Body>
                                    <Card.Title>A{album.name}</Card.Title>
                                </Card.Body>
                            </Card>
                        )
                    })}
                </Row>
            </Container>
        </div>
    )
}

export default App;