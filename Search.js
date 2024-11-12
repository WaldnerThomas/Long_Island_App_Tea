import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';


export default function Search({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const [cocktails, setCocktails] = useState([]);
  const [searchOption, setSearchOption] = useState("name");

  const [failedFetchedCocktails, setFailedFetchedCocktails] = useState([]);

  const fetchCocktails = () => {

    setFailedFetchedCocktails([]); // clear failed fetches for new fetch request

    let url = ``; // depending on the searchOption a different REST url is being used for the fetch
    if(searchOption === "name") {
      url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=`;
    }
    else if(searchOption === "ingredient") { 
      url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=`;
    }
    else if(searchOption === "random") {
      url = `https://www.thecocktaildb.com/api/json/v1/1/random.php`;
    }

    fetch(`${url}${keyword}`)
    .then(response => {
      if (!response.ok)
        throw new Error("Error in fetch: " + response.statusText);
  
      return response.json();
    })
    .then(data => {
      
      // TODO: Look if return is empty or not
      // TODO: API doesnt return after the first no one knows how many requests, look how to handle that, maybe "More Options" button or something
      if (searchOption === "ingredient") {
        const detailedCocktailPromises = data.drinks.map((drink) =>
          fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`) // fetch further information through id
            .then((response) => {
              if (!response.ok) throw new Error("Error in fetch: " + response.statusText);
              return response.json();
            })
            .then((detailsData) => detailsData.drinks[0])
            .catch((error) => {
              console.error(`Error fetching detailed cocktail for drinkId: ${drink.idDrink}`, error); // TODO: delete error message
              setFailedFetchedCocktails((prevFailed) => [...prevFailed, drink.idDrink]); // save the failed fetches in a list to fetch them later; they fail because API blocks access after a certain amount of requests
              return null;  
            })
        );

        Promise.all(detailedCocktailPromises) // wait for all Fetches to complete
          .then((detailedCocktails) => {
            const validCocktails = detailedCocktails.filter(cocktail => cocktail !== null); // Filter out nulls
            setCocktails(validCocktails);
          })
          .catch((err) => console.error("Error processing detailed cocktail data: ", err));
      } else {
        setCocktails(data.drinks)
      }
    })
    .catch(err => console.error(err))   
  }

  const fetchFurtherCocktails = () => { // fetches cocktails that failed previously
    const oldFailedFetchedCocktails = failedFetchedCocktails;
    setFailedFetchedCocktails([]); // empty failed fetched cocktail list in case of further fetching errors

    const detailedCocktailPromises = oldFailedFetchedCocktails.map((drinkId) =>
      fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drinkId}`) // fetch further information through id
        .then((response) => {
          if (!response.ok) throw new Error("Error in fetch: " + response.statusText);
          return response.json();
        })
        .then((detailsData) => detailsData.drinks[0])
        .catch((error) => {
          console.error(`Error fetching detailed cocktail for drinkId: ${drinkId}`, error); // TODO: delete error message
          setFailedFetchedCocktails((prevFailed) => [...prevFailed, drinkId]); // save the failed fetches in a list to fetch them later; they fail because API blocks access after a certain amount of requests
          return null;  
        })
    );

    Promise.all(detailedCocktailPromises) // wait for all Fetches to complete
      .then((detailedCocktails) => {
        const validCocktails = detailedCocktails.filter(cocktail => cocktail !== null); // Filter out nulls
        setCocktails((prevCocktails) => [...prevCocktails, ...validCocktails]);
      })
      .catch((err) => console.error("Error processing detailed cocktail data: ", err));
  }

  const navigateToDetailPage = (cocktail) => {
    navigation.navigate("Cocktail Details", {cocktail});
  }

  useEffect(() => { // clears Keyword for random drink since API doesnt need a keyword
    if(searchOption === "random") {
      setKeyword("");
    }
  }), [searchOption]

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={searchOption}
        onValueChange={setSearchOption}
        buttons={[
          {
            value: "name",
            label: "Name",
            icon: "glass-cocktail",
          },
          {
            value: "ingredient",
            label: "Ingredient",
            icon: "fruit-grapes",
          },
          {
             value: "random",
             label: "Random",
             icon: "emoticon-dead",
          },
        ]}
      />
      {searchOption !== "random" && ( // TextInput does not get rendered for random drink
      <TextInput
      style={styles.textInput}
        label={searchOption === "name" ? "Cocktail Name" : searchOption === "ingredient" ? "Cocktail Ingredient" : ""}
        value={keyword}
        onChangeText={text => setKeyword(text)}
        mode='outlined'
      />  
      )}
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
          <Card style={styles.card} mode="outlined" onPress={() => navigateToDetailPage(item)}>
            <Card.Title title={item.strDrink} subtitle={item.strAlcoholic} subtitleStyle={{color: item.strAlcoholic === "Alcoholic" ? "red" : "green"}}/>
            <Card.Cover style={styles.cardCover} source={{ uri: item.strDrinkThumb }} />
          </Card>
        }
        ListFooterComponent={
          failedFetchedCocktails.length > 0 ? (
            <Button
              style={styles.footerButton}
              mode="outlined"
              onPress={fetchFurtherCocktails}
            >
              Show More
            </Button>
          ) : null
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
  textInput: {
    marginTop: "2%",
  },
  button: {
    marginTop: "2%",
    marginBottom: "3%",
  },
  footerButton: {
    marginBottom: "5%",
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  card: {
    marginBottom: "5%",
  },
  cardCover: {
    height: 300,
  },
  
});
