import { Box, Flex, Text, Img, Checkbox, Divider, Button } from '@chakra-ui/react';
import { request } from '../utils/axios.js';
import { backend, frontend } from '../utils/ip.js';

const userAppRegister = ({ getUserInfo, appName, restAPI, redirectUri, hash, giveUserInfo }) => {
  const attributes = getUserInfo.map((v, k) => {
    return (
      <Box key={k} mb="5%" fontSize={'105%'}>
        <Flex>- {v.att}</Flex>
      </Box>
    );
  });

  const didRegister = async () => {
    const codeUrl = location.href;
    const email = codeUrl.split('?')[1].split('&')[0].split('=')[1];

    const response = await request.post(`/oauth/app/userdidregister`, {
      restAPI,
      email,
      point: 50000,
      hash,
      giveUserInfo,
    });

    if (response.data.status == true) {
      alert(response.data.msg);
      location.href = `${frontend}/login?clientId=${restAPI}&redirectUri=${redirectUri}`;
    }
  };

  return (
    <>
      <Box border="1px" borderColor={'gray.200'} w="35%" mx="auto" my="10%" h="40%" px="5%" py="6%">
        <Flex h="10%" alignItems={'center'} pb="12%">
          <Img src="https://k.kakaocdn.net/14/dn/btqmdPkHR5M/DrrBuObYWlfrBaNkokh3J0/o.jpg" w="15%" />
          <Box w="20%" mx="5%" textAlign={'center'}>
            <Text fontSize={'100%'} pr="15%">
              {appName}
            </Text>
            <Text fontSize={'75%'} color="gray.500" textAlign={'left'} px="7%">
              sila
            </Text>
          </Box>
          <Box w="80%">
            <Text textAlign={'left'} fontSize="5%" mt="2%">
              서비스 제공을 위해, 다음 사용자 정보 제공에 동의해주세요!
            </Text>
          </Box>
        </Flex>

        <Divider orientation="horizontal" my="4%" />

        <Flex h="20%" fontWeight={'800'}>
          <Checkbox>약관 동의하기</Checkbox>
        </Flex>

        <Divider orientation="horizontal" my="4%" />

        <Box py="2%">
          <Flex justifyContent={'space-around'} py="2%">
            <Text fontSize={'80%'}>약관 동의는 다음 정보들의 제공과 제공 목적에 대한 동의를 포함하고 있습니다.</Text>
          </Flex>
          <Flex py="2%">
            <Box>{attributes}</Box>
          </Flex>
          <Flex justifyContent={'center'}>
            <Button onClick={didRegister} mt="5%">
              동의하고 계속하기
            </Button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  //oauthDB에 요청을 보내서 요청 유저 정보 데이터를 가져온다.
  const restAPI = ctx.query.restAPI;
  const email = ctx.query.email;
  const redirectUri = ctx.query.redirectUri;
  const hash = ctx.query.hash;
  const giveUserInfo = ctx.query.giveUserInfo;

  const response = await request.get(`${backend}/oauth/app/giveUserInfo?restAPI=${restAPI}`);

  console.log(response);

  return {
    props: {
      getUserInfo: response.data.infos?.filter(Boolean),
      appName: response.data.appName,
      restAPI,
      email,
      redirectUri,
      hash,
      giveUserInfo,
    },
  };
};

export default userAppRegister;
