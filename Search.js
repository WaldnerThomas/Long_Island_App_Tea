import { Text, TextInput, Button, Card, SegmentedButtons, Portal, Modal } from 'react-native-paper';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Image } from 'react-native';
import globalStyles from './globalStyles';
import colours from './colours';


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
    <View style={globalStyles.container}>

        <Portal>
          <Modal visible={loading}>
            <ActivityIndicator size="large" color="lightblue"></ActivityIndicator>
          </Modal>
        </Portal>

      <SegmentedButtons
        style={globalStyles.segmentedButton}
        value={searchNavigation}
        onValueChange={setSearchNavigation}
        buttons={[
          {
            value: "name",
            label: "Name",
            icon: "glass-cocktail", 
            checkedColor: colours.text,
            uncheckedColor: colours.secondaryText,
            style: {
              backgroundColor: searchNavigation === "name" ? colours.primary : colours.secondary,
            },
          },
          {
            value: "ingredient",
            label: "Ingredient",
            icon: "fruit-grapes",
            checkedColor: colours.text,
            uncheckedColor: colours.secondaryText,
            style: {
              backgroundColor: searchNavigation === "ingredient" ? colours.primary : colours.secondary,
            },
          },
          {
             value: "browse",
             label: "Browse",
             icon: "archive-search",
             checkedColor: colours.text,
             uncheckedColor: colours.secondaryText,
             style: {
              backgroundColor: searchNavigation === "browse" ? colours.primary : colours.secondary,
            },
          },
        ]}        
        
      />
      {searchNavigation !== "browse" && ( // TextInput does not get rendered for random drink
      <TextInput
      style={globalStyles.textInput}
        label={searchNavigation === "name" ? "Cocktail Name" : searchNavigation === "ingredient" ? "Cocktail Ingredient" : ""}
        value={keyword}
        onChangeText={text => setKeyword(text)}
        mode='outlined'
        textColor={colours.text}
        outlineColor={colours.text}
        activeOutlineColor= {colours.primary}
        theme={{
          colors: {
               onSurfaceVariant: colours.text // colours the label
          }
      }}
      />  
      )}

      {searchNavigation !== "browse" ? // only render search button for name and ingredient
        <Button
          icon="glass-cocktail"
          contentStyle={globalStyles.buttonContent} // places icon on the right
          style={styles.button}
          labelStyle={globalStyles.buttonLabel}
          mode="outlined"
          onPress={() => searchNavigation === "name" ? fetchCocktails("name") : fetchCocktails("ingredient")}
        >
          Search
        </Button>
        
      : // render browse buttons
        <View style={globalStyles.browseButtons}>
          <Button
            icon="glass-mug-variant"
            contentStyle={globalStyles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={globalStyles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("alcoholic")}
          >
            Alcoholic
          </Button>
          <Button
            icon="glass-mug-variant-off"
            contentStyle={globalStyles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={globalStyles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("non alcoholic")}
          >
            Non Alcoholic
          </Button>
          <Button
            icon="emoticon-dead"
            contentStyle={globalStyles.buttonContent} // places icon on the right
            style={styles.button}
            labelStyle={globalStyles.buttonLabel}
            mode="outlined"
            onPress={() => fetchCocktails("random")}
          >
            Random
          </Button>
        </View>}

      {(!cocktails || cocktails.length <= 0) &&
        <Image
          source={require('./assets/icon.png')}
          style={[globalStyles.logo, globalStyles.logoWithSmallMargin]}
          resizeMode="contain"
        />
      }

      <FlatList
        ref={mainScrollViewRef}
        data={cocktails}
        renderItem={({item}) => 
          <Card style={globalStyles.card} mode="outlined" onPress={() => navigateToDetailPage(item)}>
            <Card.Title title={item.strDrink} subtitle={item.strAlcoholic} titleStyle={globalStyles.itemName} subtitleStyle={{color: item.strAlcoholic === "Alcoholic" ? colours.alcoholic : colours.nonalcoholic}}/>
            <Card.Cover style={globalStyles.cardCover} source={{ uri: item.strDrinkThumb }} />
          </Card>
        }
        ListFooterComponent={
          failedFetchedCocktails.length > 0 ? (
            <Button
              style={globalStyles.footerButton}
              labelStyle={globalStyles.buttonLabel}
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
  button: {
    marginTop: "2%",
    marginBottom: "3%",
    backgroundColor: colours.primary,
    marginHorizontal: "2%",
  },
});
