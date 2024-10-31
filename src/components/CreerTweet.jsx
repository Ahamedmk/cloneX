import React, { useState } from 'react';

function CreerTweet({ addTweet }) {
  const [tweetContenu, setTweetContenu] = useState('');

  const gererChangement = (e) => {
    setTweetContenu(e.target.value);
  };

  const soumettreTweet = () => {
    // Appeler la fonction pour ajouter le tweet
    addTweet(tweetContenu);
    // Réinitialiser le champ après la soumission
    setTweetContenu('');
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex">
          <img
            src="https://via.placeholder.com/50"
            alt="Profil"
            className="rounded-circle me-3"
          />
          <textarea
            className="form-control"
            rows="3"
            placeholder="Quoi de neuf ?"
            value={tweetContenu}
            onChange={gererChangement}
            style={{ resize: 'none' }}
          ></textarea>
        </div>
        <div className="text-end mt-2">
          <button
            className="btn btn-primary"
            onClick={soumettreTweet}
            disabled={!tweetContenu.trim()}
          >
            Tweeter
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreerTweet;
