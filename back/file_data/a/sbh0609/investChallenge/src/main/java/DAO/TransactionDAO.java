package DAO;

import utility.ConnectDB;

import java.sql.*;
import java.util.List;
import java.util.ArrayList;
import utility.TransactionVO;
import utility.HoldingVO;
import java.util.Date;
import java.text.SimpleDateFormat;

public class TransactionDAO {
	
	public void updateTransaction(String userId, String stockId, String transactionType, int quantity, int transactionPrice) {
		
		if (transactionType.equals("매도")) {
			GetHoldingData ghd = new GetHoldingData();
		    HoldingVO holding = ghd.getHoldingRow(userId, stockId);
		    if (holding == null) {
		    	return;
		    }
		    if (holding.getQuantity() < quantity) {
		    	quantity = holding.getQuantity();
		    }
		}
		
		Date date = new Date();
	    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	    String stringDate = format.format(date);
	    
		ConnectDB db = new ConnectDB();
		db.connect();
		Connection conn = db.getConn();
		String sql = "insert into Transaction(user_id, stock_id, transaction_type, quantity, transaction_price, transaction_date) values(?, ?, ?, ?, ?, ?);";
		try {
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, userId);
			pstmt.setString(2,  stockId);
			pstmt.setString(3, transactionType);
			pstmt.setInt(4, quantity);
			pstmt.setInt(5, transactionPrice);
			pstmt.setString(6, stringDate);
			pstmt.executeUpdate();
		}
		catch (SQLException e) {
	        // SQLException을 통해 데이터베이스 관련 예외를 처리
	        e.printStackTrace();
		}
		finally {
			db.disconnect(conn);
		}
	}
	
	public List<TransactionVO> getTransactionList(String userId) {
		List<TransactionVO> list = new ArrayList<>();
		ConnectDB db = new ConnectDB();
		db.connect();
		Connection conn = db.getConn();
		try {
			String sql = "select * from Transaction where user_id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, userId);
			ResultSet rs = pstmt.executeQuery();
			
			while (rs.next()) {
				TransactionVO transaction = new TransactionVO();
				transaction.setTransactionId(rs.getInt("transaction_id"));
				transaction.setUserId(rs.getString("user_id"));
				transaction.setStockId(rs.getString("stock_id"));
				transaction.setTransactionType(rs.getString("transaction_type"));
				transaction.setQuantity(rs.getInt("quantity"));
				transaction.setTransactionPrice(rs.getInt("transaction_price"));
				transaction.setTransactionDate(rs.getString("transaction_date"));
				
				list.add(transaction);
			}
		}
		catch (SQLException e) {
			e.printStackTrace();
		}
		finally {
			db.disconnect(conn);
		}
		return list;
	}
	
//	public static void main(String[] args) {
//		TransactionDAO tdao = new TransactionDAO();
//		TransactionVO t = new TransactionVO();
//		t.setUserId("umjunsik");
//		t.setStockId("005930");
//		t.setTransactionType("매수");
//		t.setQuantity(7);
//		t.setTransactionPrice(65000);
//		t.setTransactionDate("2023-12-02 23:56:07");
//		
//		tdao.updateTransaction(t);
//	}
}