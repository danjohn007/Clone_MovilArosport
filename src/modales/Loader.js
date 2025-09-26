import { NativeBaseProvider, Spinner, Center, Text, View} from "native-base";
import colors from "../styles/colors";

const Loader = ()=>{

    return(
        <NativeBaseProvider
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          
        }}>
            <View  flex={1} h="100%">

            
            <Center my="50%" >
                <Spinner color={colors.azulMarino} size={100} />
                <Text bold mt={5} fontSize={24} color='black'>Cargando</Text>
            </Center>
          </View>
       
      </NativeBaseProvider>
    )
}
export default Loader;