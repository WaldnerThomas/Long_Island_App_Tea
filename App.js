import './gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Search from './Search';
import Favourites from './Favourites';
import ShoppingList from './ShoppingList';
import CocktailDetailPage from './CocktailDetailPage';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function SearchStack() { // Defines Stack Navigation for Search
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={Search} options={{ headerShown: false }}/>
      <Stack.Screen name="Cocktail Details" component={CocktailDetailPage} options={({ route }) => ({ title: route.params.cocktail.strDrink })}/>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Cocktail Search">
          <Drawer.Screen name="Cocktail Search" component={SearchStack} />
          <Drawer.Screen name="Favourites" component={Favourites} />
          <Drawer.Screen name="Shopping List" component={ShoppingList} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
