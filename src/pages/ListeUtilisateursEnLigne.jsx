import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

function ListeUtilisateursEnLigne() {
  const [utilisateursEnLigne, setUtilisateursEnLigne] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const statusRef = ref(db, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const utilisateurs = [];
      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const status = childSnapshot.val();
        if (status.state === 'online') {
          utilisateurs.push({ uid: userId });
        }
      });
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
      <ul className="list-unstyled">
        {utilisateursEnLigne.map((utilisateur) => (
          <li key={utilisateur.uid}>
            <button
              className="btn btn-link"
              onClick={() => afficherProfil(utilisateur.uid)}
            >
              {utilisateur.uid}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListeUtilisateursEnLigne;
