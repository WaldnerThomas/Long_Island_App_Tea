import { Button, IconButton, Text } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { db, signInAnonymouslyFunc, auth } from './FirebaseConfig';
import { View, FlatList, StyleSheet, Share } from 'react-native';


export default function ShoppingList({ navigation }) {
  const [items, setItems] = useState([]);

  const fetchData = async () => {
  const userCredential = await signInAnonymouslyFunc(auth);
  const itemsRef = ref(db, `${userCredential.user.uid}/shoppinglist/`);
  onValue(itemsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setItems(Object.entries(data).map(([key, value]) => ({ key, value, isChecked: value.isChecked || false}))); // set isChecked to false, if not set
    } else {
      setItems([]);
    }
  });
}


  // TODO: save check to database
  const checkItem = async(itemKey) => {  
    try {  
      const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
      const itemRef = ref(db, `${userCredential.user.uid}/shoppinglist/${itemKey}`);
      await update(itemRef, {isChecked:true});

      setItems((prevItems) => prevItems.map((item) => item.key === itemKey ? {...item, isChecked: true}: item)) // looks for the item and turns isChecked true      
    
    } catch (error) {
      console.error("Error checking item:", error);
    }
  
  }

  const clearShoppinglist = async() => {
    const userCredential = await signInAnonymouslyFunc(auth);   // gets the unique user id
    await remove(ref(db, `${userCredential.user.uid}/shoppinglist`));
  }

  useEffect(() => {   // makes sure the data gets fetched on entering the page
    fetchData()
  }, []);

  const shareShoppinglist = async() => {
    try {
      const result = await Share.share({
          message:`Shoppinglist:\n` +
          items
             .map(item => item.value.isChecked 
              ? `${item.value.amount.toString().split('').map(char => char + '\u0336').join('')} ${item.value.ingredient.split('').map(char => char + '\u0336').join('')}` // crosses out text with unicode character
              : `${item.value.amount} ${item.value.ingredient}`)
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
        : <View style={styles.buttonContainer}>
            <Button
              icon="trash-can-outline"
              contentStyle={styles.buttonContent} // places icon on the right
              style={styles.button}
              labelStyle={styles.buttonLabel}
              mode="outlined"
              onPress={clearShoppinglist}
            >
              Clear List
            </Button>
            <IconButton
                icon="share"
                iconColor="#fff"
                mode="outlined"
                size={30}
                onPress={shareShoppinglist}
              />
          </View>
      }
     <FlatList 
      renderItem={({item}) => 
        <View style={styles.itemList}>
          <Text style={[styles.itemName, item.isChecked && styles.itemChecked]}>
            • {item.value.amount} {item.value.ingredient}</Text>
          {!item.isChecked &&
            <IconButton
              icon="check"
              iconColor="#2ae53b"
              mode="default"
              size={25}
              onPress={() => checkItem(item.key)}
            />
          }
        </View>} 
      data={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232323",  
    paddingHorizontal: "5%",
  },
  itemList: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    color: "#fff",
  },
  button: {
    backgroundColor: "#0098ff"
  },
  buttonLabel: {
    color: "#fff",
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  buttonContainer: {
    marginTop: "2%",
    marginBottom: "3%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemChecked: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});
