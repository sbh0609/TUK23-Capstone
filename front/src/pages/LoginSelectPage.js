import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginSelect() {
  const navigate = useNavigate();

  // 버튼 클릭 시 다른 페이지로 이동하는 함수
  const handleButtonClick = (page) => {
    // page 매개변수에 따라 다른 페이지로 이동
    switch (page) {
      case 1:
        navigate('/Temptemp'); // '/page1' 경로로 이동
        break;
      case 2:
        navigate('/login'); // '/page2' 경로로 이동
        break;
      default:
        break;
    }
  };

  return (
    <div className="login-select-container">
      <button className="login-button" onClick={() => handleButtonClick(1)}>Go to Page 1</button>
      <button className="login-button" onClick={() => handleButtonClick(2)}>Go to Page 2</button>
    </div>
  );

}
export default LoginSelect;