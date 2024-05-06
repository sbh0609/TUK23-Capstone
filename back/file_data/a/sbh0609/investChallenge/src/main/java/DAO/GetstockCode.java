package DAO;
import utility.ConnectDB;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;


public class GetstockCode {
	// 주식 이름에 해당하는 단축 코드를 검색하는 메소드
	
    public String getStockCode(String stockName) {
        ConnectDB db = new ConnectDB();
        db.connect();
        Connection conn = db.getConn();
        String stockCode =  null;

        try {
        	String query = "SELECT `단축코드` FROM `stocklist` WHERE `한글 종목약명` = ?";
            PreparedStatement pstmt = conn.prepareStatement(query);
            pstmt.setString(1, stockName);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                stockCode = rs.getString("단축코드");
            }

            rs.close();
            pstmt.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            db.disconnect(conn);
        }

        return stockCode;
    }
//
//	public static void main(String[] args) {
//		// TODO Auto-generated method stub
//		DbControl getcode = new DbControl();
//		String stockname = "삼성전자";
//		String result = getcode.getStockCode(stockname);
//		System.out.println(result);
//	}

}
