import { useState, useContext, useEffect } from 'react';
import CreerTweet from './CreerTweet';
import { Link } from 'react-router-dom';
import Tweet from './Tweet';
import { AuthContext } from '../store/AuthProvider';
import { db } from '../firebase';
import { ref, push, onValue, orderByChild, query } from 'firebase/database';

export default function TweetBox({ mode }) {
  const [tweets, setTweets] = useState([]);
  const { user } = useContext(AuthContext); // Récupérer l'utilisateur connecté
  const [followingList, setFollowingList] = useState(null); // Liste des utilisateurs suivis, initialisée à null

  console.log('TweetBox - user:', user);
  console.log('TweetBox - mode:', mode);

  // Fonction pour ajouter un nouveau tweet
  const addTweet = async (tweetContenu) => {
    if (!user) {
      // Gérer le cas où l'utilisateur n'est pas connecté
      alert("Vous devez être connecté pour tweeter.");
      return;
    }
    const tweetData = {
      id: Date.now(), // Identifiant unique basé sur le timestamp
      contenu: tweetContenu,
      date: Date.now(),
      username: user.displayName || user.email,
      uid: user.uid,
    };
    try {
      const tweetsRef = ref(db, 'tweets');
      await push(tweetsRef, tweetData);
      console.log('Tweet ajouté avec succès:', tweetData);
    } catch (error) {
      console.error("Erreur lors de l'ajout du tweet :", error);
    }
  };

  // Récupérer la liste des utilisateurs suivis (uniquement en mode 'abonnement')
  useEffect(() => {
    console.log('Début du useEffect pour récupérer followingList');
    console.log('Valeur de user:', user);
    console.log('Valeur de mode:', mode);
    if (!user || mode !== 'abonnement') {
      console.log('Condition non satisfaite : user ou mode');
      setFollowingList([]);
      return;
    }
  
    console.log('Conditions satisfaites, récupération de followingList');
    const followingRef = ref(db, `following/${user.uid}`);
    const unsubscribe = onValue(
      followingRef,
      (snapshot) => {
        console.log('onValue appelé pour followingRef');
        const data = snapshot.val() || {};
        const uids = Object.keys(data);
        console.log('Données brutes de following:', data);
        console.log('Liste des utilisateurs suivis :', uids);
        setFollowingList(uids);
      },
      (error) => {
        console.error('Erreur lors de la récupération de followingList:', error);
      }
    );
  
    return () => unsubscribe();
  }, [user, mode]);
  

  // Récupérer les tweets depuis Realtime Database
  useEffect(() => {
    if (!user) return;

    if (mode === 'abonnement' && followingList === null) {
      // Attendre que followingList soit chargée
      return;
    }

    const tweetsRef = ref(db, 'tweets');
    const tweetsQuery = query(tweetsRef, orderByChild('date'));
    const unsubscribe = onValue(tweetsQuery, (snapshot) => {
      const tweetsData = [];
      snapshot.forEach((childSnapshot) => {
        const tweet = childSnapshot.val();

        // Filtrer les tweets en fonction du mode
        if (tweet.contenu && tweet.username) {
          if (mode === 'abonnement') {
            // Mode 'abonnement' : afficher les tweets des utilisateurs suivis
            if (followingList.includes(tweet.uid)) {
              tweetsData.push({
                id: childSnapshot.key,
                ...tweet,
              });
            }
          } else {
            // Mode 'actu' : afficher tous les tweets
            tweetsData.push({
              id: childSnapshot.key,
              ...tweet,
            });
          }
        }
      });
      // Tri des tweets par date décroissante
      tweetsData.sort((a, b) => b.date - a.date);
      setTweets(tweetsData);
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, [user, mode, followingList]);

  return (
    <div className='container my-4'>
      <div className='text-center mb-4'>
        <h1 style={{ color: '#1DA1F2' }}>TwitterMK</h1>
      </div>
      <nav>
        <Link to="/">Actu</Link>
        <Link to="/abonnement">Abonnement</Link>
      </nav>

      <CreerTweet addTweet={addTweet} />

      {/* Affichage de la liste des tweets */}
      <div className="tweet-list">
        {tweets.length === 0 ? (
          <p>Aucun tweet à afficher.</p>
        ) : (
          tweets.map((tweet) => (
            <Tweet
              key={tweet.id}
              tweet={tweet}
              supprimerTweet={() => {}}
              modifierTweet={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
