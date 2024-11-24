// ListePersonnesSuivies.jsx

import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthProvider';

function ListePersonnesSuivies() {
  const [personnesSuivies, setPersonnesSuivies] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      console.log('Utilisateur non connecté.');
      return;
    }

    console.log('Utilisateur connecté :', user.uid);

    // Référence au nœud 'following' de l'utilisateur actuel
    const followingRef = ref(db, `following/${user.uid}`);

    // Écouter les changements dans la liste des personnes suivies
    const unsubscribe = onValue(followingRef, async (snapshot) => {
      const followingData = snapshot.val() || {};

      const uidsSuivis = Object.keys(followingData);

      console.log('UIDs des personnes suivies :', uidsSuivis);

      const utilisateurs = [];
      const promises = [];

      // Pour chaque UID suivi, récupérer les informations de l'utilisateur
      uidsSuivis.forEach((uidSuivi) => {
        const userRef = ref(db, `users/${uidSuivi}`);
        const promise = get(userRef)
          .then((userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              utilisateurs.push({
                uid: uidSuivi,
                username: userData.username,
              });
            } else {
              utilisateurs.push({
                uid: uidSuivi,
                username: 'Utilisateur inconnu',
              });
            }
          })
          .catch((error) => {
            console.error(
              `Erreur lors de la récupération des données pour ${uidSuivi}:`,
              error
            );
          });
        promises.push(promise);
      });

      await Promise.all(promises);
      setPersonnesSuivies(utilisateurs);
    });

    return () => unsubscribe();
  }, [user]);

  // Fonction pour naviguer vers le profil de l'utilisateur
  const afficherProfil = (uid) => {
    navigate(`/profil/${uid}`);
  };

  return (
    <div>
      <h5>Personnes que vous suivez :</h5>
      {personnesSuivies.length === 0 ? (
        <p>Vous ne suivez personne pour le moment.</p>
      ) : (
        <ul className="list-unstyled">
          {personnesSuivies.map((utilisateur) => (
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

export default ListePersonnesSuivies;
