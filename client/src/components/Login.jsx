import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const loginHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const options = {
        headers: {
          "Content-type": "application/json",
        },
      };
      // console.log(import.meta.env.VITE_BACKEND_BASE_URL);
      const { data } = await axios.post(
        `/api/user/login`,
        { email, password },
        options
      );
      if (!data) {
        throw Error("Some error occured");
      }
      toast({
        title: "User Logged In",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      // console.log(error);
      let errMessage = "";
      if (error.response) {
        errMessage = error.response.data.message;
      }
      toast({
        title: "Error occured",
        description: errMessage || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };
  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => {
            setemail(e.target.value);
          }}
          id={() => {
            return new Date().getTime().toString() + "email";
          }}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <Input
          placeholder="Enter Your Password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          id={() => {
            return new Date().getTime().toString() + "password";
          }}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        mt={1}
        isLoading={loading}
        onClick={loginHandler}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
