import React, {useState, useEffect} from 'react';

import StarRatings from './StarRatings';

function Story({story_id, title, avg_rating, num_ratings, genre_names, text_content, publish_date}) {
    return(
      <div className="story">
        <h2>{title}</h2>
        <div className="story__rating-container">
          <span>Rating:</span>
          {
            avg_rating ?
            <>
              <StarRatings
                rating={avg_rating}
                name='overall-rating'
                disabled
              />
              {num_ratings}
            </> :
            <span>N/A</span>
          }
        </div>
        <div>Published on {new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        {
          genre_names && (
          <div className='story__genres'>
            {
              genre_names.split(',').map(genre_name => (<div className="genre" key={genre_name}>{genre_name}</div>))
            }
          </div>
          )
        }
          <div>{text_content}</div>
      </div> 
    );
}

export default Story;
