import { Box, Button, Flex, Text, Input, Center, Spinner, Image, FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/react';
import { useState } from 'react';
import { request } from '../utils/axios';
import { setCookie } from 'cookies-next';
import { backend, frontend } from '../utils/ip';
import Header from '../components/Header';
export default function Home({ user }) {
  const [DIDid, setDIDid] = useState(undefined);
  const [DIDPw, setDIDPw] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const getId = (e) => {
    setDIDid(e.target.value);
  };

  const getPw = (e) => {
    setDIDPw(e.target.value);
  };

  const didLoginHandler = async (req, res) => {
    setLoading(false);
    const response = await request.post(`/Oauth/login/localAuthorize`, {
      email: DIDid,
      password: DIDPw,
    });

    if (response.data.status == true) {
      const payload = response.data.token.split('.')[1];
      setCookie('user', payload, {
        req,
        res,
        maxAge: 60 * 60 * 24 * 1000,
      });
      location.href = `${frontend}`;
    } else {
      alert(response.data.msg);
      setLoading(true);
    }
  };

  return (
    <>
      <Header user={user} />
      <Box bg="#160627" w="100%" h="65rem">
        <Flex w="60%" mx="auto" pt="16rem" justifyContent={'center'}>
          <Box w="50%" mx="3%" px="5%" py="6%">
            <Text fontSize={'1.5rem'} mb="2%" color="#fff">
              DID login으로 a/b/c/d 사이트를 이용해보세요!
            </Text>
            <Text fontSize="0.75rem" mb="0.5%" color="#fff">
              a/b/c/d 사이트는 DID login으로 이용할 수 있습니다
            </Text>
            <Text fontSize="0.75rem" mb="4%" color="#fff">
              사용 중인 DID계정으로 로그인해 보세요
            </Text>
            <Image mr="1%" src="https://accounts.kakao.com/assets/weblogin/techin/retina/banner_login2-7800b65948f0912306346a56a61832a98aa302c7e6cf3411eacd35db47d53a3c.png"></Image>
          </Box>

          <Box w="35%" mx="3%" border={'1px'} borderColor="gray.200" px="5%" py="5%">
            <Text fontSize={'2rem'} mb="1rem" color="#fff">
              DID Service
            </Text>
            <FormControl mb="1rem">
              <FormLabel fontSize="xl" mb="2.5" color="#fff">
                Email
              </FormLabel>
              <Input type="text" placeholder="email을 입력해주세요" size="md" id="Email" mb="7%" onChange={getId} style={{ color: 'white' }} />

              <FormLabel fontSize="xl" mb="2.5" color="#fff">
                Password
              </FormLabel>
              <Input type="password" placeholder="password을 입력해주세요" size="md" id="userPw" mb="5%" onChange={getPw} style={{ color: 'white' }} />
            </FormControl>
            {loading ? (
              <>
                <Button onClick={didLoginHandler} color="#160627" w="100%">
                  로그인
                </Button>{' '}
                <Button
                  color="#fff"
                  bg="#160627"
                  border="1px #fff solid"
                  onClick={() => {
                    window.location.replace('/register');
                  }}
                  w="100%"
                  mt="1.5rem"
                >
                  회원가입{' '}
                </Button>
              </>
            ) : (
              <Center>
                <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="lg" />
              </Center>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
}
