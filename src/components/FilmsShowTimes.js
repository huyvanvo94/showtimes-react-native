'use strict';

import React, {Component} from 'react';
import Movie from './Movie';
import {
    Button,
    View,
    FlatList,
    StyleSheet,
    Dimensions,
    SafeAreaView
}
from 'react-native';

import {addMovie} from "../actions/movies";
import {addFilm} from "../actions/films";
import {connect} from 'react-redux';
import axios from 'axios';
import {defaultMovieGlueHeader, MOVIE_GLU_API} from "../constants/constants";
import {setGeolocation} from "../actions/app.state";

const window = Dimensions.get('window');


function mapStateToProps(state) {

    return {
        myMovies: state.moviesReducer.movies.slice(),
        filmsCollection: state.filmsReducer.films.slice(),
        appState:  Object.assign({}, state.appStateReducer )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        addMovie: (payload) => dispatch(addMovie(payload)),
        addFilm: (payload) => dispatch(addFilm(payload)),
        setGeolocation: (payload) => dispatch(setGeolocation(payload))

    }
}

class FilmsShowTimes extends Component {


    static navigationOptions = ({navigation, screenProps}) => {
        const params = navigation.state.params || {};

        return {
            title: params.title
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            lat: null, lng: null
        }
    }

    fetchGeolocation = ({callback}) => {
        navigator.geolocation.watchPosition((pos) => {

            this.props.setGeolocation({lat: pos.coords.latitude, lng: pos.coords.longitude});

            if(callback) {
                callback( );
            }

        }, (err) => {
            console.log(err.message);
        });
    };


    fetchMovies = () => {

        let url = MOVIE_GLU_API + "/filmsNowShowing";
        let headers = defaultMovieGlueHeader;


        if(this.props.appState.location.lat && this.props.appState.location.lng){
            console.log('Location: '+`${this.props.appState.location.lat}; ${this.props.appState.location.lng}`);

            headers.Geolocation = `${this.props.appState.location.lat}; ${this.props.appState.location.lng}`;

        }



        axios.get(url, { headers : headers})
            .then((res) =>  {
                let films = res.data.films ;

                films.forEach((film) => {
                    this.props.addFilm(film);
                })
            })
            .catch((err) => console.log( err ));
    };

    _setNavigationParams() {
        const title = 'Watch a movie';
        const headerRight  = <Button
                                    title="My Movies"
                                    onPress={()=>
                                        this.props.navigation.navigate('MyMovies')}
                             />;

        this.props.navigation.setParams({
            title,
            headerRight
        });

    }


    componentDidMount() {
        // Set up UI
        this._setNavigationParams();

        this.fetchGeolocation({
            callback: this.fetchMovies
        });

    }


    render() {

        let films = this.props.filmsCollection;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                <View style={styles.container}>
                    <FlatList
                        data={films}
                        renderItem={({ item }) => (
                            <Movie film={item} width={window.width/2 }
                                   height={300}
                                   push={
                                       () => {
                                           this.props.navigation.navigate('DetailMovie',
                                            {film: item});
                                       }
                                   }/>
                        )}
                        //Setting the number of column
                        numColumns={2}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
    },
    list: {

    }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilmsShowTimes);