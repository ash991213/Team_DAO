import { Box, Text, Divider, useDisclosure, Center, FormLabel, Button, FormControl, Input } from '@chakra-ui/react';
import { request } from '../utils/axios.js';
import { useEffect, useState } from 'react';
import crypto from 'crypto';
import { deleteCookie } from 'cookies-next';
import LoadingModal from '../components/LoadingModal.jsx';
import Header from '../components/Header.jsx';

const Mypage = ({ hashId, email, user }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [addr, setAddr] = useState('');
  const [mobile, setMobile] = useState('');
  const [pwCheck, setPwCheck] = useState(false); //뒤에 비밀번호 수정
  const [pwdCheck, setPwdCheck] = useState(''); //첫번째 비밀번호입력란
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [loading, setLoading] = useState(true); //로딩바
  const [psError, setpsError] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const pwdFormCheck = (pwd) => {
    const pwdForm = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    if (!pwdForm.test(pwd)) {
      return false;
    }
    return true;
  };

  const getAddress = (e) => {
    setAddr(e.target.value);
  };
  const getName = (e) => {
    setName(e.target.value);
  };
  const getMobile = (e) => {
    setMobile(e.target.value);
  };
  const getAge = (e) => {
    setAge(e.target.value);
  };

  const getNewPw = (e) => {
    setNewPw(e.target.value);
    setpsError(pwdFormCheck(newPw));
  };

  const confirmPw = (e) => {
    setConfirmNewPw(e.target.value);
  };

  const getUserInfo = async () => {
    const response = await request.post(`/Oauth/user/searchUser`, {
      hashId: hashId,
    });

    setName(response.data.name);
    setAddr(response.data.addr);
    setAge(response.data.age);
    setMobile(response.data.mobile);
    setGender(response.data.gender);
  };

  const setPwdCheckfunction = (e) => {
    setPwdCheck(e.target.value); //값을 입력받기위해서 만든함수
  };

  //버튼눌렀을떄 업데이트해주려고
  const checkPwdfunction = () => {
    const userHash = email + pwdCheck;

    const Hash = crypto.createHash('sha256').update(userHash).digest('base64');

    if (hashId === Hash) {
      setPwCheck(true); //true
      getUserInfo();
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  //	비밀번호...수정
  const updatePassword = async (req, res) => {
    setLoading(false);
    onOpen();

    if (psError == false) {
      alert('비밀번호는 영문자, 숫자, 특수문자 조합으로 8~15자리를 사용해주세요.');
      setLoading(true);
      return;
    }

    if (confirmNewPw !== newPw) {
      alert('비밀번호가 일치하지 않습니다.');
      setLoading(true);
      return;
    }

    const body = {
      hashId,
      email,
      newPw,
    };

    const response = await request.post(`/Oauth/user/upDatePassword`, body);

    if (response.data.status == true) {
      onClose();
      alert(response.data.msg);
      deleteCookie('user', { req, res, maxAge: 60 * 60 * 24 * 1000 });
      window.location.replace('/');
    } else {
      alert(response.data.msg);
    }
    setLoading(true);
  };

  const updateUser = async () => {
    setLoading(false);
    onOpen();
    const body = {
      gender,
      name,
      age,
      addr,
      mobile,
      email,
      hashId,
    };

    const response = await request.post(`/Oauth/user/upDateUser`, body);

    if (response.data.status == true) {
      setName(response.data.name);
      setAge(response.data.age);
      setGender(response.data.gender);
      setAddr(response.data.addr);
      setMobile(response.data.mobile);
      setLoading(true);
      alert(response.data.msg);
    } else {
      setLoading(true);
      onClose();
      alert(response.data.msg);
    }
  };

  const deleteUser = async (req, res) => {
    setLoading(false);
    const response = await request.post(`/oauth/user/deleteUser`, {
      hashId,
      email,
    });

    if (response.data.status) {
      onClose();
      deleteCookie('user', { req, res, maxAge: 60 * 60 * 24 * 1000 });
      alert(response.data.msg);
      window.location.replace('/');
    } else {
      alert(response.data.msg);
    }
    setLoading(true);
  };

  useEffect(() => {
    if (hashId) {
      getUserInfo();
    }
  }, []);

  return (
    <>
      <Header user={user} />
      <Center w="100%" h="100%" pt="10%" px="5%" bg="#160627">
        <Box w="40%" m="10% 5% 25% 5%" h={pwCheck ? '100rem' : '55rem'} p="8% 0" px="6%" border="2px solid #fff" borderRadius="1rem">
          {pwCheck === false ? (
            <>
              <Center>
                <Box w="100%">
                  <Text textAlign={'center'} fontSize={'200%'} mb="2rem" color="White">
                    {' '}
                    회원정보
                  </Text>
                </Box>
              </Center>

              <Divider />
              <Text fontSize={'130%'} mt="2rem" mb="1rem" color="White">
                {' '}
                비밀번호 입력
              </Text>
              <Input type="password" style={{ color: 'white' }} placeholder="패스워드를 입력해주세요" id="password" size="md" onChange={setPwdCheckfunction} />

              <Center mt="5%">
                <Button onClick={checkPwdfunction} w="30%" mx="3%">
                  {' '}
                  확인
                </Button>
                <Button
                  onClick={(req, res) => {
                    deleteCookie('user', {
                      req,
                      res,
                      maxAge: 60 * 60 * 24 * 1000,
                    });
                    //        setIsLogin(false);
                    window.location.replace('/');
                  }}
                  color="#160627"
                  w="30%"
                  mx="3%"
                >
                  LOGOUT
                </Button>
              </Center>
            </>
          ) : (
            <Box w="100%" h="100%" pt="5%" px="5%" bg="#160627">
              <FormControl mt="3">
                <Text fontSize={'190%'} w="100%" px="25%" mb="5%" color="white" textAlign={'center'}>
                  회원정보 수정
                </Text>
                <FormLabel fontSize={'125%'} px="2%" mb="3%" color="white">
                  이메일
                </FormLabel>
                <Input type="text" style={{ color: 'white' }} id="userEmail" value={email} size="md" mb="5%" disabled={true} />

                <FormLabel fontSize={'125%'} px="2%" color="white">
                  이름
                </FormLabel>
                <Input type="text" style={{ color: 'white' }} placeholder="이름을 입력해주세요" size="md" mb="5%" value={name} onChange={getName} />

                <FormLabel fontSize={'125%'} px="2%" mb="2%" color="white">
                  성별
                </FormLabel>
                <Input type="text" style={{ color: 'white' }} size="md" mb="5%" value={gender === 'f' ? `여성` : `남성`} disabled={true} />

                <FormLabel fontSize={'125%'} px="2%" color="white">
                  나이
                </FormLabel>
                <Input placeholder="나이를 입력해주세요" style={{ color: 'white' }} mb="5%" size="md" value={age} onChange={getAge} />

                <FormLabel fontSize={'125%'} px="2%" color="white">
                  주소
                </FormLabel>
                <Input type="text" mb="5%" size="md" style={{ color: 'white' }} placeholder="주소를 입력해주세요" value={addr} onChange={getAddress} />

                <FormLabel fontSize={'125%'} px="2%" color="white">
                  전화번호
                </FormLabel>
                <Input type="mobile" mb="5%" size="md" style={{ color: 'white' }} placeholder="전화번호를 입력해주세요" value={mobile} onChange={getMobile} />
              </FormControl>
              {loading ? (
                <Center>
                  <Button color="#160627" m="2rem 0" onClick={updateUser}>
                    변경하기
                  </Button>
                </Center>
              ) : (
                <LoadingModal isOpen={isOpen} onClose={onClose} />
              )}
              <Divider />

              <Text fontSize={'180%'} px="25%" pt="4rem" color="white" textAlign={'center'}>
                비밀 번호 수정
              </Text>

              <FormLabel fontSize={'125%'} px="2%" pt="2rem" color="white">
                변경 할 비밀번호
              </FormLabel>
              <Input type="password" style={{ color: 'white' }} placeholder="패스워드를 입력해주세요" id="password" size="md" onChange={getNewPw} />
              <Text my="4%" px="2%" color={psError == true ? 'green' : 'red'} fontSize="1rem">
                {psError === '' ? null : psError ? '사용 가능한 비밀번호입니다.' : '비밀번호는 영문자, 숫자, 특수문자 포함 8~15자여야 합니다.'}
              </Text>
              <FormLabel fontSize={'140%'} px="2%" pt="2rem" color="white">
                비밀번호 확인
              </FormLabel>
              <Input type="password" style={{ color: 'white' }} placeholder="패스워드를 입력해주세요" id="password" size="md" onChange={confirmPw} />
              {loading ? (
                <Center>
                  {' '}
                  <Button
                    mb="2rem"
                    mt="2rem"
                    color="#160627"
                    disabled={confirmNewPw === newPw ? false : true}
                    onClick={updatePassword} //updatePassword setLoading(false)
                  >
                    변경하기
                  </Button>
                </Center>
              ) : (
                <LoadingModal isOpen={isOpen} onClose={onClose} />
              )}
              <Divider />
              <Text fontSize={'220%'} px="20%" pt="4rem" color="white" textAlign={'center'}>
                {' '}
                회원 탈퇴{' '}
              </Text>

              {loading ? (
                <Center>
                  <Button color="#160627" mb="5%" mt="5%" onClick={deleteUser}>
                    {' '}
                    회원탈퇴버튼
                  </Button>
                </Center>
              ) : (
                <LoadingModal isOpen={isOpen} onClose={onClose} />
              )}
            </Box>
          )}
        </Box>
      </Center>
    </>
  );
};

export default Mypage;
