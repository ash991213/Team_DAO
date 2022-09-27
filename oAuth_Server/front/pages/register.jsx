import { Box, Flex, Text, Input, FormControl, FormLabel, Spinner, FormHelperText, Select, Radio, RadioGroup, Stack, useEditable, Checkbox, Center } from '@chakra-ui/react';
import { request } from '../utils/axios.js';
import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { backend, frontend } from '../utils/ip.js';
import { pwdCheck } from '../utils/regiCheck.js';

const register = ({ user }) => {
  const [password, setPassword] = useState(undefined);
  const [psError, setpsError] = useState(false);

  const [sentEmail, setSentEmail] = useState(false);
  const [verifyNum, setVerifyNum] = useState(undefined);

  const [email, setEmail] = useState(undefined);
  const [domain, setDomain] = useState(undefined);
  const [name, setName] = useState(undefined);
  const [gender, setGender] = useState(undefined);
  const [age, setAge] = useState(undefined);
  const [adr, setAdr] = useState(undefined);
  const [phone, setPhone] = useState(undefined);

  const [loading, setLoading] = useState(true);

  const setpwdCheck = (e) => {
    setPassword(e.target.value);
    setpsError(pwdCheck(password));
  };

  const getEmail = (e) => {
    setEmail(e.target.value);
  };

  const domainSelect = (e) => {
    setDomain(e.target.value);
  };

  const getName = (e) => {
    setName(e.target.value);
  };

  const getAdr = (e) => {
    setAdr(e.target.value);
  };

  const getAge = (e) => {
    setAge(e.target.value);
  };

  const selectGender = (e) => {
    setGender(e);
  };

  const getPhone = (e) => {
    setPhone(e.target.value);
  };

  const sendEmail = async () => {
    const tuserPw = document.querySelector('#password').value;
    setPassword(tuserPw);

    if (pwdCheck(tuserPw) == false) {
      alert('비밀번호는 영문자, 숫자, 특수문자 조합으로 8~15자리를 사용해주세요.');
      return;
    }

    const regiEmail = email + domain;

    try {
      const response = await request.post(`${backend}/Oauth/verifyEmail/email`, {
        email: regiEmail,
      });
      setSentEmail(true);
      const verifyArray = response.data.number;
      console.log(verifyArray);
      const verfifyNumber = verifyArray[0] + verifyArray[1] + verifyArray[2] + verifyArray[3] + verifyArray[4] + verifyArray[5];

      setVerifyNum(verfifyNumber);
      invalidation;
    } catch (e) {
      alert(e.message);
    }
  };

  const invalidation = () => {
    setTimeout(setVerifyNum(undefined), 1000 * 60 * 3);
  };

  const verifyAccount = async () => {
    setLoading(false);
    const verifier = document.querySelector('#verifier').value;
    if (verifier == verifyNum) {
      try {
        const regiEmail = email + domain;

        const response = await request.post(`${backend}/Oauth/user/oauthregister`, {
          email: regiEmail,
          password,
          gender,
          name,
          age,
          addr: adr,
          mobile: phone,
        });
        if (response.data.status == 1) {
          alert('회원가입이 완료되었습니다.');
          location.href = `${frontend}`;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('인증 번호가 일치하지 않습니다');
      setLoading(true);
      return;
    }
  };

  return (
    <>
      <Header user={user} />
      <Box display="flex" justifyContent="center" bg="#160627" pt="10%">
        <Box pt="3rem" display="flex" justifyContent="center" w="22%">
          <FormControl mt="3">
            <Text mb="8%" textAlign={'center'} fontSize="300%" fontWeight={'bold'} color="#fff">
              회원 가입
            </Text>
            {sentEmail == false ? (
              <>
                <FormLabel fontSize={'120%'} px="2%" mb="3%" color="#fff">
                  이메일
                </FormLabel>
                <Flex justifyContent={'center'}>
                  <Input type="text" onChange={getEmail} placeholder="email을 입력해주세요" id="userEmail" size="md" mb="7%" style={{ color: 'white' }} />

                  <Select placeholder="Select Domain" size="md" id="domainSelector" onChange={domainSelect} color="#fff">
                    <option value="@kakao.com">@kakao.com</option>
                    <option value="@naver.com">@naver.com</option>
                    <option value="@gmail.com">@gmail.com</option>
                  </Select>
                </Flex>

                <FormLabel fontSize={'120%'} px="2%" color="#fff">
                  이름
                </FormLabel>
                <Input type="text" onChange={getName} placeholder="이름을 입력해주세요" size="md" mb="7%" style={{ color: 'white' }} />

                <FormLabel fontSize={'120%'} px="2%" mb="2%" color="#fff">
                  성별
                </FormLabel>
                <RadioGroup onChange={selectGender} fontSize={'120%'} mb="7%" px="3%">
                  <Stack direction="row">
                    <Radio value="m" mr="2%">
                      <Text color="#fff">남자</Text>
                    </Radio>
                    <Radio value="f" color="#fff">
                      <Text color="#fff">여자</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>

                <FormLabel fontSize={'120%'} px="2%" color="#fff">
                  나이
                </FormLabel>
                <Input placeholder="나이를 입력해주세요" mb="7%" size="md" onChange={getAge} style={{ color: 'white' }} />

                <FormLabel fontSize={'120%'} px="2%" color="#fff">
                  주소
                </FormLabel>
                <Input mb="7%" size="md" placeholder="주소를 입력해주세요" onChange={getAdr} style={{ color: 'white' }} />

                <FormLabel fontSize={'120%'} px="2%" color="#fff">
                  전화번호
                </FormLabel>
                <Input mb="7%" size="md" placeholder="전화번호를 입력해주세요" onChange={getPhone} style={{ color: 'white' }} />

                <FormLabel fontSize={'120%'} px="2%" color="#fff">
                  비밀번호
                </FormLabel>
                <Input type="password" onChange={setpwdCheck} placeholder="패스워드를 입력해주세요" id="password" size="md" style={{ color: 'white' }} />
                <FormHelperText mb="7%" px="2%" color="white">
                  {psError == true ? '사용 가능한 비밀번호입니다.' : '비밀번호는 영문자, 숫자, 특수문자 포함 8~15자여야 합니다.'}
                </FormHelperText>
              </>
            ) : (
              ''
            )}
            {sentEmail == false ? (
              <Input type="submit" value="회원가입" onClick={sendEmail} bg="gray.200" mb="20%" />
            ) : (
              <>
                <Box h="40rem">
                  <Input type="text" placeholder="발송된 6자리 숫자를 입력하세요" id="verifier" style={{ color: 'white' }} />
                  <FormHelperText color="#fff">인증 번호는 3분간 유효합니다.</FormHelperText>
                  {loading ? (
                    <Input type="submit" onClick={verifyAccount} style={{ color: 'white' }} mt="2%" />
                  ) : (
                    <Center>
                      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="md" />
                    </Center>
                  )}
                </Box>
              </>
            )}
          </FormControl>
        </Box>
      </Box>
    </>
  );
};

export default register;
