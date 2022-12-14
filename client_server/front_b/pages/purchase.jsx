import { Box, Button, Flex, Text, Input, Image } from "@chakra-ui/react";

import { useState } from "react";
import axios from "axios";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { oauth, oauthBack } from "../utils/ip";

const Purchase = ({ email, whichCookie, point }) => {
  const router = useRouter();

  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [title, setTitle] = useState("");
  const [exp, setExp] = useState("");

  const [usePoint, setUsePoint] = useState(0);
  const [token, setToken] = useState(false);
  const [tokenData, setTokenData] = useState("");
  const [userCookie, setUserCookie] = useState(whichCookie);

  const toMain = () => {
    location.href = "/";
  };

  const setProductInfo = () => {
    const productInfo = location.href.split("?")[1].split("&");
    setPrice(productInfo[0].split("=")[1].toLocaleString());
    setTitle(decodeURI(productInfo[1].split("=")[1]));
    setImg(productInfo[2].split("=")[1]);
  };

  const getPage = () => {
    document.domain = "localhost";
    const site = location.href.split("/")[2];
    window.open(
      `${oauth}/payment?email=${email}&point=${price}&site=${site}`,
      "",
      "width=800, height=600"
    );
  };

  const getPoint = async () => {
    if (userCookie == "local") {
      const response = await axios.post(
        "http://localhost:4001/api/auth/pointInquiry",
        { email: email }
      );
      if (response.data.status) {
        setUsePoint(response.data.point);
      }
    }
  };

  const buyItem = async () => {
    const returnValue = confirm(
      `선택하신 상품 가격은 ${price}원입니다. 
      구매하시겠습니까? \n 남은 포인트: ${usePoint}원`
    );
    if (returnValue !== false) {
      const response = await axios.post(
        "http://localhost:4001/api/auth/usePoint",
        { email, price }
      );
      if (response.data.status) {
        getPoint();
        alert("구매 완료되었습니다");
      } else {
        alert("구매에 실패하였습니다.");
      }
    }
  };

  const didBuyItem = async (req, res) => {
    const Cookie = getCookie("item");

    const payPoint = JSON.parse(
      Buffer.from(Cookie.split(".")[1], "base64").toString("utf-8")
    ).pointInfo;

    const response = await axios.post(`${oauthBack}/Oauth/point/usePoint`, {
      token: Cookie,
      payPoint,
    });

    if (!response.data.isError) {
      alert(response.data.value);
      deleteCookie("item", { req, res, maxAge: 60 * 60 * 24 * 1000 });
      window.location.reload();
    } else {
      alert(response.data.error);
    }
  };

  useEffect(() => {
    getPoint();
    setProductInfo();
    setUserCookie(whichCookie);
    if (window) {
      window.addEventListener("message", (e, req, res) => {
        if (!getCookie("item") && e.data.type === "token") {
          setCookie("item", e.data.token, {
            req,
            res,
            maxAge: 60 * 60 * 24 * 1000,
          });
          location.reload();
        }
      });
    }

    if (!token) {
      if (getCookie("item")) {
        setTokenData(
          JSON.parse(
            Buffer.from(getCookie("item").split(".")[1], "base64").toString(
              "utf-8"
            )
          ).pointInfo
        );
        setToken(true);
      }
    }
  });

  return (
    <>
      <Box w="65%" h="41rem" mx="auto" my="0" px="5%" py="6%">
        <Box
          w="55%"
          border="1px"
          borderColor={"gray.200"}
          h="100%"
          mx="auto"
          my="0"
          p="5%"
          textAlign={"center"}
          boxShadow="xs"
        >
          <Image src={img} mx="auto" my="0" w="100%" mb="4%" />

          <Box fontSize={"150%"} mb="3%">
            {title}
          </Box>
          <Box mb="8%" fontSize={"120%"}>
            {price} KRW
          </Box>
          <Box>
            {userCookie == "local" ? (
              <Flex justifyContent={"center"} mb="2%">
                <Button
                  colorScheme={"blue"}
                  variant="outline"
                  mx="2%"
                  w="30%"
                  onClick={buyItem}
                >
                  구매하기
                </Button>
                <Button
                  colorScheme={"blue"}
                  variant="outline"
                  mx="2%"
                  w="30%"
                  onClick={toMain}
                >
                  취소
                </Button>
              </Flex>
            ) : (
              ""
            )}
          </Box>
          {userCookie == "local" ? (
            ""
          ) : (
            <>
              {token == false ? (
                <Button onClick={getPage} mt="2%">
                  다른 사이트 포인트 사용
                </Button>
              ) : (
                <Button onClick={didBuyItem}>구매</Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Purchase;
