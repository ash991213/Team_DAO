import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { frontend, backend, oauth } from "../utils/ip.js";
import { getCookie, setCookie } from "cookies-next";
import Link from "next/link.js";

const LoginModal = ({ isOpen, onClose }) => {
  const loginHandler = async ({ req, res }) => {
    try {
      const userEmail = document.querySelector("#Email").value;
      const userPw = document.querySelector("#userPw").value;
      const response = await axios.post(`${backend}/api/auth/login`, {
        userEmail,
        userPw,
      });
      const [header, payload, signature] = response.data.token.split(".");
      setCookie("loginInfo", payload, {
        req,
        res,
        maxAge: 60 * 60 * 24 * 1000,
      });
      location.href = `${frontend}`;
    } catch (e) {
      alert("Email/Password를 확인해주세요");
      console.error(e);
    }
  };

  const didLoginHandler = () => {
    console.log("did login req");
    location.href = `${backend}/api/oauth/DIDLogin`;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton px="8" py="8" />

          <ModalBody px="5rem" pt="4rem" pb="6">
            <FormControl>
              <FormLabel fontSize="2xl" mb="2.5">
                Email
              </FormLabel>
              <Input
                type="text"
                placeholder="email을 입력해주세요"
                size="md"
                id="Email"
                mb="5"
              />

              <FormLabel fontSize="2xl" mb="2.5">
                Password
              </FormLabel>
              <Input
                type="password"
                placeholder="password을 입력해주세요"
                size="md"
                id="userPw"
                mb="5"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter mb="8" px="20" justifyContent="space-between">
            <Button
              onClick={loginHandler}
              colorScheme="blue"
              w="32"
              m="0.25rem"
            >
              login
            </Button>
            <Button
              onClick={didLoginHandler}
              colorScheme="blue"
              w="32"
              m="0.25rem"
            >
              DID login
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginModal;
