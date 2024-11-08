import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

function ListeUtilisateursEnLigne() {
  const [utilisateursEnLigne, setUtilisateursEnLigne] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const statusRef = ref(db, 'status');
    const unsubscribe = onValue(statusRef, async (snapshot) => {
      const utilisateurs = [];
      const promises = [];

      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const status = childSnapshot.val();
        if (status.state === 'online') {
          // Récupérer les informations de l'utilisateur
          const userRef = ref(db, `users/${userId}`);
          const promise = get(userRef).then((userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              utilisateurs.push({ uid: userId, username: userData.username });
            } else {
              utilisateurs.push({ uid: userId, username: 'Utilisateur inconnu' });
            }
          }).catch((error) => {
            console.error(`Erreur lors de la récupération des données pour ${userId}:`, error);
          });
          promises.push(promise);
        }
      });

      await Promise.all(promises);
      setUtilisateursEnLigne(utilisateurs);
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour naviguer vers le profil de l'utilisateur
  const afficherProfil = (uid) => {
    navigate(`/profil/${uid}`);
  };

  return (
    <div>
      <h5>Utilisateurs en ligne :</h5>
      {utilisateursEnLigne.length === 0 ? (
        <p>Aucun utilisateur en ligne.</p>
      ) : (
        <ul className="list-unstyled">
          {utilisateursEnLigne.map((utilisateur) => (
            <li key={utilisateur.uid}>
              <button
                className="btn btn-link"
                onClick={() => afficherProfil(utilisateur.uid)}
              >
                {utilisateur.username || utilisateur.uid}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeUtilisateursEnLigne;
