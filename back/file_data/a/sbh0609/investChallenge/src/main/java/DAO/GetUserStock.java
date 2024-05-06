package DAO;
import utility.ConnectDB;
import utility.HoldingVO;

import java.util.List;
import java.util.ArrayList;
import utility.userVO;
import DAO.UserStock;
import service.GetapiData;

import java.sql.*;


public class GetUserStock {
	GetstockCode gsc = new GetstockCode();
	GetapiData gad = new GetapiData();
	
	public List<HoldingVO> getUserStock(String userID) {
		System.out.println("야호");
		List<HoldingVO> userStockList = new ArrayList<>();
		ConnectDB db = new ConnectDB();
		db.connect();
		Connection conn = db.getConn();
		try {
			String sql = "SELECT * FROM holding WHERE user_id = ?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1,  userID);
			ResultSet rs = pstmt.executeQuery();
			
			while (rs.next()) {
				HoldingVO userStock = new HoldingVO(
						rs.getInt("holding_id"),
                        rs.getString("user_id"),
                        rs.getString("stock_id"),
                        rs.getInt("quantity"),
                        rs.getInt("average_buy_price"),
                        rs.getInt("total_price")
                );
				 userStockList.add(userStock);
				
			}
			rs.close();
			pstmt.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		finally {
			db.disconnect(conn);
		}
		return userStockList;
	}
	 public List<Integer> getStockInfo (HoldingVO userStock) {
	    	String stockName = ((HoldingVO) userStock).getStockId();
	    	String stockCode = gsc.getStockCode(stockName);
	    	String realPrice = gad.LiveStockPrice(stockCode);
	    	
	    	int intRealPrice = (realPrice != null) ? Integer.parseInt(realPrice) : 0;
	    	//평가손익
	    	int profitLossValuation = (intRealPrice - ((HoldingVO)userStock).getAverageBuyPrice()) * ((HoldingVO)userStock).getQuantity();
	    	//수익률
	    	double rateOfReturn = ((double) profitLossValuation / (((HoldingVO)userStock).getAverageBuyPrice() * ((HoldingVO)userStock).getQuantity())) * 100;
	    	//평가금액
	    	int marketValue = intRealPrice * ((HoldingVO)userStock).getQuantity();
	    	
	    	//리스트의 첫인자 intRealPrice 두번째 인자 profitLossValuation 세번째 인자 rateOfReturn 네번째 인자 marketValue
	    	List<Integer> result = new ArrayList<>();
	    	result.add(intRealPrice);
	    	result.add(profitLossValuation);
	    	result.add((int) rateOfReturn); 
	    	result.add(marketValue);
	    	return result;
	    	}
}