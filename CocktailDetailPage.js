import { Text } from 'react-native-paper';
import { View, Image, FlatList, StyleSheet, ScrollView } from 'react-native';

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

    return (
        <ScrollView style={styles.container}>
          <Image source={{ uri: cocktail.strDrinkThumb }} style={{ width: "100%", height: 400, }}/>  
          <View style={styles.description}>
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