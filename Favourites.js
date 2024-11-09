import { Text, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { View, FlatList, StyleSheet } from 'react-native';


export default function Favourites({ navigation }) {

  const [cocktails, setCocktails] = useState([]);

  const fetchData = async() => {
    const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
    const itemsRef = ref(db, `${userCredential.user.uid}/drinks/`);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCocktails(Object.entries(data).map(([key, value]) => ({key,value})));        
      } else {
        setCocktails([]);
      }
    })  
  }

  const navigateToDetailPage = (cocktail) => {
    navigation.navigate("Cocktail Details", {cocktail});
  }

  useEffect(() => {   // makes sure the data gets fetched on entering the page
    fetchData()
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={cocktails}
        renderItem={({item}) => 
          <Card style={styles.card} mode="outlined" onPress={() => navigateToDetailPage(item.value)}>
            <Card.Title title={item.value.strDrink} subtitle={item.value.strAlcoholic} subtitleStyle={{color: item.value.strAlcoholic === "Alcoholic" ? "red" : "green"}}/>
            <Card.Cover style={styles.cardCover} source={{ uri: item.value.strDrinkThumb }} />
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  card: {
    marginBottom: "5%",
  },
  cardCover: {
    height: 300,
  },
  
});
