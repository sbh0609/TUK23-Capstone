package utility;

public class HoldingVO {
	private int holdingId;
    private String userId;
    private String stockId;
    private int quantity;
    private int averageBuyPrice;
    private int totalPrice;

    public HoldingVO(int holdingId, String userId, String stockId, int quantity, int averageBuyPrice, int totalPrice) {
        this.holdingId = holdingId;
        this.userId = userId;
        this.stockId = stockId;
        this.quantity = quantity;
        this.averageBuyPrice = averageBuyPrice;
        this.totalPrice = totalPrice;
    }

    public int getHoldingId() {
        return holdingId;
    }

    public void setHoldingId(Integer holdingId) {
        this.holdingId = holdingId;
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public int getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(Integer averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
    }

	public int getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(int totalPrice) {
		this.totalPrice = totalPrice;
	}

	public void setHoldingId(int holdingId) {
		this.holdingId = holdingId;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public void setAverageBuyPrice(int averageBuyPrice) {
		this.averageBuyPrice = averageBuyPrice;
	}
   
}