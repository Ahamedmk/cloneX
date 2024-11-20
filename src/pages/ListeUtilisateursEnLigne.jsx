import { useState, useEffect, useContext } from "react";
import { db } from "../firebase";
import {ref, set, remove, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthProvider";

function ListeUtilisateursEnLigne() {
  const [utilisateursEnLigne, setUtilisateursEnLigne] = useState([]);
  const [followingList, setFollowingList] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fonction pour suivre un utilisateur
  const suivreUtilisateur = async (uidUtilisateurSuivi) => {
    const uidSuiveur = user.uid;

    // Mettre à jour le nœud 'following' de l'utilisateur actuel
    const followingRef = ref(db, `following/${uidSuiveur}/${uidUtilisateurSuivi}`);
    await set(followingRef, true);

    // Mettre à jour le nœud 'followers' de l'utilisateur suivi
    const followersRef = ref(db, `followers/${uidUtilisateurSuivi}/${uidSuiveur}`);
    await set(followersRef, true);
  };

  // Fonction pour ne plus suivre un utilisateur
  const nePlusSuivreUtilisateur = async (uidUtilisateurSuivi) => {
    const uidSuiveur = user.uid;

    // Supprimer du nœud 'following' de l'utilisateur actuel
    const followingRef = ref(db, `following/${uidSuiveur}/${uidUtilisateurSuivi}`);
    await remove(followingRef);

    // Supprimer du nœud 'followers' de l'utilisateur suivi
    const followersRef = ref(db, `followers/${uidUtilisateurSuivi}/${uidSuiveur}`);
    await remove(followersRef);
  };

  useEffect(() => {
    if (!user) {
      console.log('Utilisateur non connecté.');
      // Si l'utilisateur n'est pas connecté, on ne fait rien
      return;
    }
  
    console.log('Utilisateur connecté :', user.uid);

    // Récupérer la liste des utilisateurs que l'utilisateur actuel suit
    const followingRef = ref(db, `following/${user.uid}`);
    onValue(followingRef, (snapshot) => {
      const data = snapshot.val() || {};
      setFollowingList(data);
    });
  
    const statusRef = ref(db, "status");
    const unsubscribe = onValue(statusRef, async (snapshot) => {
      console.log('Données du nœud status :', snapshot.val());
      const utilisateurs = [];
      const promises = [];
  
      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const status = childSnapshot.val();
        console.log(`Utilisateur ID : ${userId}, Statut :`, status);
  
        // Vérifier la valeur exacte de `status.state`
        console.log(`Status.state pour ${userId} : "${status.state}"`);
  
        if (status.state === "online") {
          // Récupérer les informations de l'utilisateur
          const userRef = ref(db, `users/${userId}`);
          const promise = get(userRef)
            .then((userSnapshot) => {
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                console.log(`Données de l'utilisateur ${userId} :`, userData);
                utilisateurs.push({ uid: userId, username: userData.username });
              } else {
                console.log(`Aucune donnée trouvée pour l'utilisateur ${userId}`);
                utilisateurs.push({
                  uid: userId,
                  username: "Utilisateur inconnu",
                });
              }
            })
            .catch((error) => {
              console.error(
                `Erreur lors de la récupération des données pour ${userId}:`,
                error
              );
            });
          promises.push(promise);
        } else {
          console.log(`L'utilisateur ${userId} n'est pas en ligne.`);
        }
      });
  
      await Promise.all(promises);
      console.log('Utilisateurs en ligne récupérés :', utilisateurs);
      setUtilisateursEnLigne(utilisateurs);
    });
  
    return () => unsubscribe();
  }, [user]);
  

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
          {utilisateursEnLigne.map((utilisateur) => {
            const estSuivi = followingList[utilisateur.uid];

            return (
              <li key={utilisateur.uid}>
                <button
                  className="btn btn-link"
                  onClick={() => afficherProfil(utilisateur.uid)}
                >
                  {utilisateur.username || utilisateur.uid}
                  {utilisateur.uid === user.uid && " (Vous)"}
                </button>
                {utilisateur.uid !== user.uid && (
                  <>
                    {estSuivi ? (
                      <button
                        onClick={() => nePlusSuivreUtilisateur(utilisateur.uid)}
                        className="btn btn-secondary"
                      >
                        Ne plus suivre
                      </button>
                    ) : (
                      <button
                        onClick={() => suivreUtilisateur(utilisateur.uid)}
                        className="btn btn-primary"
                      >
                        Suivre
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListeUtilisateursEnLigne;
