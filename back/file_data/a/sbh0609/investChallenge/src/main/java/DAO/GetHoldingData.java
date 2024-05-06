package DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import utility.ConnectDB;
import utility.HoldingVO;

public class GetHoldingData {
	public HoldingVO getHoldingRow(String userId, String searchWord) {
        ConnectDB db = new ConnectDB();
        db.connect();
        Connection conn = db.getConn();

        try {
            String query = "SELECT * FROM Holding WHERE user_id = ? AND stock_id = ?";
            PreparedStatement pstmt = conn.prepareStatement(query);
            pstmt.setString(1, userId);
            pstmt.setString(2, searchWord);

            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                // 데이터가 존재하는 경우, HoldingData 객체로 결과를 반환
                return new HoldingVO(
                	rs.getInt("holding_id"),
                    rs.getString("user_id"),
                    rs.getString("stock_id"),
                    rs.getInt("quantity"),
                    rs.getInt("average_buy_price"),
                    rs.getInt("total_price")
                );
            } else {
                // 데이터가 존재하지 않는 경우, null 반환
                return null;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        } finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
		
}
