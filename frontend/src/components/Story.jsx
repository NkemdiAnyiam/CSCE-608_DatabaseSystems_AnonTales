import React, {useState, useEffect} from 'react';

function Story({story_id, title, avg_rating, genre_names, text_content, publish_date}) {
    return(
      <div className="story">
        <div>
          <span>{title}; {avg_rating ? `${avg_rating}/5 Stars;` : ''} {new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        {
          genre_names && (
          <div>
            {
              genre_names.split(',').map(genre_name => (<span key={genre_name}>--{genre_name}--</span>))
            }
          </div>
          )
        }
          <div>{text_content}</div>
      </div> 
    );
}

export default Story;
