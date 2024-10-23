import { Text, IconButton } from 'react-native-paper';
import { View, Image, FlatList, StyleSheet, ScrollView, Share } from 'react-native';

export default function CocktailDetailPage({ route }) {
    const {cocktail} = route.params;

    const ingredients = []; // Creates an Array of the ingredients with their measurements
    for (let i = 1; i <= 15; i++) { // Ingredients start at 1; 15 is the limit of ingredients of the API
        const ingredient = cocktail[`strIngredient${i}`];
        const measure = cocktail[`strMeasure${i}`];

        if (ingredient) { // There can be ingredients without measurements
            ingredients.push({ ingredient, measure });
        }
    }

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

    return (
        <ScrollView style={styles.container}>
          <Image source={{ uri: cocktail.strDrinkThumb }} style={{ width: "100%", height: 400, }}/>  
          <View style={styles.description}>
            <IconButton
              icon="share"
              mode="outlined"
              size={30}
              onPress={ShareCocktail}
            />
            <Text variant="titleMedium">{cocktail.strAlcoholic}</Text>
            <View style={styles.paragraph}>
                <Text variant="titleMedium">Ingredients:</Text>
                {ingredients.map((item, index) => (     // No Flatlist, because a Flatlist in Scrollview can lead to problems
                        <Text key={index} variant="bodyMedium">
                            {item.measure}{item.ingredient}
                        </Text>
                    ))}
            </View>
            <View style={styles.paragraph}>
                <Text variant="titleMedium">Instructions:</Text>
                <Text variant="bodyMedium">{cocktail.strInstructions}</Text>
            </View>
          </View>
        </ScrollView>
      );
    
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",  
    },
    description: {
      padding: "3%",
    },
    paragraph: {
      marginTop: "5%",
    },

  });