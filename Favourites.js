import { Text, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { View, FlatList, StyleSheet, Image } from 'react-native';


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
      {cocktails.length === 0 && 
        <View>
          <Text style={styles.placeholderText}>You do not have any favourite cocktails</Text>
          <Image
              source={require('./assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
        </View>
      }  
      <FlatList
        data={cocktails}
        renderItem={({item}) => 
          <Card style={styles.card} mode="outlined" onPress={() => navigateToDetailPage(item.value)}>
            <Card.Title title={item.value.strDrink} subtitle={item.value.strAlcoholic} titleStyle={styles.text} subtitleStyle={{color: item.value.strAlcoholic === "Alcoholic" ? "#e52a2a" : "#2ae53b"}}/>
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
    backgroundColor: "#232323",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  card: {
    marginBottom: "5%",
    backgroundColor: "#232323",
  },
  cardCover: {
    height: 300,
  },
  text: {
    color: "#fff",
  },
  placeholderText: {
    marginTop: "5%",
    alignSelf: "center",
    fontSize: 25,
    color: "#fff",
    textAlign: "center",
  },
  logo: {
    marginTop: "40%",
    alignSelf: "center",
    width: "80%",
    height: undefined,
    aspectRatio: 1,
  },
});
