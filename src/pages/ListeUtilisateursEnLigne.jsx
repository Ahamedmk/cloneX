import { useState, useEffect, useContext } from "react";
import { db } from "../firebase";
import { ref, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthProvider";

function ListeUtilisateursEnLigne() {
  const [utilisateursEnLigne, setUtilisateursEnLigne] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      console.log('Utilisateur non connecté.');
      // Si l'utilisateur n'est pas connecté, on ne fait rien
      return;
    }
  
    console.log('Utilisateur connecté :', user.uid);
  
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
          {utilisateursEnLigne.map((utilisateur) => (
            <li key={utilisateur.uid}>
              <button
                className="btn btn-link"
                onClick={() => afficherProfil(utilisateur.uid)}
              >
                {utilisateur.username || utilisateur.uid}
                {utilisateur.uid === user.uid && " (Vous)"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListeUtilisateursEnLigne;
