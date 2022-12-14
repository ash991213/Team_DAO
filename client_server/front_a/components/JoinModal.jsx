import { Flex, Select, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Center } from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';

const JoinModal = ({ joinIsOpen, joinOnClose }) => {
  const [email, setEmail] = useState('');
  const [emailCheck, setEmailCheck] = useState('');
  const [domain, setDomain] = useState('');

  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const [mobile, setMobile] = useState('');

  const [emailAuth, setEmailAuth] = useState(false);
  const [emailNum, setEmailNum] = useState([]);
  const [inputEmailNum, setInputEmailNum] = useState([0, 0, 0, 0, 0, 0]);
  const [emailNumCheck, setEmailNumCheck] = useState('');

  const onChange = async (e, type) => {
    switch (type) {
      case 'Email':
        setEmail(e.target.value);
        if (domain === '') {
          setEmailCheck('check domain');
        } else {
          let id = e.target.value + domain;

          const response = await axios.post('http://localhost:4000/api/auth/idCheck', { email: id });

          if (response.data.status === 1) {
            setEmailCheck('true');
          } else {
            setEmailCheck('false');
          }
        }
        if (e.target.value === '') setEmailCheck('');

        break;
      case 'Select':
        setDomain(e.target.value);

        if (email === '') {
          setEmailCheck('');
        } else if (email !== '' && e.target.value === '') {
          setEmailCheck('check domain');
        } else {
          let id = email + e.target.value;

          const response = await axios.post('http://localhost:4000/api/auth/idCheck', { email: id });

          if (response.data.status === 1) {
            setEmailCheck('true');
          } else {
            setEmailCheck('false');
          }

          if (e.target.value === '') setDomain('');
        }
        break;
      case 'Password':
        const passwordCd = /^(?=.*[a-zA-Z])(?=.*[\~\???\!\@\#\$\%\^\&\*\(\)\_\-\+\=\[\]\|\\\;\:\\'\"\<\>\,\.\?\/])(?=.*[0-9]).{9,21}$/;

        if (passwordCd.test(e.target.value)) {
          setPasswordCheck(true);
        } else {
          setPasswordCheck(false);
        }

        if (e.target.value === '') setPasswordCheck('');

        setPassword(e.target.value);
        break;
      case 'Nickname':
        setNickname(e.target.value);
        break;
      default:
        break;
    }
  };

  const auth = async () => {
    const response = await axios.post('http://localhost:4000/api/auth/email', { email: email + domain });

    if (response.data.status) {
      setEmailAuth(true);
      setEmailNum(response.data.number);
      setEmailCheck('');
    }
    console.log(response.data.number);
  };

  const emailAuthInput = () => {
    return emailNum.map((v, k) => {
      return (
        <Input
          maxLength="1"
          fontSize={14}
          key={k}
          onChange={(e) => {
            inputEmailNum[k] = e.target.value;
            setInputEmailNum(inputEmailNum);
          }}
        ></Input>
      );
    });
  };

  const onClose = () => {
    setEmail('');
    setEmailCheck('');
    setDomain('');

    setPassword('');
    setPasswordCheck('');
    setNickname('');
    setMobile('');

    setEmailAuth(false);
    setEmailNum([]);
    setInputEmailNum([0, 0, 0, 0, 0, 0]);
    setEmailNumCheck('');

    joinOnClose();
  };

  const onClick = async () => {
    const body = {
      email: email + domain,
      password,
      nickName: nickname,
      mobile,
    };

    const response = await axios.post('http://localhost:4000/api/auth/SignUp', body);

    if (response.data.status === 1) {
      setEmail('');
      setEmailCheck('');
      setDomain('');

      setPassword('');
      setPasswordCheck('');
      setNickname('');
      setMobile('');

      setEmailAuth(false);
      setEmailNum([]);
      setInputEmailNum([0, 0, 0, 0, 0, 0]);
      setEmailNumCheck('');

      alert('??????????????? ?????????????????????.');

      joinOnClose();
    }
  };

  return (
    <>
      <Modal isOpen={joinIsOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <Input
                variant="flushed"
                placeholder="Email"
                onChange={(e) => {
                  onChange(e, 'Email');
                }}
                w={180}
              />
              <Select
                placeholder="Select Domain"
                w={230}
                ml={2}
                onChange={(e) => {
                  onChange(e, 'Select');
                }}
              >
                <option value="@kakao.com">@kakao.com</option>
                <option value="@naver.com">@naver.com</option>
                <option value="@gmail.com">@gmail.com</option>
              </Select>
              {!emailAuth ? (
                <Button w={120} ml={2} onClick={auth} disabled={emailCheck === 'true' ? false : true}>
                  ????????? ??????
                </Button>
              ) : (
                <Button w={120} ml={2} onClick={auth}>
                  ?????????
                </Button>
              )}
            </Flex>
            {emailAuth ? (
              <>
                <Center mt={5} mb={5}>
                  {emailNumCheck === '' ? <Text style={{ color: 'blue', fontSize: '12px' }}>{'???????????? ?????? ????????? ??????????????????'}</Text> : emailNumCheck ? <Text style={{ color: 'green', fontSize: '12px' }}>{'?????? ????????? ???????????????. ??????????????? ???????????????'}</Text> : <Text style={{ color: 'red', fontSize: '12px' }}>{'?????? ????????? ???????????? ????????????. ??????????????? ?????? ???????????????'}</Text>}
                </Center>
                <Center>
                  <Flex w={250} justifyContent="space-around">
                    {emailAuthInput()}
                  </Flex>
                </Center>
                <Center>
                  <Button
                    mt={5}
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => {
                      if (inputEmailNum.toString() === emailNum.toString()) {
                        setEmailNumCheck(true);
                      } else {
                        setEmailNumCheck(false);
                      }
                    }}
                  >
                    ??????
                  </Button>
                </Center>
              </>
            ) : null}
            {emailCheck === 'check domain' ? <Text style={{ color: 'red' }}>- ???????????? ??????????????????.</Text> : emailCheck === 'true' ? <Text style={{ color: 'green' }}>- ?????? ????????? Email ?????????.</Text> : emailCheck === 'false' ? <Text style={{ color: 'red' }}>- ?????? ???????????? Email ?????????.</Text> : null}
            <Input
              variant="flushed"
              placeholder="Password"
              type="password"
              onChange={(e) => {
                onChange(e, 'Password');
              }}
            />
            {passwordCheck === '' ? null : passwordCheck ? (
              <Center mt={5} mb={5}>
                <Text style={{ color: 'green', fontSize: '12px' }}>?????? ????????? ?????????????????????.</Text>
              </Center>
            ) : (
              <>
                <Center mt={2}>
                  <Text style={{ color: 'red', fontSize: '12px' }}>?????? ???????????? ?????????????????????.</Text>
                </Center>
                <Center mt={2}>
                  <Text style={{ color: 'red', fontSize: '12px' }}>?????????, ????????????, ????????? ???????????? 9~21????????? ??????????????????.</Text>
                </Center>
              </>
            )}
            <Input
              variant="flushed"
              placeholder="Nickname"
              onChange={(e) => {
                onChange(e, 'Nickname');
              }}
            />
            <Input
              variant="flushed"
              placeholder="Mobile Number"
              onChange={(e) => {
                setMobile(e.target.value);
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button width="5rem" colorScheme="teal" mr={3} onClick={onClose}>
              ??????
            </Button>
            <Button width="5rem" colorScheme="teal" mr={3} variant="outline" onClick={onClick} disabled={emailNumCheck && passwordCheck && nickname !== '' ? false : true}>
              ????????????
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default JoinModal;
