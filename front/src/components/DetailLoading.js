import React from 'react';
import {Background, LoadingText} from './DetailLoadinStyles';
import Spinner from '../resources/DetailSpinner.gif';

export default () => {
  return (
    <Background>
      <img src={Spinner} alt="로딩중" width="20%" />
        <LoadingText>잠시만 기다려 주세요.</LoadingText>
        <LoadingText>레포지토리 속성 분석중입니다.</LoadingText>
        <LoadingText>ai 모델로 why와 what 유무를 판단하여 커밋 메시지를 평가하였습니다.</LoadingText>
        <LoadingText>복잡도가 높은 파일의 함수를 확인할 수 있습니다.</LoadingText>
        <LoadingText>입력하신 깃허브 사용자 id를 기준으로 해당 저장소를 분석하는 중입니다</LoadingText>
        <LoadingText>분석 대상에는 사용된 언어, 프레임워크, 커밋, pull request, issue, 커밋 메시지의 정확성, 주석, 복잡성이 있습니다</LoadingText>
    </Background>
  );
};