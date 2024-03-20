import React from 'react';
import {Background, LoadingText} from './DetailLoadinStyles';
import Spinner from '../resources/DetailSpinner.gif';

export default () => {
  return (
    <Background>
        <LoadingText>잠시만 기다려 주세요.</LoadingText>
        <LoadingText>레포지토리 속성 분석중입니다.</LoadingText>
        <img src={Spinner} alt="로딩중" width="5%" />
    </Background>
  );
};