package utility;


import java.sql.*;

public class ConnectDB {
	
	private Connection conn = null;
	PreparedStatement pstmt = null;
	
	//환경변수 설정
	String dbusername = System.getenv("DB_NAME");
	String dbpassword = System.getenv("DB_PASSWORD");
	
	
	String jdbc_driver = "com.mysql.cj.jdbc.Driver";

	String jdbc_url = "jdbc:mysql://localhost/investchallenge?allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=UTC";

	
	public void connect() {
		try {
			Class.forName(jdbc_driver);
			setConn(DriverManager.getConnection(jdbc_url, dbusername, dbpassword));

		}catch(Exception e) {
			e.printStackTrace();
		}
		
	}
	
  public void disconnect(Connection conn) {
		if (pstmt != null) {
            try {
                pstmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
  }


//	public static void main(String[] args) {
//		ConnectDB db = new ConnectDB();
//        db.connect();
//        
//        if (db.getConn() != null) {
//            System.out.println("데이터베이스 연결 성공!");
//            try {
//                String sql = "SELECT username FROM jdbc_test";
//                PreparedStatement pstmt = db.getConn().prepareStatement(sql);
//                ResultSet rs = pstmt.executeQuery();
//                
//                while (rs.next()) {
//                    String username = rs.getString("username");
//                    System.out.println("Username: " + username);
//                }
//                
//                rs.close();
//                pstmt.close();
//            } catch (SQLException e) {
//                e.printStackTrace();
//            }
//            db.disconnect(db.getConn());
//        } else {
//            System.out.println("데이터베이스 연결 실패.");
//        }
//    }

	public Connection getConn() {
		return conn;
	}

	public void setConn(Connection conn) {
		this.conn = conn;
	}
}
