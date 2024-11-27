import { useState, useEffect, useContext } from "react";
import { db } from "../firebase";
import { ref, onValue, set, remove, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthProvider";
import { toast } from 'react-toastify';

function ListeUtilisateursEnLigne() {
  const [utilisateursEnLigne, setUtilisateursEnLigne] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      console.log('Utilisateur non connecté.');
      return;
    }

    console.log('Utilisateur connecté :', user.uid);

    // Récupérer la liste des utilisateurs suivis
    const followingRef = ref(db, `following/${user.uid}`);
    onValue(followingRef, (snapshot) => {
      const data = snapshot.val() || {};
      const uids = Object.keys(data);
      setFollowingList(uids);
    });

    const statusRef = ref(db, "status");

    const unsubscribe = onValue(statusRef, async (snapshot) => {
      const utilisateurs = [];
      const promises = [];

      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const status = childSnapshot.val();

        if (status.state === "online") {
          // Récupérer les informations de l'utilisateur
          const userRef = ref(db, `users/${userId}`);
          const promise = get(userRef)
            .then((userSnapshot) => {
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                utilisateurs.push({ uid: userId, username: userData.username });
              } else {
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
        }
      });

      await Promise.all(promises);
      setUtilisateursEnLigne(utilisateurs);
    });

    return () => unsubscribe();
  }, [user]);

  // Fonction pour suivre un utilisateur
  const suivreUtilisateur = async (uidUtilisateurSuivi) => {
    try {
      const uidSuiveur = user.uid;

      // Mettre à jour le nœud 'following' de l'utilisateur actuel
      const followingRef = ref(db, `following/${uidSuiveur}/${uidUtilisateurSuivi}`);
      await set(followingRef, true);

      // Mettre à jour le nœud 'followers' de l'utilisateur suivi
      const followersRef = ref(db, `followers/${uidUtilisateurSuivi}/${uidSuiveur}`);
      await set(followersRef, true);

      // Mettre à jour l'état local
      setFollowingList((prevList) => [...prevList, uidUtilisateurSuivi]);

      toast.success(`Vous suivez maintenant ${uidUtilisateurSuivi}`);
    } catch (error) {
      console.error(`Erreur lors du suivi de l'utilisateur ${uidUtilisateurSuivi} :`, error);
      toast.error("Une erreur est survenue lors du suivi de l'utilisateur.");
    }
  };

  // Fonction pour ne plus suivre un utilisateur
  const nePlusSuivreUtilisateur = async (uidUtilisateurSuivi) => {
    try {
      const uidSuiveur = user.uid;

      // Supprimer du nœud 'following' de l'utilisateur actuel
      const followingRef = ref(db, `following/${uidSuiveur}/${uidUtilisateurSuivi}`);
      await remove(followingRef);

      // Supprimer du nœud 'followers' de l'utilisateur suivi
      const followersRef = ref(db, `followers/${uidUtilisateurSuivi}/${uidSuiveur}`);
      await remove(followersRef);

      // Mettre à jour l'état local
      setFollowingList((prevList) => prevList.filter(uid => uid !== uidUtilisateurSuivi));

      toast.info(`Vous ne suivez plus ${uidUtilisateurSuivi}`);
    } catch (error) {
      console.error(`Erreur lors de la désinscription de l'utilisateur ${uidUtilisateurSuivi} :`, error);
      toast.error("Une erreur est survenue lors de la désinscription.");
    }
  };

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
            const estSuivi = followingList.includes(utilisateur.uid);

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
