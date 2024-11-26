import './gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { auth, signInAnonymouslyFunc } from './FirebaseConfig';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Search from './Search';
import Favourites from './Favourites';
import ShoppingList from './ShoppingList';
import CocktailDetailPage from './CocktailDetailPage';

import { enableScreens } from 'react-native-screens';
import colours from './colours';

enableScreens();

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function SearchStack() { // Defines Stack Navigation for Search
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: styles.stackNavigationHeader, 
      headerTintColor: '#fff',
    }}>
      <Stack.Screen name="Search" component={Search} options={{ headerShown: false }}/>
      <Stack.Screen name="Cocktail Details" component={CocktailDetailPage} options={({ route }) => ({ title: route.params.cocktail.strDrink })}/>
    </Stack.Navigator>
  );
}

function FavouritesStack() { // Defines Stack Navigation for Favourites
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: styles.stackNavigationHeader, 
      headerTintColor: '#fff',
    }}>
      <Stack.Screen name="Search" component={Favourites} options={{ headerShown: false }}/>
      <Stack.Screen name="Cocktail Details" component={CocktailDetailPage} options={({ route }) => ({ title: route.params.cocktail.strDrink })}/>
    </Stack.Navigator>
  );
}

export default function App() {

  useEffect(() => {
    const signInAnonymously = async () => {
      try {
        const userCredential = await signInAnonymouslyFunc(auth);
        console.log("User ID:", userCredential.user.uid);
      } catch (error) {
        console.error("Anonymous sign-in failed:", error);
      }
    };
  
    signInAnonymously();
  }, []);
  return (
    <PaperProvider>
      <StatusBar style="light"/>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Cocktail Search" screenOptions={{
            drawerStyle: styles.drawer,
            drawerActiveTintColor: colours.primary,
            drawerInactiveTintColor: colours.text,
            headerStyle: styles.drawerNavigationHeader, 
            headerTintColor: colours.text,
          }}>
          <Drawer.Screen name="Cocktail Search" component={SearchStack} />
          <Drawer.Screen name="Favourites" component={FavouritesStack} />
          <Drawer.Screen name="Shopping List" component={ShoppingList} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}


const styles = StyleSheet.create({
  drawerNavigationHeader: {
    backgroundColor: colours.primary,  
  },
  drawer: {
    backgroundColor: colours.background,
  },
  stackNavigationHeader: {
    backgroundColor: colours.background,  
  }
});