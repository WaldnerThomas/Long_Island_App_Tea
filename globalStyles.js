import { StyleSheet } from 'react-native';
import colours from './colours';

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colours.background,  
        paddingHorizontal: "5%",
    },
    itemName: {
        fontSize: 18,
        color: colours.text,
    },
    textInput: {
        marginTop: "2%",
        backgroundColor: colours.background,
    },
    buttonLabel: {
        color: colours.text,
    },
    buttonContent: {
        flexDirection: "row-reverse",
    },
    footerButton: {
        marginBottom: "5%",
        backgroundColor: colours.primary,
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
    card: {
        marginBottom: "5%",
        backgroundColor: colours.background,
    },
    cardCover: {
        height: 300,
    },
    placeholderText: {
        marginTop: "5%",
        alignSelf: "center",
        fontSize: 25,
        color: colours.text,
        textAlign: "center",
    },
    logo: {
        alignSelf: "center",
        width: "80%",
        height: undefined,
        aspectRatio: 1,
    },
    logoWithLargeMargin: {
        marginTop: "40%",
    },
    logoWithSmallMargin: {
        marginTop: "25%",
    },
});

export default globalStyles;