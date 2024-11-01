import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../store/AuthProvider';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

const ProfilUtilisateur = ({ utilisateur }) => {
    if (!utilisateur) {
        return <p>Veuillez vous connecter pour voir votre profil.</p>;
      }
  const { user } = useContext(AuthContext);
  const [estSuivi, setEstSuivi] = useState(false);

  useEffect(() => {
    const verifierAbonnement = async () => {
      if (user && utilisateur) {
        const followRef = ref(db, `follows/${user.uid}/${utilisateur.uid}`);
        const snapshot = await get(followRef);
        setEstSuivi(snapshot.exists());
      }
    };
    verifierAbonnement();
  }, [user, utilisateur]);

  const gererAbonnement = async () => {
    if (user && utilisateur) {
      if (estSuivi) {
        await desabonnerUtilisateur(user.uid, utilisateur.uid);
        setEstSuivi(false);
      } else {
        await suivreUtilisateur(user.uid, utilisateur.uid);
        setEstSuivi(true);
      }
    }
  };

  return (
    <div>
      <h2>{utilisateur ? utilisateur.username : 'Utilisateur inconnu'}</h2>
      {user && utilisateur && user.uid !== utilisateur.uid && (
        <button onClick={gererAbonnement}>
          {estSuivi ? "Se désabonner" : "S'abonner"}
        </button>
      )}
    </div>
  );
};

export default ProfilUtilisateur;
