package utility;

public class TransactionVO {
	private int transactionId;
	private String userId;
	private String stockId;
	private String transactionType;
	private int quantity;
	private int transactionPrice;
	private String transactionDate;
	
	public int getTransactionId() {
		return transactionId;
	}
	
	public void setTransactionId(Integer transactionId) {
		this.transactionId = transactionId;
	}
	
	public String getUserId() {
		return userId;
	}
	
	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	public String getStockId() {
		return stockId;
	}
	
	public void setStockId(String stockId) {
		this.stockId = stockId;
	}
	
	public String getTransactionType() {
		return transactionType;
	}
	
	public void setTransactionType(String transactionType) {
		this.transactionType = transactionType;
	}
	
	public int getQuantity() {
		return quantity;
	}
	
	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
	
	public int getTransactionPrice() {
		return transactionPrice;
	}
	
	public void setTransactionPrice(Integer transactionPrice) {
		this.transactionPrice = transactionPrice;
	}
	
	public String getTransactionDate() {
		return transactionDate;
	}
	
	public void setTransactionDate(String transactionDate) {
		this.transactionDate = transactionDate;
	}
}