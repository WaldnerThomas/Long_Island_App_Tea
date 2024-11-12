import { IconButton, Text } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { View, FlatList, StyleSheet, Share } from 'react-native';


export default function ShoppingList({ navigation }) {
  const [items, setItems] = useState([]);

  const fetchData = async() => {
    const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
    const itemsRef = ref(db, `${userCredential.user.uid}/shoppinglist/`);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setItems(Object.entries(data).map(([key, value]) => ({key,value})));
        
      } else {
        setItems([]);
      }
    })  
  }

  const deleteItem = async(item) => {
    const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
    await remove(ref(db, `${userCredential.user.uid}/shoppinglist/${item}`));
  }

  useEffect(() => {   // makes sure the data gets fetched on entering the page
    fetchData()
  }, []);

  const shareShoppinglist = async() => {
    try {
      const result = await Share.share({
          message:`Shoppinglist:\n` +
          items
             .map(item => `${item.value.amount} ${item.value.ingredient}`)
             .join('\n')
      });
  } catch (error) {
      alert(error.message);
    }
  }

  return (
    <View style={styles.container}>
      {
        items.length === 0 ? <Text style={styles.itemName}>Your shopping list is empty</Text>
        : <IconButton
            icon="share"
            mode="outlined"
            size={30}
            onPress={shareShoppinglist}
          />
      }
     <FlatList 
      renderItem={({item}) => 
        <View style={styles.itemList}>
          <Text style={styles.itemName}>
            • {item.value.amount} {item.value.ingredient}</Text>
          <IconButton
            icon="check"
            iconColor="green"
            mode="default"
            size={25}
            onPress={() => deleteItem(item.key)}
          />
        </View>} 
      data={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: "5%",
  },
  itemList: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
  }
});
