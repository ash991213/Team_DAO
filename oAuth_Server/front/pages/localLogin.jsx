import { Box, Button, Flex, Text, Input, Center, Spinner, Image, FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { setCookie } from 'cookies-next';
export default function Home() {
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
		//앞에 상태변수를 요청
		setLoading(false);
		const response = await axios.post('http://localhost:8000/Oauth/login/localAuthorize', { email: DIDid, password: DIDPw });
		//보내온 데이터의 status 가 true면,
		//payload 라는변수에 split으로 잘라넣고
		//setCookie(쿠키생성)
		if (response.data.status == true) {
			const payload = response.data.token.split('.')[1];
			setCookie('user', payload, { req, res, maxAge: 60 * 60 * 24 * 1000 });
			location.href = 'http://localhost:8080';
			//다했ㄷ으니 마이페이지로 쿠키와함께 화면전환
		} else {
			alert(response.data.msg);
			setLoading(true);
		}
	};

	return (
		<Box bg='#160627' w='100%' h='59rem'>
			<Flex w='60%' mx='auto' pt='12rem' justifyContent={'center'}>
				<Box w='50%' mx='3%' px='5%' py='6%'>
					<Text fontSize={'1.5rem'} mb='2%' color='#fff' textAlign='center'>
						DID Login으로 다양한 사이트를
						<br />
						하나의 아이디로 이용해보세요!
					</Text>
					<Text fontSize='1rem' m='2% 0' color='#fff' textAlign='center'>
						사용 중인 DID계정으로 로그인해 보세요
					</Text>
					<Image mr='1%' src='https://accounts.kakao.com/assets/weblogin/techin/retina/banner_login2-7800b65948f0912306346a56a61832a98aa302c7e6cf3411eacd35db47d53a3c.png'></Image>
				</Box>

				<Box w='35%' mx='3%' border={'1px'} borderColor='gray.200' px='5%' py='5%'>
					<Text fontSize={'2rem'} mb='1rem' color='#fff'>
						DID Service
					</Text>
					<FormControl mb='1rem'>
						<FormLabel fontSize='xl' mb='2.5' color='#fff'>
							Email
						</FormLabel>
						<Input type='text' placeholder='email을 입력해주세요' size='md' id='Email' mb='7%' onChange={getId} style={{ color: 'white' }} />

						<FormLabel fontSize='xl' mb='2.5' color='#fff'>
							Password
						</FormLabel>
						<Input type='password' placeholder='password을 입력해주세요' size='md' id='userPw' mb='5%' onChange={getPw} style={{ color: 'white' }} />
					</FormControl>
					{loading ? (
						<>
							<Button onClick={didLoginHandler} color='#160627' w='100%'>
								로그인
							</Button>{' '}
							<Button
								color='#160627'
								onClick={() => {
									window.location.replace('/register');
								}}
								w='100%'
								mt='2rem'
							>
								회원가입{' '}
							</Button>
						</>
					) : (
						<Center>
							<Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='blue.500' size='lg' />
						</Center>
					)}
				</Box>
			</Flex>
		</Box>
	);
}