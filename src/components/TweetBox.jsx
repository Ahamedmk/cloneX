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
  // Fonction pour ajouter un nouveau tweet
const addTweet = async (tweetContenu) => {
  if (!user) {
    alert("Vous devez être connecté pour tweeter.");
    return;
  }
  console.log('Utilisateur actuel :', user);
  const tweetData = {
    contenu: tweetContenu,
    date: Date.now(),
    username: user.displayName || user.email,
    uid: user.uid,
  };
  console.log('Données du tweet avant envoi :', tweetData);
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
    if (mode !== 'abonnement' || !user) return;

    const followingRef = ref(db, `following/${user.uid}`);
    onValue(followingRef, (snapshot) => {
      const followingData = snapshot.val();
      if (followingData) {
        const followingArray = Object.keys(followingData);
        setFollowingList(followingArray);
      } else {
        setFollowingList([]);
      }
    }, (error) => {
      console.error('Erreur lors de la récupération de la liste des suivis:', error);
    });
  }, [user, mode]);

  // Récupérer les tweets depuis Realtime Database
  useEffect(() => {
    let unsubscribe = () => {
      console.log('Aucun listener à désabonner.');
    };
    if (!user) {
      console.log('Utilisateur non authentifié, désabonnement du listener.');
      // Si l'utilisateur n'est pas authentifié, nous devons nettoyer le listener précédent
      return () => {
        unsubscribe();
      };
    }
    console.log('Mise en place du listener pour les tweets');
    const tweetsRef = ref(db, 'tweets');
    const tweetsQuery = query(tweetsRef, orderByChild('date'));
    unsubscribe = onValue(
      tweetsQuery,
      (snapshot) => {
        console.log('Listener onValue appelé suite à une modification des tweets');
        const tweetsData = [];
        snapshot.forEach((childSnapshot) => {
          const tweet = childSnapshot.val();
          tweetsData.push({
            id: childSnapshot.key, // Utiliser la clé Firebase comme 'id'
            ...tweet,
          });
        });
        // Tri des tweets par date décroissante
        tweetsData.sort((a, b) => b.date - a.date);
        console.log('Tweets après mise à jour :', tweetsData);
        setTweets(tweetsData);
      },
      (error) => {
        console.error('Erreur lors de la récupération des tweets:', error);
      }
    );
  
    return () => {
      console.log('Désabonnement du listener pour les tweets');
      unsubscribe();
    };
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
            />
          ))
        )}
      </div>
    </div>
  );
}
