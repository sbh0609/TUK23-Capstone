import React from "react";
import { useNavigate } from 'react-router-dom';
import styled from "@emotion/styled";
import c_img from '../resources/c img.png';
import cpp_img from '../resources/c++ img.png';
import java_img from '../resources/java img.png';
import js_img from '../resources/js img.png';
import python_img from '../resources/python img.png';
import { useRepository } from './RepositoryContext'; // Context를 가져옵니다.

const Card = ({ name, url, fileList }) => {
    const { setRepositoryDetail } = useRepository();
    const navigate = useNavigate();
    let imagePath = c_img;
    const onClickCard = () => {
        setRepositoryDetail({ name, fileList });
        navigate("/repositoryDetail");
    };
    return (
        <CardContainer onClick={onClickCard} >
            <UserInfo>
                <Name>{name}</Name>
                <Info>URL: {url}</Info>
            </UserInfo>
        </CardContainer>
    );
    
    
    //  switch (phone) {
    //      case "1-770-736-8031 x56442":
    //          imagePath = c_img;
    //          break;
    //      case "010-692-6593 x09125":
    //          imagePath = cpp_img;
    //          break;
    //      case "1-463-123-4447":
    //          imagePath = java_img;
    //          break;
    //      case "493-170-9623 x156":
    //          imagePath = js_img;
    //          break;
    //      case "(254)954-1289":
    //          imagePath = python_img;
    //          break;
    //    case "c":
    //          imagePath = c_img;
    //          break;
    //      case "cpp":
    //          imagePath = cpp_img;
    //          break;
    //      case "java":
    //          imagePath = java_img;
    //          break;
    //      case "js":
    //          imagePath = js_img;
    //          break;
    //      case "python":
    //          imagePath = python_img;
    //          break;
     
    //      default:
    //          break;
    //      }
    //         <img src={imagePath} alt="Image" />
    
    // const onClickCard = () => {


    //     navigate("/repositoryDetail", { 
    //         state: { 
    //           name: name,
    //           url: url,
    //           fileList : fileList
    //         }
    //     });
    // };

    // return (
    //     <CardContainer onClick={onClickCard} >
    //         <UserInfo>
    //             <Name>{name}</Name>
    //             <Info>URL: {url}</Info>
    //         </UserInfo>
    //     </CardContainer>
    // );
    // return (
    //     <CardContainer>
    //         <UserInfo>
    //             <Name>{name}</Name>
    //             <Info>URL: {url}</Info>
    //             {/* 파일 목록 표시 */}
    //             {files && (
    //                 <div>
    //                     <strong>Files:</strong>
    //                     <ul>
    //                         {files.map((file, idx) => (
    //                             <li key={idx}>{file}</li>
    //                         ))}
    //                     </ul>
    //                 </div>
    //             )}
    //         </UserInfo>
    //     </CardContainer>
    // );
};
//<img src={image} alt="https://robohash.org/${}?set=set2&size=180x180" />
export default Card;

const CardContainer = styled.div`
    position: static;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    padding: 10px;
    width: 240px;
    height: 300px;
    margin-top: 30px;
    margin-left: 25px;
    margin-right: 30px;

    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
        rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    img {
        width: 60px;
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
`;

const Name = styled.span`
    font-size: 20px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 30px;
`;
const Info = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-size: 14px;
    padding-top: 10px;
`;
const File = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-size: 10px;
    padding-top: 10px;
`;