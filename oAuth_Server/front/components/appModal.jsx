import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, FormControl, FormLabel, Input } from "@chakra-ui/react";
import axios from 'axios';
import { backend } from '../utils/ip.js'
import { useState, useEffect } from "react";


const AppModal = ({isOpen, onClose}) => {
    const [ appName, setAppName ] = useState(undefined)
    const email = '619049@naver.com'

    const getRestApi = async() => {
        if(!appName) {
            alert('어플리케이션 이름을 설정해주세요')
            return;
        }
        
        try {
            const response = await axios.post(`${backend}/oauth/app/apiDistribution`, {appName, email: email})
            if(response.data.status == true) {
                alert(response.data.msg)
                onClose()
            }
            else {
                alert(response.data.msg)
            }
        }
        catch(e) {
            console.log(e.message)
        }

    }
    
    return(
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton px='5%' py='7%'/>
        
                    <ModalBody px='8%' pt='10%' pb='2%'>
                        <FormControl>
                            <FormLabel fontSize='150%' mb='3%' textAlign={'center'}>어플리케이션 생성</FormLabel>
                            <Input type='text' 
                            placeholder='어플리케이션 이름을 입력해주세요' 
                            size='md' id='Email' mb='1%'
                            onChange={(e) => setAppName(e.target.value) }
                            />
                        </FormControl>
                    </ModalBody>
        
                    <ModalFooter mb='8' px='20' justifyContent='center'>
                        <Button onClick={getRestApi}>어플리케이션 생성</Button>
                    </ModalFooter>

                </ModalContent>
            </Modal>
        </>
    )
}

export default AppModal;