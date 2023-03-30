import React, {useState, useEffect, useContext} from 'react';

import SerialNoContext from '../contexts/SerialNoContext';

function Review({story_id, user_serial_no, text_content, publish_date, num_thumbs_up, num_thumbs_down, my_thumb_value,
deleteReview}) {
  useEffect(() => {

  }, [])

  const mySerialNo = useContext(SerialNoContext);

  const [myThumbState, setMyThumbState] = useState(my_thumb_value);
  const [isOwnReview, setIsOwnReview] = useState(user_serial_no === mySerialNo);

  const addThumb = async (bin_value) => {
    const res = await fetch(
      '/addThumb',
      {
        method: 'POST',
        body: JSON.stringify({
          reviewer_serial_no: user_serial_no,
          story_id,
          bin_value: bin_value
        }),
        headers:{'Content-Type':'application/json'}}
    );
    
    res.ok && setMyThumbState(bin_value);
  }

  const updateThumb = async (bin_value) => {
    const res = await fetch(
      '/updateThumb',
      {
        method: 'PUT',
        body: JSON.stringify({
          reviewer_serial_no: user_serial_no,
          story_id,
          bin_value: bin_value
        }),
        headers:{'Content-Type':'application/json'}}
    );
    res.ok && setMyThumbState(bin_value);
  }

  const deleteThumb = async () => {
    const res = await fetch('/deleteThumb', {
      method: 'DELETE',
      body: JSON.stringify({
          reviewer_serial_no: user_serial_no,
          story_id,
      }),
      headers:{'Content-Type':'application/json'}
    });
    res.ok && setMyThumbState(null);
  }

  return(
    <div className="review">
        <div className="review__publish-date">
          {new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div className="review__text-content">{text_content}</div>
        {
          isOwnReview &&
          <button onClick={() => deleteReview()}>
              DELETE
          </button>
        }
        
        <div className="review__thumbs">
          <button
            className={`review__thumb review__thumb--up ${isOwnReview ? 'disabled' : ''}`}
            disabled={isOwnReview}
            onClick={() => {
              if (isOwnReview) { return; }
              else if (myThumbState === null) { addThumb(1); }
              else if (myThumbState === 1) { deleteThumb(); }
              else { updateThumb(1) }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
            </svg>
            <span>{num_thumbs_up + myThumbState ?? 0}</span>
          </button>

          <button
            className={`review__thumb review__thumb--down`}
            disabled={isOwnReview}
            onClick={() => {
              if (isOwnReview) { return; }
              else if (myThumbState === null) { addThumb(0); }
              else if (myThumbState === 0) { deleteThumb(); }
              else { updateThumb(0); }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z"/>
            </svg>
            <span>{num_thumbs_down + (1 - (myThumbState ?? 1))}</span>
          </button>
        </div>
    </div>
  );
}

export default Review;
