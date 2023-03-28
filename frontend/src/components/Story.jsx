import React, {useState, useEffect} from 'react';

function Story({story_id, title, avg_rating, genre_names, text_content, publish_date}) {
    return(
      <div className="story">
        <h2>{title}</h2>
        <div>Rating: {avg_rating ? `${avg_rating}/5 Stars;` : ''}</div>
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
