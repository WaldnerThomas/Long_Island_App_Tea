import { Text, IconButton, Card } from 'react-native-paper';
import { View, Image, FlatList, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { ref, push, onValue, remove, update } from "firebase/database";
import globalStyles from './globalStyles';
import colours from './colours';

export default function CocktailDetailPage({ route, navigation }) {
    const {cocktail} = route.params;
    const [similarCocktails, setSimilarCocktails] = useState([]);
    const [favouriteCocktails, setFavouriteCocktails] = useState([]);
    const [ShoppingList, setShoppingList] = useState([]);

    const ingredients = []; // Creates an Array of the ingredients with their measurements
    for (let i = 1; i <= 15; i++) { // Ingredients start at 1; 15 is the limit of ingredients of the API
        const ingredient = cocktail[`strIngredient${i}`];
        const measure = cocktail[`strMeasure${i}`];

        if (ingredient) { // There can be ingredients without measurements
            ingredients.push({ ingredient, measure });
        }
    }

    // References to the Scroll Views
    const mainScrollViewRef = useRef(null);
    const similarCocktailsScrollViewRef = useRef(null);
    
    useEffect(() => { // adds cocktails with similar name to similar cocktails list
      setSimilarCocktails([]); // resets list in case of navigation to a similar cocktail, so the list updates correctly
      const firstWord = cocktail.strDrink.trim().split(' ')[0];
      
      let i = 0;
      let j = 0;
      const existingCocktails = [];

      fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${firstWord}`)
      .then(response => {
        if (!response.ok)
          throw new Error("Error in fetch: " + response.statusText);
    
        return response.json();
      })
      .then(data => {
        while (i < data.drinks.length && j < 6) { // makes sure not more than 6 cocktails are added
          if(data.drinks[i].strDrink.toLowerCase() !== cocktail.strDrink.toLowerCase()) { // ensures the selected cocktail is not added
            setSimilarCocktails((prevCocktails) => [...prevCocktails, data.drinks[i]]);
            existingCocktails.push(data.drinks[i]);
            j++;
          }
          i++;
        }

      })
      .catch(err => console.error(err))

      if(j < 6) { // if there are not enough similar named cocktails, search for some with the first ingredient        
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${cocktail.strIngredient1}`)
        .then(response => {
          if (!response.ok)
            throw new Error("Error in fetch: " + response.statusText);
      
          return response.json();
        })
        .then(data => {
          i = 0;
          const detailedCocktailPromises = [];

          while (i < data.drinks.length && j < 6) { // makes sure not more than 6 cocktails are added
            if(data.drinks[i].strDrink.toLowerCase() !== cocktail.strDrink.toLowerCase() && !existingCocktails.some(existingCocktail => existingCocktail.strDrink.toLowerCase() === data.drinks[i].strDrink.toLowerCase())) { // TODO: ensures no duplicates get added
              // fetch for detail data 
              const detailPromise = fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${data.drinks[i].idDrink}`)
               .then((response) => {
                   if (!response.ok) throw new Error("Error in fetch: " + response.statusText);
                   return response.json();
               })
               .then((detailsData) => detailsData.drinks[0])
               .catch((error) => {
                   console.error(err);
                   return null;
               });
           
           detailedCocktailPromises.push(detailPromise);
           j++;
       }
       i++;
   }

      Promise.all(detailedCocktailPromises)
       .then((detailedCocktails) => {
           const validCocktails = detailedCocktails.filter(cocktail => cocktail !== null);
           setSimilarCocktails((prevCocktails) => [...prevCocktails, ...validCocktails]);
        })
        .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
    }
  }, [cocktail.strDrink]);


    const ShareCocktail = async() => {
      try {
        const result = await Share.share({
            message:`Look at this amazing Cocktail:\n\n${cocktail.strDrink} (${cocktail.strAlcoholic})\n\nIngredients:\n` +
            ingredients
               .map(item => `${item.measure ? item.measure + ' ' : ''}${item.ingredient}`) // checks if the ingredient has a measurement
               .join('\n') + // adds the ingredients with a linebreak
            `\n\nInstructions:\n${cocktail.strInstructions}`,
        });
    } catch (error) {
        alert(error.message);
      }
    }

    const navigateToDetailPage = (cocktail) => {
      navigation.navigate("Cocktail Details", {cocktail});
      mainScrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });  // resets main Scrollview
      similarCocktailsScrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });  // resets similar Cocktails Scrollview

    }

    const addFavourite = async() => {
      const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id

      const matchingCocktail = favouriteCocktails.find((favouriteCocktail) => favouriteCocktail.value.idDrink === cocktail.idDrink);
      
      if (matchingCocktail) {
        await remove(ref(db, `${userCredential.user.uid}/drinks/${matchingCocktail.key}`)); // deletes the drink from the database
      } else {
        push(ref(db, `${userCredential.user.uid}/drinks/`), cocktail); // saves the drink into the database        
      }

    }

    const addIngredient = async(ingredient) => {
      const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id

      const matchingCheckedIngredient = ShoppingList.find(
        (shoppingListItem) => shoppingListItem.value.ingredient === ingredient && shoppingListItem.value.isChecked
      );
    
      const matchingUncheckedIngredient = ShoppingList.find(
        (shoppingListItem) => shoppingListItem.value.ingredient === ingredient && !shoppingListItem.value.isChecked
      );
      
      if(matchingCheckedIngredient || matchingUncheckedIngredient) {  // looks if ingredient is already in database
        Alert.alert(
          "Add To Shoppinglist",
          "This item is already on your shoppinglist. Add another one?",
          [
            {
              text: "No",
            },
            {
              text: "Yes",
              onPress: () => {
                if(matchingUncheckedIngredient) {
                  update(ref(db, `${userCredential.user.uid}/shoppinglist/${matchingUncheckedIngredient.key}`), {amount: ++matchingUncheckedIngredient.value.amount});  // increases ingredient amount in database        
                }
                else {
                  push(ref(db, `${userCredential.user.uid}/shoppinglist/`), {amount: 1, ingredient: ingredient});  // saves the ingredient into the database        
                }
              },
            },
          ],
          {
            cancelable: true,
          },  
        );
      }
      else {
        push(ref(db, `${userCredential.user.uid}/shoppinglist/`), {amount: 1, ingredient: ingredient});  // saves the ingredient into the database        
      }
    }

    const fetchFavourites = async() => {
      const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
      const itemsRef = ref(db, `${userCredential.user.uid}/drinks/`);
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFavouriteCocktails(Object.entries(data).map(([key, value]) => ({key,value}))); 
        } else {
          setFavouriteCocktails([]);
        }
      })  
    }

    useEffect(() => {   // makes sure the favouriteCocktails gets fetched on entering the page
      fetchFavourites();      
    }, []);

    const fetchShoppingList = async() => {
      const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
      const itemsRef = ref(db, `${userCredential.user.uid}/shoppinglist/`);
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setShoppingList(Object.entries(data).map(([key, value]) => ({key,value}))); 
        } else {
          setShoppingList([]);
        }
      })  
    }

    useEffect(() => {   // makes sure the shoppingList gets fetched on entering the page
      fetchShoppingList();      
    }, []);

    return (
        <ScrollView ref={mainScrollViewRef} style={styles.container}>
          <Image source={{ uri: cocktail.strDrinkThumb }} style={{ width: "100%", height: 400, }}/>  
          <View style={styles.description}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="titleMedium" style={{color: cocktail.strAlcoholic === "Alcoholic" ? colours.alcoholic : colours.nonalcoholic}}>{cocktail.strAlcoholic}</Text>
              <View style={{flexDirection: "row"}}>
                <IconButton
                  icon="share"
                  iconColor= {colours.text}
                  mode="outlined"
                  size={30}
                  onPress={ShareCocktail}
                />
                <IconButton
                  icon= {favouriteCocktails.find((favouriteCocktail) => favouriteCocktail.value.idDrink === cocktail.idDrink) ? "heart" : "heart-outline"} 
                  iconColor={colours.favourite}
                  mode="outlined"
                  size={30}
                  onPress={addFavourite}
                />
              </View>
            </View>
            <View style={styles.paragraph}>
                <Text style={styles.text} variant="titleMedium">Ingredients:</Text>
                {ingredients.map((item, index) => (     // No Flatlist, because a Flatlist in Scrollview can lead to problems
                        <View key={index} style={{flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.text} variant="bodyMedium">
                              {item.measure}
                              {item.measure && item.measure.endsWith(' ') ? '' : ' '}
                              {item.ingredient}
                          </Text>
                          <IconButton
                            icon="cart-variant"
                            iconColor={colours.text}
                            mode="outlined"
                            size={30}
                            onPress={() => addIngredient(item.ingredient)}
                          />
                        </View>
                    ))}
            </View>
            <View style={styles.paragraph}>
                <Text style={styles.text} variant="titleMedium">Instructions:</Text>
                <Text style={styles.text} variant="bodyMedium">{cocktail.strInstructions}</Text>
            </View>

            <View style={styles.paragraph}>
              {similarCocktails.length !== 0 && 
                <Text style={styles.text} variant="titleMedium">Similar Cocktails:</Text>
              } 
              <ScrollView ref={similarCocktailsScrollViewRef} horizontal={true}>
                {similarCocktails.map((similarCocktail, index) => (
                  <Card key={index} style={styles.card} mode="outlined" onPress={() => navigateToDetailPage(similarCocktail)}>
                    <Card.Title title={similarCocktail.strDrink} subtitle={similarCocktail.strAlcoholic} titleStyle={styles.text} subtitleStyle={{color: similarCocktail.strAlcoholic === "Alcoholic" ? colours.alcoholic : colours.nonalcoholic}}/>
                    <Card.Cover style={globalStyles.cardCover} source={{ uri: similarCocktail.strDrinkThumb }} />
                  </Card>
                ))}
              </ScrollView>
            </View>
            
          </View>

        </ScrollView>
      );
    
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: colours.background,  
    },
    description: {
      padding: "3%",
    },
    paragraph: {
      marginTop: "5%",
    },
    card: {
      backgroundColor: colours.background,
      marginRight: 5,
      width: 300,
    },
    text: {
      color: colours.text,
    },
  });