import styled from 'styled-components';
export const LoadingText = styled.div`
  font: 1rem 'Noto Sans KR';
  text-align: center;
  `;

export const Background = styled.div`
  position: absolute;
  width: 100vw;  /* 원하는 너비로 설정 */
  height: 1200px; /* 원하는 높이로 설정 */
  top: 760px;
  left: 50%;
  transform: translate(-50%, -50%); /* 중앙에 위치하도록 조정 */
  background: #ffffff;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

