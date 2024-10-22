import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';


export default function Search({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const [cocktails, setCocktails] = useState([]);

  const fetchCocktails = () => {
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${keyword}`)
    .then(response => {
      if (!response.ok)
        throw new Error("Error in fetch: " + response.statusText);
  
      return response.json();
    })
    .then(data => setCocktails(data.drinks))
    .catch(err => console.error(err))   
  }


  return (
    <View style={styles.container}>
      <TextInput
        label="Cocktail Name"
        value={keyword}
        onChangeText={text => setKeyword(text)}
        mode='outlined'
      />  
      <Button
        icon="glass-cocktail"
        contentStyle={styles.buttonContent} // places icon on the right
        style={styles.button}
        mode="outlined"
        onPress={fetchCocktails}
      >
        Search
      </Button>
      <FlatList
        data={cocktails}
        renderItem={({item}) => 
          <Card style={styles.card} mode="outlined">
            <Card.Title title={item.strDrink} subtitle={item.strAlcoholic}/>
            <Card.Cover style={styles.cardCover} source={{ uri: item.strDrinkThumb }} />
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
    padding: "5%",
  },
  button: {
    marginTop: "5%",
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  card: {
    marginTop: "5%",
  },
  cardCover: {
    height: 300,
  },
  
});
