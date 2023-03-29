import React from 'react';

import ReactStarRatings from 'react-star-ratings';

function StarRatings({rating, disabled, name='', onChangeRating=() => {}}) {
  if (rating == null) {
    throw new Error('ERROR: Must specify rating in StarRatings');
  }

  return (
    <div
      className={`star-ratings ${disabled ? 'star-ratings--disabled' : ''}`}
      title={rating.toFixed(1)}
    >
      <ReactStarRatings
        rating={rating}
        starRatedColor="#aa0022"
        changeRating={onChangeRating}
        numberOfStars={5}
        name={name}
      />
    </div>
  )
}

export default StarRatings;
