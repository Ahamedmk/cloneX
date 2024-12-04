import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../store/AuthProvider';
import { db } from '../firebase';
import { ref, update, onValue, push, remove } from 'firebase/database';

function Tweet({ tweet }) {
  console.log('Tweet component rendered. tweet.id:', tweet.id);
  const [enEdition, setEnEdition] = useState(false);
  const [nouveauContenu, setNouveauContenu] = useState(tweet.contenu);
  const [commentaire, setCommentaire] = useState('');
  const [comments, setComments] = useState([]);
  const { user } = useContext(AuthContext);
  const estAuteur = user && user.uid === tweet.uid;

  // Synchroniser 'nouveauContenu' lorsque 'tweet.contenu' change
  useEffect(() => {
    console.log('Le composant Tweet a été re-rendu pour le tweet :', tweet.id);
    setNouveauContenu(tweet.contenu);
  }, [tweet.contenu]);

  // Charger les commentaires du tweet
  useEffect(() => {
    const commentsRef = ref(db, `tweets/${tweet.id}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const commentsData = [];
      snapshot.forEach((childSnapshot) => {
        commentsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      // Trier les commentaires par date croissante
      commentsData.sort((a, b) => a.date - b.date);
      setComments(commentsData);
    });

    // Nettoyer l'abonnement lors du démontage
    return () => {
      unsubscribe();
    };
  }, [tweet.id]);

  // Fonction pour ajouter un commentaire
  const ajouterCommentaire = async () => {
    if (!user) {
      alert('Vous devez être connecté pour commenter.');
      return;
    }
    if (!commentaire.trim()) {
      return;
    }

    const commentaireData = {
      contenu: commentaire,
      date: Date.now(),
      username: user.displayName || user.email,
      uid: user.uid,
    };

    try {
      if (!tweet.id) {
        console.error("Le tweet n'a pas d'ID défini.");
        return;
      }
      const commentsRef = ref(db, `tweets/${tweet.id}/comments`);
      await push(commentsRef, commentaireData);
      setCommentaire('');
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
    }
  };

  // Fonction pour supprimer un tweet
  const supprimerLeTweet = async () => {
    if (!user || user.uid !== tweet.uid) {
      alert("Vous ne pouvez pas supprimer ce tweet.");
      return;
    }

    try {
      const tweetRef = ref(db, `tweets/${tweet.id}`);
      await remove(tweetRef);
      console.log(`Tweet ${tweet.id} supprimé avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression du tweet :", error);
    }
  };

  // Fonction pour modifier un tweet
  const modifierLeTweet = async () => {
    if (!user || user.uid !== tweet.uid) {
      alert("Vous ne pouvez pas modifier ce tweet.");
      return;
    }

    try {
      const tweetRef = ref(db, `tweets/${tweet.id}`);
      await update(tweetRef, {
        contenu: nouveauContenu,
        date: Date.now(), // Met à jour la date de modification
        // Ne pas inclure 'uid' ici
      });
      setEnEdition(false);
      console.log(`Tweet ${tweet.id} modifié avec succès`);
    } catch (error) {
      console.error("Erreur lors de la modification du tweet :", error);
      alert("Erreur lors de la modification du tweet : " + error.message);
    }
  };

  // Fonction pour annuler la modification
  const annulerModification = () => {
    setNouveauContenu(tweet.contenu);
    setEnEdition(false);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex">
          <div className="w-100">
            <div className="d-flex justify-content-between">
              <h5 className="card-title mb-1">{tweet.username}</h5>
              <small className="text-muted">
                {new Date(tweet.date).toLocaleString()}
              </small>
            </div>
            {enEdition ? (
              <>
                <textarea
                  className="form-control"
                  rows="3"
                  value={nouveauContenu}
                  onChange={(e) => setNouveauContenu(e.target.value)}
                  style={{ resize: 'none' }}
                ></textarea>
                <div className="mt-2 text-end">
                  <button
                    className="btn btn-primary me-2"
                    onClick={modifierLeTweet}
                    disabled={!nouveauContenu.trim()}
                  >
                    Sauvegarder
                  </button>
                  <button className="btn btn-secondary" onClick={annulerModification}>
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="card-text">{tweet.contenu}</p>
                <div className="mt-2 d-flex">
                  {estAuteur && (
                    <>
                      <button
                        className="btn btn-outline-danger btn-sm me-2"
                        onClick={supprimerLeTweet}
                      >
                        Supprimer
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEnEdition(true)}
                      >
                        Modifier
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {/* Afficher les commentaires */}
            {comments.length > 0 && (
              <div className="mt-3">
                <h6>Commentaires :</h6>
                {comments.map((comm) => (
                  <div key={comm.id} className="mb-2">
                    <strong>{comm.username}</strong> -{' '}
                    <small>{new Date(comm.date).toLocaleString()}</small>
                    <p>{comm.contenu}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Formulaire pour ajouter un commentaire */}
            <div className="mt-3">
              <textarea
                className="form-control"
                rows="2"
                placeholder="Ajouter un commentaire..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              ></textarea>
              <button className="btn btn-primary mt-2" onClick={ajouterCommentaire}>
                Commenter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tweet;
