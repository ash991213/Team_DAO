import useRouter from 'next/router';
import { useState, useEffect } from 'react';
import { Button, Divider, Stack, Flex, Box, Image, Text, Center } from '@chakra-ui/react';
import axios from 'axios';
import { getCookie, deleteCookie, setCookie } from 'cookies-next';
import { oauth, oauthBack } from '../../utils/ip';

const BuyItem = ({ user, did }) => {
  const router = useRouter;

  let email;
  let username;

  if (user !== undefined) {
    email = user.email;
    username = user.username;
  } else if (did !== undefined) {
    email = did.stringCookie.email;
    username = did.stringCookie.name;
  }

  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [formattedPrice, setFormattedPrice] = useState(0);

  const [login, setLogin] = useState(false);
  const [point, setPoint] = useState(0);

  const [checkDid, setCheckDid] = useState(false);
  const [token, setToken] = useState(false);
  const [tokenData, setTokenData] = useState('');

  const buyItem = async () => {
    const response = await axios.post('http://localhost:4000/api/auth/usePoint', { email: email, price: formattedPrice });
    if (response.data.status) {
      getPoint();
      alert('구매 완료되었습니다');
    } else {
      alert('구매에 실패하였습니다.');
    }
  };

  const getPoint = async () => {
    const response = await axios.post('http://localhost:4000/api/auth/pointInquiry', { email: email });
    if (response.data.status) {
      setPoint(response.data.point);
    }
  };

  // OAuth의 페이지 요청하는 함수
  const getPage = () => {
    console.log(location.href);
    const site = location.href.split('/')[2];
    const child = window.open(`${oauth}/payment?email=${email}&point=${formattedPrice}&site=${site}`, '', 'width=800, height=600');
  };

  // OAuth에 포인트를 차감 요청할 함수
  const didBuyItem = async (req, res) => {
    const Cookie = getCookie('item');

    const payPoint = JSON.parse(Buffer.from(Cookie.split('.')[1], 'base64').toString('utf-8')).pointInfo;

    const response = await axios.post(`${oauthBack}/Oauth/point/usePoint`, {
      token: Cookie,
      payPoint,
    });

    if (!response.data.isError) {
      alert(response.data.value);
      deleteCookie('item', { req, res, maxAge: 60 * 60 * 24 * 1000 });
      window.location.reload();
    } else {
      alert(response.data.error);
    }
  };

  const showUsePoint = () => {
    let point = 0;
    Object.entries(tokenData).forEach((v) => {
      point += Number(v[1]);
    });
    return point;
  };

  useEffect(() => {
    setImageUrl(router.query.imageUrl);
    setTitle(router.query.title);
    setFormattedPrice(router.query.formattedPrice);

    if (window) {
      window.addEventListener('message', (e, req, res) => {
        if (!getCookie('item') && e.data.type === 'token') {
          setCookie('item', e.data.token, {
            req,
            res,
            maxAge: 60 * 60 * 24 * 1000,
          });
          location.reload();
        }
      });
    }

    if (user) {
      getPoint();
      setLogin(true);
    }

    if (did) {
      setCheckDid(true);
    }

    if (!token) {
      if (getCookie('item')) {
        setTokenData(JSON.parse(Buffer.from(getCookie('item').split('.')[1], 'base64').toString('utf-8')).pointInfo);
        setToken(true);
      }
    }
  });

  return (
    <Box m="10">
      <Text className="tokenText" display="none">
        test
      </Text>
      <Flex>
        <Image flex={1} src={imageUrl} height={700} />
        <Stack flex={1} ml="5" direction="row" p={4}>
          <Divider orientation="vertical" />
          <Flex direction="column">
            <Flex>
              <Box w="40rem" flex={2} pl="0.5rem" pt="1.5rem" borderBottom="1px solid rgba(0, 0, 0, 0.1);">
                <Text fontSize="1.5rem">{title}</Text>
              </Box>
            </Flex>
            <Box w="4 0rem" flex={2} pl="0.5rem" pt="1rem">
              <Center borderBottom="1px solid rgba(0, 0, 0, 0.1);">
                <Text fontSize="1.8rem" fontWeight="bold" pt="10rem" pl="24rem" pb="0.5rem">
                  판매가 : {formattedPrice} P
                </Text>
              </Center>
              {checkDid ? (
                <Center>
                  <Text fontSize="1.5rem" fontWeight="bold" pl="20rem" pt="11rem" pb="1rem"></Text>
                </Center>
              ) : (
                <>
                  <Center pt="0.5rem">
                    <Text fontSize="1.5rem" fontWeight="bold" pb="1rem">
                      Kyungli Mall 포인트 사용
                    </Text>
                  </Center>
                  <Text fontSize="1.5rem" fontWeight="bold" textAlign="right" pt="5rem">
                    {login ? `${user.name}님 보유 포인트 : ${point} P` : null}
                  </Text>
                  <Button w="15rem" colorScheme="teal" variant="outline" ml="24rem" mt="0.5rem" mb="1rem" onClick={buyItem} disabled={formattedPrice <= point ? false : true}>
                    구매
                  </Button>
                  {login && formattedPrice >= point ? (
                    <Center mb="0.5rem">
                      <Text color="red" fontSize="1rem">
                        보유 포인트가 부족합니다.
                      </Text>
                    </Center>
                  ) : null}
                </>
              )}
            </Box>
            <Box w="40rem" flex={2} pl="0.5rem" pt="1rem" borderBottom="1px solid rgba(0, 0, 0, 0.1);">
              {checkDid ? (
                <>
                  <Text textAlign="center" fontSize="1.5rem" fontWeight="bold"></Text>
                  {token ? (
                    <>
                      <Text textAlign="right" fontSize="1.5rem" fontWeight="bold" pt="6rem" pr="0.5rem">
                        {checkDid ? `총 사용 포인트 ${showUsePoint()} P` : '로그인 후 이용가능 합니다'}
                      </Text>
                      <Button w="15rem" colorScheme="teal" variant="outline" ml="24rem" onClick={didBuyItem} mb="1rem">
                        구매
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text textAlign="right" fontSize="1.5rem" fontWeight="bold" pt="7rem" pr="0.5rem">
                        {checkDid ? `${username}님 포인트 조회하기 ` : '로그인 후 이용가능 합니다'}
                      </Text>
                      <Button w="15rem" colorScheme="teal" variant="outline" ml="24rem" onClick={getPage} mb="1rem" disabled={checkDid ? false : true}>
                        조회
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Center>
                  <Text fontSize="1.5rem" fontWeight="bold" pl="20rem" pt="11rem" pb="1rem">
                    DID 등록 후 이용가능 합니다
                  </Text>
                </Center>
              )}
            </Box>
          </Flex>
        </Stack>
      </Flex>
    </Box>
  );
};

export default BuyItem;
