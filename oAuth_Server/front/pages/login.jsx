import {
  Box,
  Button,
  Flex,
  Text,
  Input,
  Image,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { backend } from "../utils/ip";
import { getCookie, setCookie } from "cookies-next";

export default function Home() {
  const [DIDid, setDIDid] = useState(undefined);
  const [DIdPw, setDidPw] = useState(undefined);

  const getId = (e) => {
    setDIDid(e.target.value);
  };

  const getPw = (e) => {
    setDidPw(e.target.value);
  };

  const didLoginHandler = async (req, res) => {
    console.log(DIDid, DIdPw);
    getCookie("ACCESS_TOKEN", "ㅁㄴㅇㄻㄴㄹㅇ", {
      req,
      res,
      maxAge: 60 * 60 * 24 * 1000,
    });
    const codeUrl = location.href;
    const code = codeUrl.split("response_type=")[1];
    const restAPI = codeUrl.split("clientId=")[1].split("&")[0];
    console.log(restAPI);
    const response = await axios.post(`${backend}/oauth/login/authorize`, {
      email: DIDid,
      password: DIdPw,
      code: code,
      restAPI: restAPI,
    });
  };

  return (
    <>
      <Flex w="60%" mx="auto" my="4%" justifyContent={"center"}>
        <Box w="50%" mx="3%" px="5%" py="6%">
          <Text fontSize={"1.5rem"} mb="2%">
            DID login으로 a/b/c/d 사이트를 이용해보세요!
          </Text>
          <Text fontSize="0.75rem" mb="0.5%">
            a/b/c/d 사이트는 DID login으로 이용할 수 있습니다
          </Text>
          <Text fontSize="0.75rem" mb="4%">
            사용 중인 DID계정으로 로그인해 보세요
          </Text>
          <Image
            mr="1%"
            src="https://accounts.kakao.com/assets/weblogin/techin/retina/banner_login2-7800b65948f0912306346a56a61832a98aa302c7e6cf3411eacd35db47d53a3c.png"
          ></Image>
        </Box>

        <Box
          w="35%"
          mx="3%"
          border={"1px"}
          borderColor="gray.200"
          px="5%"
          py="5%"
        >
          <Text fontSize={"2rem"} mb="1rem">
            DID Service
          </Text>
          <FormControl mb="1rem">
            <FormLabel fontSize="xl" mb="2.5">
              Email
            </FormLabel>
            <Input
              type="text"
              placeholder="email을 입력해주세요"
              size="md"
              id="Email"
              mb="7%"
              onChange={getId}
            />

            <FormLabel fontSize="xl" mb="2.5">
              Password
            </FormLabel>
            <Input
              type="password"
              placeholder="password을 입력해주세요"
              size="md"
              id="userPw"
              mb="5%"
              onChange={getPw}
            />
          </FormControl>
          <Button onClick={didLoginHandler} bg="yellow.300" w="100%">
            로그인
          </Button>
        </Box>
      </Flex>
    </>
  );
}
