import HeaderTemplate from './styles/HeaderStyle';
import Link from 'next/link';
import { Button, Flex, Center, Text, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import JoinModal from './JoinModal.jsx';
import LoginModal from './LoginModal.jsx';
import MypageDrawer from './MypageDrawer.jsx';
import { deleteCookie } from 'cookies-next';

export default function Home({ user, did }) {
  const [isLogin, setIsLogin] = useState(false);

  const { isOpen: loginIsOpen, onOpen: loginOnOpen, onClose: loginOnClose } = useDisclosure();
  const { isOpen: joinIsOpen, onOpen: joinOnOpen, onClose: joinOnClose } = useDisclosure();
  const { isOpen: MypageIsOpen, onOpen: MypageOnOpen, onClose: MypageOnClose } = useDisclosure();

  useEffect(() => {
    if (user) {
      setIsLogin(true);
    }
    if (did) {
      setIsLogin(true);
    }
  }, []);

  return (
    <>
      <HeaderTemplate>
        <Flex className="header">
          <Link href="/">
            <Center className="logo" h="4rem" fontSize="1.5rem" fontWeight="bold">
              Kyungil MK
            </Center>
          </Link>
          <Flex className="menu">
            <Center flex="1" h="4rem">
              <Text>기간 한정 특가 🙌</Text>
            </Center>
            <Center flex="1" h="4rem">
              <Text>BEST</Text>
            </Center>
            <Center flex="1" h="4rem">
              <Text>NEW</Text>
            </Center>
            <Center flex="1" h="4rem">
              <Text>1인 가구</Text>
            </Center>
            <Center flex="1" h="4rem">
              <Text>선물세트</Text>
            </Center>
            <Center flex="1" h="4rem">
              <Text>EVENT</Text>
            </Center>
          </Flex>
          <Flex className="user">
            {isLogin ? (
              <>
                <Button
                  onClick={(req, res) => {
                    if (user) {
                      deleteCookie('userInfo_C', { req, res, maxAge: 60 * 60 * 24 * 1000 });
                    } else if (did) {
                      deleteCookie('accessToken', { req, res, maxAge: 60 * 60 * 24 * 1000 });
                    }
                    setIsLogin(false);
                    window.location.replace('/');
                  }}
                  colorScheme="blue"
                  variant="outline"
                >
                  LOGOUT
                </Button>
                <Button onClick={MypageOnOpen} colorScheme="blue" variant="outline">
                  PROFILE
                </Button>
              </>
            ) : (
              <>
                <Button onClick={joinOnOpen} colorScheme="blue" variant="outline">
                  JOIN
                </Button>
                <Button onClick={loginOnOpen} colorScheme="blue" variant="outline">
                  LOGIN
                </Button>
              </>
            )}
          </Flex>
          <JoinModal joinIsOpen={joinIsOpen} joinOnClose={joinOnClose} />
          <LoginModal loginIsOpen={loginIsOpen} loginOnClose={loginOnClose} />
          {user ? <MypageDrawer MypageIsOpen={MypageIsOpen} MypageOnClose={MypageOnClose} user={user} /> : null}
          {did ? <MypageDrawer MypageIsOpen={MypageIsOpen} MypageOnClose={MypageOnClose} did={did} /> : null}
        </Flex>
      </HeaderTemplate>
    </>
  );
}
