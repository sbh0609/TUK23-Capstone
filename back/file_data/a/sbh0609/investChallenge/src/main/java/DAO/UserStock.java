package DAO;

public class UserStock {
	private String userID;
    private String stockName;
    // 매수 평균 
    private int buyPrice;
    private int stockQuantity;

    public UserStock(String userID, String stockName, int buyPrice, int stockQuantity) {
        this.userID = userID;
        this.stockName = stockName;
        this.buyPrice = buyPrice;
        this.stockQuantity = stockQuantity;

    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getStockName() {
        return stockName;
    }

    public void setStockName(String stockName) {
        this.stockName = stockName;
    }

    public int getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(int buyPrice) {
        this.buyPrice = buyPrice;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}
