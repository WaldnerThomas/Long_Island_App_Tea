import { Text, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import globalStyles from './globalStyles';
import colours from './colours';


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
    <View style={globalStyles.container}>
      {cocktails.length === 0 && 
        <View>
          <Text style={globalStyles.placeholderText}>You do not have any favourite cocktails</Text>
          <Image
              source={require('./assets/icon.png')}
              style={[globalStyles.logo, globalStyles.logoWithLargeMargin]}
              resizeMode="contain"
            />
        </View>
      }  
      <FlatList
        data={cocktails}
        renderItem={({item}) => 
          <Card style={globalStyles.card} mode="outlined" onPress={() => navigateToDetailPage(item.value)}>
            <Card.Title title={item.value.strDrink} subtitle={item.value.strAlcoholic} titleStyle={globalStyles.itemName} subtitleStyle={{color: item.value.strAlcoholic === "Alcoholic" ? colours.alcoholic : colours.nonalcoholic}}/>
            <Card.Cover style={globalStyles.cardCover} source={{ uri: item.value.strDrinkThumb }} />
          </Card>
        }
      />
    </View>
  );
}