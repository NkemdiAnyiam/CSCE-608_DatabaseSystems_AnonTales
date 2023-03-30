import React, {useState, useEffect} from 'react';

import StarRatings from './StarRatings';

function Story({story_id, title, avg_rating, num_ratings, genre_names, text_content, publish_date}) {
    return(
      <div className="story">
        <h2 className="story__title">{title}</h2>

        <div className="story__rating-container story__small-text">
          <span>Rating:</span>
          {
            avg_rating ?
            <>
              <StarRatings
                rating={avg_rating}
                name='overall-rating'
                disabled
              />
              <span>({num_ratings} ratings)</span>
            </> :
            <span>N/A</span>
          }
        </div>

        <div className={`story__small-text`}>
          Published on {new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        {
          genre_names && (
          <div className='story__genres'>
            {
              genre_names.split(',').map(genre_name => (<div className="genre" key={genre_name}>{genre_name}</div>))
            }
          </div>
          )
        }
        <div className={`story__text-content`}>{text_content}</div>
      </div> 
    );
}

export default Story;
