import { useState, useContext, useEffect} from 'react';
import CreerTweet from './CreerTweet';
import Tweet from './Tweet';
import { AuthContext } from '../store/AuthProvider';
import { db } from '../firebase';
import { ref,push,onValue, orderByChild, query } from 'firebase/database'; 

export default function TweetBox() {
  const [tweets, setTweets] = useState([]);
  const { user } = useContext(AuthContext); // Récupérer l'utilisateur connecté

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
      userId:user.uid,
      // comments:[],
    };
    try {
      const tweetsRef = ref(db, 'tweets');
      await push(tweetsRef, tweetData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du tweet :', error);
    }
    
  };
   // Récupérer les tweets depuis Realtime Database
   useEffect(() => {
    const tweetsRef = ref(db, 'tweets');
    const tweetsQuery = query(tweetsRef, orderByChild('date'));
    const unsubscribe = onValue(tweetsQuery, (snapshot) => {
      const tweetsData = [];
      snapshot.forEach((childSnapshot) => {
        const tweet = childSnapshot.val();
        if (tweet.contenu && tweet.username) {
        tweetsData.push({
          id: childSnapshot.key,
          ...tweet,
        });
      }
      });
      // Tri des tweets par date décroissante
      tweetsData.sort((a, b) => b.date - a.date);
      setTweets(tweetsData);
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, []);




  // Fonction pour supprimer un tweet
  const supprimerTweet = (id) => {
    setTweets(tweets.filter((tweet) => tweet.id !== id));
  };

  // Fonction pour modifier un tweet
  const modifierTweet = (id, nouveauContenu) => {
    setTweets(
      tweets.map((tweet) =>
        tweet.id === id ? { ...tweet, contenu: nouveauContenu } : tweet
      )
    );
  };

  return (
    <div className='container my-4'>
      <div className='text-center mb-4'>
        <h1 style={{ color: '#1DA1F2' }}>TwitterMK</h1>
      </div>
      <CreerTweet addTweet={addTweet} />
      {/* Affichage de la liste des tweets */}
      <div className="tweet-list">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            supprimerTweet={supprimerTweet}
            modifierTweet={modifierTweet}
          />
        ))}
      </div>
    </div>
  );
}
