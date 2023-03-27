import React, {useState, useEffect, useContext} from 'react';

import SerialNoContext from '../contexts/SerialNoContext';

function Review({story_id, user_serial_no, text_content, publish_date, num_thumbs_up, num_thumbs_down, my_thumb_value}) {
  useEffect(() => {

  }, [])

  const mySerialNo = useContext(SerialNoContext);

  const [myThumbState, setMyThumbState] = useState(my_thumb_value);

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
        <div>{new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div>{text_content}</div>
        <div><span>{num_thumbs_up + myThumbState ?? 0}</span> <span>{num_thumbs_down + (1 - (myThumbState ?? 1))}</span></div>
        
        {
          mySerialNo !== user_serial_no &&
          <>
            <button onClick={() => {
              if (myThumbState === null) { addThumb(1); }
              else if (myThumbState === 1) { deleteThumb(); }
              else { updateThumb(1) }
            }}>
              LIKE
            </button>---

            <button onClick={() => {
              if (myThumbState === null) { addThumb(0); }
              else if (myThumbState === 0) { deleteThumb(); }
              else { updateThumb(0); }
            }}>
              DISLIKE
            </button>
          </>
        }
    </div>
  );
}

export default Review;
