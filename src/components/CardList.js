import React from "react";
import Card from "./Card"; // Card 컴포넌트를 import

// 리스트 데이터 예시
const userList = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "456-789-0123" },
    // 다른 사용자 데이터...
];

const UserList = () => {
    return (
        <div>
            {/* userList 배열을 매핑하여 각 사용자에 대한 Card 컴포넌트를 렌더링 */}
            {userList.map(user => (
                <Card
                    key={user.id}
                    name={user.name}
                    email={user.email}
                    phone={user.phone}
                    onClick={() => console.log(`Clicked ${user.name}`)}
                />
            ))}
        </div>
    );
};

export default UserList;