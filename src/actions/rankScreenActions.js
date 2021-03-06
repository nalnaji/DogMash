import * as types from './actionTypes';
import * as config from '../constants.js';

export function rivalFetchInit() {
  return {
    type: types.RIVAL_FETCH_INIT
  };
}

export function rivalFetchSuccess(dog1, dog2) {
  return {
    type: types.RIVAL_FETCH_SUCCESS,
    dog1: dog1,
    dog2: dog2
  };
}

export function rivalFetchFail(error) {
  return {
    type: types.RIVAL_FETCH_FAIL,
    error: error
  };
}

export function rivalVoteInit() {
  return {
    type: types.RIVAL_VOTE_INIT
  };
}

export function fetchRivals() {
  return function (dispatch) {
    dispatch(rivalFetchInit())
      return fetch(config.get_rival_dogs_url)
      .then(response => response.json())
      .then(json => {
          var dog1 = json['dogs'][0];
          var dog2 = json['dogs'][1];
          dispatch(rivalFetchSuccess(dog1, dog2))
      }).catch( (error) => {
          dispatch(rivalFetchFail(error))
      });
  }
}

function updateRivalRatings(winner, loser) {
    winner.wins++;
    loser.losses++;
    var newWinnerRating = winner["rating"] + 400/(winner["wins"] + winner["losses"]) * (1 - 1/(1+ Math.pow(10, (loser["rating"] - winner["rating"])/400)))
    var newLoserRating = loser["rating"] + 400/(loser["wins"] + loser["losses"]) * (- 1/(1+ Math.pow(10, (winner["rating"] - loser["rating"])/400)));
    winner["rating"] = newWinnerRating;
    loser["rating"] = newLoserRating;
}

export function rivalVote(winner, loser) {
  return function (dispatch) {
    dispatch(rivalVoteInit())

    //TODO: Calculate new winner and loser
    updateRivalRatings(winner, loser);

    //Submit two requests via Fetch call
    //This is because our RESTful API requires
    //one API call for both dogs
    return Promise.all([
        dispatch(updateRival(winner)),
        dispatch(updateRival(loser))
    ]).then(() => {
    }).catch((error) => {
    });
  }
}

export function updateRival(dog) {
  return function (dispatch) {
    return fetch(config.put_rival_dogs_url(dog), {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dog)})
      .then(response => response.json())
      .then(json => {
      }).catch( (error) => {
      });
  }
}

