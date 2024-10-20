import './gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Search from './Search';
import Favourites from './Favourites';
import ShoppingList from './ShoppingList';


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Cocktail Search">
        <Drawer.Screen name="Cocktail Search" component={Search} />
        <Drawer.Screen name="Favourites" component={Favourites} />
        <Drawer.Screen name="Shopping List" component={ShoppingList} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
