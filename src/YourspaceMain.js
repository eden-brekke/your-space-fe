import axios from "axios";
import React from "react";
import { Container } from "react-bootstrap";
import { withAuth0 } from "@auth0/auth0-react";
import Profile from "./Profile";
import SearchBar from "./SearchBar";

import MainCard from './MainCard'
let SERVER = process.env.REACT_APP_SERVER;

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      music: [],
      itunesAPI: [],
      query: '',
      showModal: false
    }
  }

  handleMusicInput = (e) => {
    this.setState({
      query: e,
    });
  }

  getItunesData = async (e) => {
    e.preventDefault();
    try{ 
      let itunesData = await axios.get(`${SERVER}/itunes?term=${this.state.query}`);//TODO term= this.state.query
      this.setState({
        itunesAPI: itunesData.data
      });
    }catch (error) {
        console.log('error updating', error.message);
    }
  };


  getMusic = async () => {
    // JSON Web Token = JWT (pronounced JOT)
    if (this.props.auth0.isAuthenticated) {
      // get token:
      const res = await this.props.auth0.getIdTokenClaims();

      const jwt = res.__raw;
      console.log(jwt);
      // config object to make our call 
      const config = {
        method: 'get',
        baseURL: process.env.REACT_APP_SERVER,
        url: '/music',
        headers: { "Authorization": `Bearer ${jwt}` }
      };
      const musicResults = await axios(config);

      console.log(musicResults.data);
      this.setState({
        music: musicResults.data
      })
    }
  }

  postMusic = async (newMusic) => {
    try {
      let results = await axios.post(`${SERVER}/music`, newMusic);
      this.setState({
        music: [...this.state.music, results.data]
      });
    } catch (error) {
      console.error('error', error.response.data);
    }
  }

  updateMusic = async (updatedEntry) => {
    try {
      let url = `${SERVER}/music/${updatedEntry._id}`;
      let updatedMusic = await axios.put(url, updatedEntry);
      console.log(updatedEntry);
      let updatedMusicData = this.state.music.map(currentMusic => {
        return currentMusic._id === updatedEntry._id ?
          updatedMusic.data :
          currentMusic;
      });
      this.setState({
        music: updatedMusicData
      });
    } catch (error) {
      console.log('error updating', error.message);
    }
  };

  deleteMusic = async (id) => {
    try {
      let url = `${SERVER}/music/${id}`;
      await axios.delete(url);
      let updatedMusic = this.state.music.filter(Music => Music._id !== id);
      this.setState({
        music: updatedMusic
      })
    }catch (error){
      console.log('error, doggy', error.response.data);
    }
    this.getMusic();
    };

    componentDidMount() {
      this.getMusic();
    }

    displayModal = () => {
      this.setState({
        showModal: true,
      });
    };
  
    hideModal = () => {
      this.setState({
        showModal: false
      });
    };

  render() {
    let allResults = this.state.itunesAPI.map((query, index) => {
      return (
        <MainCard
        key={index}
        query={query}/>
        );
    })

    return (
      <>
      <Container>
        <Profile />
      </Container>

      <SearchBar handleMusicInput={this.handleMusicInput} getItunesData={this.getItunesData} />
      <main>{allResults}</main>

      </>
    )

  }
}

export default withAuth0(Main)