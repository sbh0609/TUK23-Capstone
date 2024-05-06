package DAO;
import utility.ConnectDB;
import utility.userVO;

import java.sql.*;

public class LoginDAO {
	
	public int add(userVO user) {
		// 아이디, 비밀번호, 유저이름이 null이거나 빈 문자열인 경우
	    if (user.getUserId() == null || user.getUserId().isEmpty() ||
	        user.getUserPassword() == null || user.getUserPassword().isEmpty() ||
	        user.getUserName() == null || user.getUserName().isEmpty()) {
	        return -2;
	    }
	    
		ConnectDB db = new ConnectDB();
		db.connect();
		Connection conn = db.getConn();
		String sql = "insert into User values (?, ?, ?, ?)";
		int result = 0;
		try {
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, user.getUserId());
			pstmt.setString(2, user.getUserName());
			pstmt.setString(3, user.getUserPassword());
			pstmt.setInt(4, user.getTotalAmount());
			result = pstmt.executeUpdate();
		}
		catch (SQLException e) {
	        // SQLException을 통해 데이터베이스 관련 예외를 처리
	        e.printStackTrace();

	        // 아이디 중복 오류인 경우
	        if (e.getErrorCode() == 1062) {
	            result = -1;
	        } else {
	            // 다른 예외 처리 코드 작성 가능
	            result = -3;
	        }
		}
		finally {
			db.disconnect(conn);
		}
		return result;
	}
	
	public userVO login(String id, String pw) {
		ConnectDB db = new ConnectDB();
		db.connect();
		Connection conn = db.getConn();
		userVO user = null;
		String sql = "select * from User where user_id = ? and user_password = ?";
		try {
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,  id);
			pstmt.setString(2,  pw);
			ResultSet rs = pstmt.executeQuery();
			
			if (rs.next()) {
				user = new userVO();
				user.setUserId(rs.getString("user_id"));
				user.setUserPassword(rs.getString("user_password"));
				user.setUserName(rs.getString("user_name"));
			}
		}
		catch (SQLException e) {
			e.printStackTrace();
		}
		finally {
			db.disconnect(conn);
		}
		return user;
	}
}