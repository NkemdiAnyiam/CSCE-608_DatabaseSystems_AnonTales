import React, {useState, useEffect, useContext} from 'react';
import LoadingIcon from './LoadingIcon';

import SerialNoContext from '../contexts/SerialNoContext';

import StarRatings from './StarRatings';

function Story({story_id, user_serial_no, title, avg_rating, num_ratings, genre_names, text_content, publish_date, onDelete}) {
    const [deletingStory, setDeletingStory] = useState(false);
    const [storyDeleted, setStoryDeleted] = useState(false);
    const mySerialNo = useContext(SerialNoContext);

    const handleDeletion = async (e) => {
      e.preventDefault();
      setDeletingStory(true);

      await fetch('/deleteStory', {
        method: 'DELETE',
        body: JSON.stringify({storyFields: {story_id}}),
        headers:{'Content-Type':'application/json'}
      })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err);
        }

        setStoryDeleted(true);
        setDeletingStory(false);
        onDelete(story_id);
      })
      .catch(err => {
        setDeletingStory(false);
        alert(err);
      });
    }

    if (storyDeleted) {
      return <div className="story"><div className="story__title">{'[Deleted]'}</div></div>;
    }

    if (deletingStory) {
      return (
        <div className="story">
          <LoadingIcon message={`Deleting ${title}`} dark />
        </div>
      )
    }

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
            <span>No ratings yet</span>
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
        
        {
          mySerialNo === user_serial_no &&
          <button className="story__delete-button button button--red" onClick={handleDeletion}>Delete</button>
        }
      </div> 
    );
}

export default Story;
