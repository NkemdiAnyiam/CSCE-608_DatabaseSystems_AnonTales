import React, {useState, useEffect, useContext} from 'react';

import SerialNoContext from '../contexts/SerialNoContext';

import LoadingIcon from './LoadingIcon';

function Prompt({prompt_id, genre_names, text_content, publish_date, user_serial_no, onDelete}) {
    const [deletingPrompt, setDeletingPrompt] = useState(false);
    const [promptDeleted, setPromptDeleted] = useState(false);
    const mySerialNo = useContext(SerialNoContext);

    const handleDeletion = async (e) => {
      e.preventDefault();
      setDeletingPrompt(true);

      await fetch('/deletePrompt', {
        method: 'DELETE',
        body: JSON.stringify({promptFields: {prompt_id}}),
        headers:{'Content-Type':'application/json'}
      })
      .then(({ok}) => {
        if (ok) {
          setPromptDeleted(true);
          setDeletingPrompt(false);
          onDelete(prompt_id);
        }
      })
      .catch(err => {
        setDeletingPrompt(false);
        console.error(err);
        alert('Error occured while attempting to delete prompt');
      })
    }

    if (promptDeleted) {
      return <div className="prompt"><div>{'[Deleted]'}</div></div>;
    }

    if (deletingPrompt) {
      return (
        <div className="prompt">
          <LoadingIcon message={`Deleting prompt`} dark />
        </div>
      )
    }

    return(
      <div className="prompt">
        <div>
          <span>{new Date(publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        {
          genre_names && (
            <div className='prompt__genres'>
            {
              genre_names.split(',').map(genre_name => (<div className="genre" key={genre_name}>{genre_name}</div>))
            }
          </div>
          )
        }
        <div>{text_content}</div>

        {
          mySerialNo === user_serial_no &&
          <button className="prompt__delete-button button button--red" onClick={handleDeletion}>Delete</button>
        }
      </div> 
    );
}

export default Prompt;
