import { Text, TextInput, Button, Card, SegmentedButtons, Portal, Modal } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Image } from 'react-native';


export default function Search({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const [cocktails, setCocktails] = useState([]);
  const [searchNavigation, setSearchNavigation] = useState("name");

  const [failedFetchedCocktails, setFailedFetchedCocktails] = useState([]);

  const [loading, setLoading] = useState(false);

  const mainScrollViewRef = useRef(null);

  const fetchCocktails = (searchOption) => {
    setLoading(true);
    mainScrollViewRef.current.scrollToOffset({ animated: false, offset: 0 });
    setCocktails([]); // clear cocktail list

    setFailedFetchedCocktails([]); // clear failed fetches for new fetch request

    let url = ``; // depending on the searchOption a different REST url is being used for the fetch
    if(searchOption === "name") {
      url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=`;
    }
    else if(searchOption === "ingredient") { 
      url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=`;
    }
    else if(searchOption === "alcoholic") {
      url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic`;
    }
    else if(searchOption === "non alcoholic") {
      url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`;
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
      if ((searchOption === "ingredient" || searchOption === "alcoholic" || searchOption === "non alcoholic") && Array.isArray(data.drinks) && data.drinks.length > 0) {
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
              setLoading(false);
              return null;  
            })
        );

        Promise.all(detailedCocktailPromises) // wait for all Fetches to complete
          .then((detailedCocktails) => {
            const validCocktails = detailedCocktails.filter(cocktail => cocktail !== null); // Filter out nulls
            setCocktails(validCocktails);
            setLoading(false);
          })
          .catch((err) => console.error("Error processing detailed cocktail data: ", err));
      } else {
        setCocktails(data.drinks)
        if (data.drinks === "no data found") {
          setCocktails([]); // clears list in case no data got found
        }
        
        setLoading(false);
      }
    })
    .catch(err => {
      console.error(err)
      alert("Whoops, something went wrong. Try again!");
      setLoading(false);
    })
  }

  const fetchFurtherCocktails = () => { // fetches cocktails that failed previously
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error processing detailed cocktail data: ", err);
        setLoading(false);
      });
  }

  const navigateToDetailPage = (cocktail) => {
    navigation.navigate("Cocktail Details", {cocktail});
  }

  useEffect(() => { // clears Keyword for random drink since API doesnt need a keyword
    if(searchNavigation === "browse") {
      setKeyword("");
    }
  }), [searchNavigation]

  return (
    <View style={styles.container}>

        <Portal>
          <Modal visible={loading}>
            <ActivityIndicator size="large" color="lightblue"></ActivityIndicator>
          </Modal>
        </Portal>

      <SegmentedButtons
        style={styles.segmentedButton}
        value={searchNavigation}
        onValueChange={setSearchNavigation}
        buttons={[
          {
            value: "name",
            label: "Name",
            icon: "glass-cocktail", 
            checkedColor: "#fff",
            uncheckedColor: "#000",
            style: {
              backgroundColor: searchNavigation === "name" ? "#0098ff" : "#fff",
            },
          },
          {
            value: "ingredient",
            label: "Ingredient",
            icon: "fruit-grapes",
            checkedColor: "#fff",
            uncheckedColor: "#000",
            style: {
              backgroundColor: searchNavigation === "ingredient" ? "#0098ff" : "#fff",
            },
          },
          {
             value: "browse",
             label: "Browse",
             icon: "archive-search",
             checkedColor: "#fff",
             uncheckedColor: "#000",
             style: {
              backgroundColor: searchNavigation === "browse" ? "#0098ff" : "#fff",
            },
          },
        ]}        
        
      />
      {searchNavigation !== "browse" && ( // TextInput does not get rendered for random drink
      <TextInput
      style={styles.textInput}
        label={searchNavigation === "name" ? "Cocktail Name" : searchNavigation === "ingredient" ? "Cocktail Ingredient" : ""}
        value={keyword}
        onChangeText={text => setKeyword(text)}
        mode='outlined'
        textColor="#fff"
        outlineColor="#fff"
        activeOutlineColor="#0098ff"
        theme={{
          colors: {
               onSurfaceVariant: "#fff" // colours the label
          }
      }}
      />  
      )}

      {searchNavigation !== "browse" ? // only render search button for name and ingredient
        <Button
          icon="glass-cocktail"
          contentStyle={styles.buttonContent} // places icon on the right
          style={styles.button}
          labelStyle={styles.buttonLabel}
          mode="outlined"
          onPress={() => searchNavigation === "name" ? fetchCocktails("name") : fetchCocktails("ingredient")}
        >
          Search
        </Button>
        
      : // render browse buttons
        <View style={styles.browseButtons}>
          <Button
            icon="glass-mug-variant"
            contentStyle={styles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("alcoholic")}
          >
            Alcoholic
          </Button>
          <Button
            icon="glass-mug-variant-off"
            contentStyle={styles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("non alcoholic")}
          >
            Non Alcoholic
          </Button>
          <Button
            icon="emoticon-dead"
            contentStyle={styles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("random")}
          >
            Random
          </Button>
        </View>}

      {(!cocktails || cocktails.length <= 0) &&
        <Image
          source={require('./assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      }

      <FlatList
        ref={mainScrollViewRef}
        data={cocktails}
        renderItem={({item}) => 
          <Card style={styles.card} mode="outlined" onPress={() => navigateToDetailPage(item)}>
            <Card.Title title={item.strDrink} subtitle={item.strAlcoholic} titleStyle={styles.text} subtitleStyle={{color: item.strAlcoholic === "Alcoholic" ? "#e52a2a" : "#2ae53b"}}/>
            <Card.Cover style={styles.cardCover} source={{ uri: item.strDrinkThumb }} />
          </Card>
        }
        ListFooterComponent={
          failedFetchedCocktails.length > 0 ? (
            <Button
              style={styles.footerButton}
              labelStyle={styles.buttonLabel}
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
    backgroundColor: "#232323",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  textInput: {
    marginTop: "2%",
    backgroundColor: "#232323",
  },
  button: {
    marginTop: "2%",
    marginBottom: "3%",
    backgroundColor: "#0098ff",
    marginHorizontal: "2%",
  },
  buttonLabel: {
    color: "#fff",
  },
  footerButton: {
    marginBottom: "5%",
    backgroundColor: "#0098ff"
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  card: {
    backgroundColor: "#232323",
    marginBottom: "5%",
  },
  cardCover: {
    height: 300,
  },
  text: {
    color: "#fff",
  },
  segmentedButton: {
    marginTop: "2%"
  },
  browseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  logo: {
    marginTop: "25%",
    alignSelf: "center",
    width: "80%",
    height: undefined,
    aspectRatio: 1,
  },
  
});
