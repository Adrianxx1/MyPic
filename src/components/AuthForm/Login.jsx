import {Button, Input} from '@chakra-ui/react';
import { useState } from 'react';
const Login = () => {
      const [inputs, setInputs] = useState({
        email:'',
        password:'',
       
      });
     
  return (
    <>
     <Input 
            placeholder='Correo' 
            fontSize={14} type='email' 
             value={inputs.email}
             size={"sm"}
            onChange={(e) => setInputs({...inputs,email:e.target.value})}
            />
        <Input 
            placeholder='Contraseña' fontSize={14}
            type='password' 
            size={"sm"}
            value={inputs.password}
              onChange={(e) => setInputs({...inputs,password:e.target.value})}
            />

            <Button w={"full"} colorScheme='blue' size={"sm"} fontSize={14} >
          Inicia sesión
        </Button>
    </>
  )
}

export default Login